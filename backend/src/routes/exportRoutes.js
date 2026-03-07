const express = require('express');
const { auth, authorize } = require('../middlewares/auth');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const SlumSurvey = require('../models/SlumSurvey');
const HouseholdSurvey = require('../models/HouseholdSurvey');
const Slum = require('../models/Slum');
const surveySections = require('../config/surveySections');

const router = express.Router();

/**
 * Helper function to insert section headers into worksheet
 * @param {ExcelJS.Worksheet} worksheet - The Excel worksheet
 * @param {number} startRow - The row number to start inserting headers
 * @param {Array} sections - Array of section objects from config
 * @returns {number} - Next available row after inserting headers
 */
const insertSectionHeaders = (worksheet, startRow, sections) => {
  let currentRow = startRow;
  
  sections.forEach((section) => {
    // Insert merged header row for section
    const headerRow = worksheet.getRow(currentRow);
    
    // Merge cells across all columns for section header
    const totalColumns = worksheet.columnCount;
    headerRow.getCell(1).value = section.label;
    headerRow.getCell(1).font = { bold: true, size: 12 };
    headerRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' } // Light gray background
    };
    headerRow.getCell(1).border = {
      top: { style: 'thick' },
      bottom: { style: 'thick' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };
    headerRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
    
    // Merge cells if there are multiple columns
    if (totalColumns > 1) {
      worksheet.mergeCells(currentRow, 1, currentRow, totalColumns);
    }
    
    currentRow++;
    
    // If section has subSections, add those too
    if (section.subSections) {
      section.subSections.forEach((subSection) => {
        const subHeaderRow = worksheet.getRow(currentRow);
        subHeaderRow.getCell(1).value = `  ${subSection.label}`;
        subHeaderRow.getCell(1).font = { bold: true, size: 11, italic: true };
        subHeaderRow.getCell(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE8E8E8' } // Slightly lighter gray
        };
        subHeaderRow.getCell(1).border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        if (totalColumns > 1) {
          worksheet.mergeCells(currentRow, 1, currentRow, totalColumns);
        }
        
        currentRow++;
      });
    }
  });
  
  return currentRow;
};

// Export slum surveys to Excel
router.get('/slum-surveys', auth, authorize('ADMIN', 'SUPERVISOR'), async (req, res) => {
  try {
    const { slumId, columns } = req.query;
    
    let filter = {};
    if (slumId) {
      filter.slum = slumId;
    }

    const surveys = await SlumSurvey.find(filter)
      .populate({
        path: 'slum',
        select: 'slumName location city ward',
        populate: {
          path: 'ward',
          select: 'number name zone'
        }
      })
      .populate('surveyor', 'name username')
      .populate('submittedBy', 'name username')
      .sort({ createdAt: -1 });

    if (surveys.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No slum surveys found.'
      });
    }

    // Create Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Slum Surveys');

    // Get column configuration based on selected columns or use all fields
    let selectedFields = [];
    if (columns && columns.trim() !== '') {
      const selectedColumnKeys = columns.split(',');
      surveySections.slumSurveySections.forEach(section => {
        if (section.subSections) {
          section.subSections.forEach(subSection => {
            subSection.fields.forEach(field => {
              if (selectedColumnKeys.includes(field.key)) {
                selectedFields.push(field);
              }
            });
          });
        } else {
          section.fields.forEach(field => {
            if (selectedColumnKeys.includes(field.key)) {
              selectedFields.push(field);
            }
          });
        }
      });
    } else {
      // Use all fields from all sections
      surveySections.slumSurveySections.forEach(section => {
        if (section.subSections) {
          section.subSections.forEach(subSection => {
            selectedFields.push(...subSection.fields);
          });
        } else {
          selectedFields.push(...section.fields);
        }
      });
    }

    // Define columns with multi-level headers (Section -> SubSection -> Question)
    // Build hierarchical column structure
    const buildHierarchicalColumns = () => {
      const columns = [];
      
      selectedFields.forEach(field => {
        // Find which section and subsection this field belongs to
        let fieldSection = null;
        let fieldSubSection = null;
        
        surveySections.slumSurveySections.forEach(section => {
          if (section.subSections) {
            section.subSections.forEach(sub => {
              if (sub.fields.some(f => f.key === field.key)) {
                fieldSection = section.label;
                fieldSubSection = sub.label;
              }
            });
          } else {
            if (section.fields.some(f => f.key === field.key)) {
              fieldSection = section.label;
            }
          }
        });
        
        columns.push({
          header: [fieldSection || '', fieldSubSection || '', field.label],
          key: field.key,
          width: Math.max(15, Math.min(25, field.label.length + 2))
        });
      });
      
      return columns;
    };

    // Define columns with hierarchical headers
    worksheet.columns = buildHierarchicalColumns();
    
    // Style the multi-level header rows
    // Row 1: Section headers (merged across columns in same section)
    // Row 2: Subsection headers OR merged vertically with Row 1 for non-subsection sections
    // Row 3: Question labels
    
    const sectionRanges = [];
    let currentStart = 1;
    
    selectedFields.forEach((field, idx) => {
      const isLast = idx === selectedFields.length - 1;
      const nextField = selectedFields[idx + 1];
      
      // Find section for current field
      let currentSection = null;
      let hasSubSections = false;
      surveySections.slumSurveySections.forEach(section => {
        if (section.subSections) {
          if (section.subSections.some(sub => sub.fields.some(f => f.key === field.key))) {
            currentSection = section.id; // Use ID to check for Demographic Profile
            hasSubSections = true;
          }
        } else {
          if (section.fields.some(f => f.key === field.key)) {
            currentSection = section.id;
          }
        }
      });
      
      // Check if next field has different section
      let nextSection = null;
      if (nextField) {
        surveySections.slumSurveySections.forEach(section => {
          if (section.subSections) {
            if (section.subSections.some(sub => sub.fields.some(f => f.key === nextField.key))) {
              nextSection = section.id;
            }
          } else {
            if (section.fields.some(f => f.key === nextField.key)) {
              nextSection = section.id;
            }
          }
        });
      }
      
      if (isLast || currentSection !== nextSection) {
        sectionRanges.push({ 
          start: currentStart, 
          end: idx + 1, 
          sectionId: currentSection,
          hasSubSections 
        });
        currentStart = idx + 2;
      }
    });
    
    // Apply section headers in row 1
    sectionRanges.forEach(range => {
      const cell = worksheet.getRow(1).getCell(range.start);
      const sectionLabel = surveySections.slumSurveySections.find(s => s.id === range.sectionId)?.label || '';
      
      // For sections WITHOUT subsections: merge Row 1 and Row 2 vertically and set the label
      if (!range.hasSubSections) {
        cell.value = sectionLabel;
        cell.font = { bold: true, size: 11 };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF2E86AB' } // Teal blue for sections
        };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        if (range.end > range.start) {
          worksheet.mergeCells(1, range.start, 2, range.end);
        }
      } else {
        // For Demographic Profile (has subsections): set label in row 1 and merge horizontally only
        cell.value = sectionLabel;
        cell.font = { bold: true, size: 11 };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF2E86AB' } // Teal blue for sections
        };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        if (range.end > range.start) {
          worksheet.mergeCells(1, range.start, 1, range.end);
        }
      }
    });
    
    // Apply subsection headers in row 2 (only for Demographic Profile - Section 6)
    let subsectionStart = 1;
    let currentSubSection = null;
    let inDemographicProfile = false;
    
    selectedFields.forEach((field, idx) => {
      const isLast = idx === selectedFields.length - 1;
      const nextField = selectedFields[idx + 1];
      
      // Check if we're in Demographic Profile section
      let inDemoProfile = false;
      surveySections.slumSurveySections.forEach(section => {
        if (section.id === 'demographic_profile' && section.subSections) {
          if (section.subSections.some(sub => sub.fields.some(f => f.key === field.key))) {
            inDemoProfile = true;
          }
        }
      });
      
      if (inDemoProfile) {
        inDemographicProfile = true;
        
        // Find subsection for current field
        let foundSubSection = null;
        surveySections.slumSurveySections.forEach(section => {
          if (section.id === 'demographic_profile' && section.subSections) {
            section.subSections.forEach(sub => {
              if (sub.fields.some(f => f.key === field.key)) {
                foundSubSection = sub.label;
              }
            });
          }
        });
        
        // Check if next field has different subsection OR if this is the last field
        const shouldCloseSubSection = isLast || (nextField && (() => {
          let nextSubSection = null;
          surveySections.slumSurveySections.forEach(section => {
            if (section.id === 'demographic_profile' && section.subSections) {
              section.subSections.forEach(sub => {
                if (sub.fields.some(f => f.key === nextField.key)) {
                  nextSubSection = sub.label;
                }
              });
            }
          });
          return foundSubSection !== nextSubSection;
        })());
        
        if (shouldCloseSubSection && foundSubSection && foundSubSection !== currentSubSection) {
          const cell = worksheet.getRow(2).getCell(subsectionStart);
          cell.value = foundSubSection;
          cell.font = { bold: true, size: 10, italic: true };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF5DA9D9' } // Lighter blue for subsections
          };
          cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, italic: true };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          };
          
          // Merge cells for this subsection - merge from subsectionStart to current index (inclusive)
          if (idx >= subsectionStart) {
            worksheet.mergeCells(2, subsectionStart, 2, idx + 1);
          }
          
          subsectionStart = idx + 2;
          currentSubSection = foundSubSection;
        }
      } else {
        // Not in Demographic Profile - skip row 2 for this column (already merged vertically)
        subsectionStart = idx + 2;
      }
    });
    
    // Row 3: Question labels - use contrasting color
    worksheet.getRow(3).eachCell(cell => {
      cell.font = { bold: true, size: 9 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFA8D5E2' } // Very light blue for questions
      };
      cell.font = { color: { argb: 'FF000000' }, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    
    // Set row heights for header rows
    worksheet.getRow(1).height = 30;
    worksheet.getRow(2).height = 25;
    worksheet.getRow(3).height = 35;

    // Prepare data for Excel - Map ALL fields from SlumSurvey model
    const excelData = surveys.map(survey => ({
      // Survey Metadata
      surveyId: survey._id.toString(),
      slumName: survey.slum?.slumName || '',
      submittedAt: survey.submittedAt ? new Date(survey.submittedAt).toISOString() : '',
      submittedBy: survey.submittedBy ? (survey.submittedBy.name || survey.submittedBy.username || 'Unknown') : '',
      
      // Section 1: General Information (excluding cityTown which doesn't exist in model)
      stateCode: survey.generalInformation?.stateCode || '',
      stateName: survey.generalInformation?.stateName || '',
      districtCode: survey.generalInformation?.districtCode || '',
      districtName: survey.generalInformation?.districtName || '',
      ulbCode: survey.generalInformation?.ulbCode || '',
      ulbName: survey.generalInformation?.ulbName || '',
      cityTownCode: survey.generalInformation?.cityTownCode || '',
      cityTownNoHouseholds: survey.generalInformation?.cityTownNoHouseholds || '',
      
      // Section 2: Slum Profile
      slumType: survey.cityTownSlumProfile?.slumType || '',
      slumIdField: survey.cityTownSlumProfile?.slumIdField || '',
      areaSqMtrs: survey.cityTownSlumProfile?.areaSqMtrs || '',
      slumPopulation: survey.cityTownSlumProfile?.slumPopulation || '',
      noSlumHouseholds: survey.cityTownSlumProfile?.noSlumHouseholds || '',
      bplPopulation: survey.cityTownSlumProfile?.bplPopulation || '',
      bplHouseholds: survey.cityTownSlumProfile?.bplHouseholds || '',
      
      // Section 3: Survey Operation
      surveyorName: survey.surveyOperation?.surveyorName || '',
      surveyDate: survey.surveyOperation?.surveyDate || '',
      
      // Section 4: Basic Information (excluding slumNameBasicInfo which doesn't exist in model)
      wardNumber: survey.basicInformation?.wardNumber || '',
      wardName: survey.basicInformation?.wardName || '',
      zoneNumber: survey.basicInformation?.zoneNumber || '',
      ageSlumYears: survey.basicInformation?.ageSlumYears || '',
      locationCoreOrFringe: survey.basicInformation?.locationCoreOrFringe || '',
      typeAreaSurrounding: survey.basicInformation?.typeAreaSurrounding || '',
      physicalLocationSlum: survey.basicInformation?.physicalLocationSlum || '',
      
      // Section 5: Land Status
      ownershipLandDetail: survey.landStatus?.ownershipLandDetail || '',
      ownershipLandSpecify: survey.landStatus?.ownershipLandSpecify || '',
      
      // Section 6: Demographics - Total Population
      popSC: survey.demographicProfile?.totalPopulation?.SC || 0,
      popST: survey.demographicProfile?.totalPopulation?.ST || 0,
      popOBC: survey.demographicProfile?.totalPopulation?.OBC || 0,
      popOthers: survey.demographicProfile?.totalPopulation?.Others || 0,
      popTotal: survey.demographicProfile?.totalPopulation?.Total || 0,
      popMinorities: survey.demographicProfile?.totalPopulation?.Minorities || 0,
      
      // BPL Population
      bplSC: survey.demographicProfile?.bplPopulation?.SC || 0,
      bplST: survey.demographicProfile?.bplPopulation?.ST || 0,
      bplOBC: survey.demographicProfile?.bplPopulation?.OBC || 0,
      bplOthers: survey.demographicProfile?.bplPopulation?.Others || 0,
      bplTotal: survey.demographicProfile?.bplPopulation?.Total || 0,
      bplMinorities: survey.demographicProfile?.bplPopulation?.Minorities || 0,
      
      // Households
      hhSC: survey.demographicProfile?.numberOfHouseholds?.SC || 0,
      hhST: survey.demographicProfile?.numberOfHouseholds?.ST || 0,
      hhOBC: survey.demographicProfile?.numberOfHouseholds?.OBC || 0,
      hhOthers: survey.demographicProfile?.numberOfHouseholds?.Others || 0,
      hhTotal: survey.demographicProfile?.numberOfHouseholds?.Total || 0,
      hhMinorities: survey.demographicProfile?.numberOfHouseholds?.Minorities || 0,
      
      // Women Headed Households
      whhSC: survey.demographicProfile?.womenHeadedHouseholds?.SC || 0,
      whhST: survey.demographicProfile?.womenHeadedHouseholds?.ST || 0,
      whhOBC: survey.demographicProfile?.womenHeadedHouseholds?.OBC || 0,
      whhOthers: survey.demographicProfile?.womenHeadedHouseholds?.Others || 0,
      whhTotal: survey.demographicProfile?.womenHeadedHouseholds?.Total || 0,
      whhMinorities: survey.demographicProfile?.womenHeadedHouseholds?.Minorities || 0,
      
      // BPL Households
      bplHhSC: survey.demographicProfile?.numberOfBplHouseholds?.SC || 0,
      bplHhST: survey.demographicProfile?.numberOfBplHouseholds?.ST || 0,
      bplHhOBC: survey.demographicProfile?.numberOfBplHouseholds?.OBC || 0,
      bplHhOthers: survey.demographicProfile?.numberOfBplHouseholds?.Others || 0,
      bplHhTotal: survey.demographicProfile?.numberOfBplHouseholds?.Total || 0,
      bplHhMinorities: survey.demographicProfile?.numberOfBplHouseholds?.Minorities || 0,
      
      // Persons > 65 Years (Senior Citizens)
      seniorSC: survey.demographicProfile?.personsOlderThan65Years?.SC || 0,
      seniorST: survey.demographicProfile?.personsOlderThan65Years?.ST || 0,
      seniorOBC: survey.demographicProfile?.personsOlderThan65Years?.OBC || 0,
      seniorOthers: survey.demographicProfile?.personsOlderThan65Years?.Others || 0,
      seniorTotal: survey.demographicProfile?.personsOlderThan65Years?.Total || 0,
      seniorMinorities: survey.demographicProfile?.personsOlderThan65Years?.Minorities || 0,
      
      // Child Labourers
      childLabourSC: survey.demographicProfile?.childLabourers?.SC || 0,
      childLabourST: survey.demographicProfile?.childLabourers?.ST || 0,
      childLabourOBC: survey.demographicProfile?.childLabourers?.OBC || 0,
      childLabourOthers: survey.demographicProfile?.childLabourers?.Others || 0,
      childLabourTotal: survey.demographicProfile?.childLabourers?.Total || 0,
      childLabourMinorities: survey.demographicProfile?.childLabourers?.Minorities || 0,
      
      // Physically Challenged
      physicallyChallengedSC: survey.demographicProfile?.physicallyChallengedPersons?.SC || 0,
      physicallyChallengedST: survey.demographicProfile?.physicallyChallengedPersons?.ST || 0,
      physicallyChallengedOBC: survey.demographicProfile?.physicallyChallengedPersons?.OBC || 0,
      physicallyChallengedOthers: survey.demographicProfile?.physicallyChallengedPersons?.Others || 0,
      physicallyChallengedTotal: survey.demographicProfile?.physicallyChallengedPersons?.Total || 0,
      physicallyChallengedMinorities: survey.demographicProfile?.physicallyChallengedPersons?.Minorities || 0,
      
      // Mentally Challenged
      mentallyChallengedSC: survey.demographicProfile?.mentallyChallengedPersons?.SC || 0,
      mentallyChallengedST: survey.demographicProfile?.mentallyChallengedPersons?.ST || 0,
      mentallyChallengedOBC: survey.demographicProfile?.mentallyChallengedPersons?.OBC || 0,
      mentallyChallengedOthers: survey.demographicProfile?.mentallyChallengedPersons?.Others || 0,
      mentallyChallengedTotal: survey.demographicProfile?.mentallyChallengedPersons?.Total || 0,
      mentallyChallengedMinorities: survey.demographicProfile?.mentallyChallengedPersons?.Minorities || 0,
      
      // HIV/AIDS
      hivAidsSC: survey.demographicProfile?.personsWithHivAids?.SC || 0,
      hivAidsST: survey.demographicProfile?.personsWithHivAids?.ST || 0,
      hivAidsOBC: survey.demographicProfile?.personsWithHivAids?.OBC || 0,
      hivAidsOthers: survey.demographicProfile?.personsWithHivAids?.Others || 0,
      hivAidsTotal: survey.demographicProfile?.personsWithHivAids?.Total || 0,
      hivAidsMinorities: survey.demographicProfile?.personsWithHivAids?.Minorities || 0,
      
      // Tuberculosis
      tuberculosisSC: survey.demographicProfile?.personsWithTuberculosis?.SC || 0,
      tuberculosisST: survey.demographicProfile?.personsWithTuberculosis?.ST || 0,
      tuberculosisOBC: survey.demographicProfile?.personsWithTuberculosis?.OBC || 0,
      tuberculosisOthers: survey.demographicProfile?.personsWithTuberculosis?.Others || 0,
      tuberculosisTotal: survey.demographicProfile?.personsWithTuberculosis?.Total || 0,
      tuberculosisMinorities: survey.demographicProfile?.personsWithTuberculosis?.Minorities || 0,
      
      // Respiratory Diseases
      respiratorySC: survey.demographicProfile?.personsWithRespiratoryDiseases?.SC || 0,
      respiratoryST: survey.demographicProfile?.personsWithRespiratoryDiseases?.ST || 0,
      respiratoryOBC: survey.demographicProfile?.personsWithRespiratoryDiseases?.OBC || 0,
      respiratoryOthers: survey.demographicProfile?.personsWithRespiratoryDiseases?.Others || 0,
      respiratoryTotal: survey.demographicProfile?.personsWithRespiratoryDiseases?.Total || 0,
      respiratoryMinorities: survey.demographicProfile?.personsWithRespiratoryDiseases?.Minorities || 0,
      
      // Other Chronic Diseases
      chronicSC: survey.demographicProfile?.personsWithOtherChronicDiseases?.SC || 0,
      chronicST: survey.demographicProfile?.personsWithOtherChronicDiseases?.ST || 0,
      chronicOBC: survey.demographicProfile?.personsWithOtherChronicDiseases?.OBC || 0,
      chronicOthers: survey.demographicProfile?.personsWithOtherChronicDiseases?.Others || 0,
      chronicTotal: survey.demographicProfile?.personsWithOtherChronicDiseases?.Total || 0,
      chronicMinorities: survey.demographicProfile?.personsWithOtherChronicDiseases?.Minorities || 0,
      
      // Children Not in School (6-14 years)
      childrenNSMale: survey.demographicProfile?.schoolDropoutsMale?.Total || 0,
      childrenNSFemale: survey.demographicProfile?.schoolDropoutsFemale?.Total || 0,
      childrenNSTotal: (survey.demographicProfile?.schoolDropoutsMale?.Total || 0) + (survey.demographicProfile?.schoolDropoutsFemale?.Total || 0),
      
      // Illiterate Adults - All caste breakdowns
      illiterateTotal: survey.demographicProfile?.totalIlliteratePerson?.Total || 0,
      illiterateSC: survey.demographicProfile?.totalIlliteratePerson?.SC || 0,
      illiterateST: survey.demographicProfile?.totalIlliteratePerson?.ST || 0,
      illiterateOBC: survey.demographicProfile?.totalIlliteratePerson?.OBC || 0,
      illiterateOthers: survey.demographicProfile?.totalIlliteratePerson?.Others || 0,
      illiterateMinorities: survey.demographicProfile?.totalIlliteratePerson?.Minorities || 0,
      
      illiterateMale: survey.demographicProfile?.maleIlliterate?.Total || 0,
      illiterateMaleSC: survey.demographicProfile?.maleIlliterate?.SC || 0,
      illiterateMaleST: survey.demographicProfile?.maleIlliterate?.ST || 0,
      illiterateMaleOBC: survey.demographicProfile?.maleIlliterate?.OBC || 0,
      illiterateMaleOthers: survey.demographicProfile?.maleIlliterate?.Others || 0,
      illiterateMaleMinorities: survey.demographicProfile?.maleIlliterate?.Minorities || 0,
      
      illiterateFemale: survey.demographicProfile?.femaleIlliterate?.Total || 0,
      illiterateFemaleSC: survey.demographicProfile?.femaleIlliterate?.SC || 0,
      illiterateFemaleST: survey.demographicProfile?.femaleIlliterate?.ST || 0,
      illiterateFemaleOBC: survey.demographicProfile?.femaleIlliterate?.OBC || 0,
      illiterateFemaleOthers: survey.demographicProfile?.femaleIlliterate?.Others || 0,
      illiterateFemaleMinorities: survey.demographicProfile?.femaleIlliterate?.Minorities || 0,
      
      // BPL Illiterate - All caste breakdowns
      bplIlliterateTotal: survey.demographicProfile?.bplIlliteratePerson?.Total || 0,
      bplIlliterateSC: survey.demographicProfile?.bplIlliteratePerson?.SC || 0,
      bplIlliterateST: survey.demographicProfile?.bplIlliteratePerson?.ST || 0,
      bplIlliterateOBC: survey.demographicProfile?.bplIlliteratePerson?.OBC || 0,
      bplIlliterateOthers: survey.demographicProfile?.bplIlliteratePerson?.Others || 0,
      bplIlliterateMinorities: survey.demographicProfile?.bplIlliteratePerson?.Minorities || 0,
      
      // School Dropouts Male - All caste breakdowns
      schoolDropoutMaleSC: survey.demographicProfile?.schoolDropoutsMale?.SC || 0,
      schoolDropoutMaleST: survey.demographicProfile?.schoolDropoutsMale?.ST || 0,
      schoolDropoutMaleOBC: survey.demographicProfile?.schoolDropoutsMale?.OBC || 0,
      schoolDropoutMaleOthers: survey.demographicProfile?.schoolDropoutsMale?.Others || 0,
      schoolDropoutMaleMinorities: survey.demographicProfile?.schoolDropoutsMale?.Minorities || 0,
      
      // School Dropouts Female - All caste breakdowns
      schoolDropoutFemaleSC: survey.demographicProfile?.schoolDropoutsFemale?.SC || 0,
      schoolDropoutFemaleST: survey.demographicProfile?.schoolDropoutsFemale?.ST || 0,
      schoolDropoutFemaleOBC: survey.demographicProfile?.schoolDropoutsFemale?.OBC || 0,
      schoolDropoutFemaleOthers: survey.demographicProfile?.schoolDropoutsFemale?.Others || 0,
      schoolDropoutFemaleMinorities: survey.demographicProfile?.schoolDropoutsFemale?.Minorities || 0,
      
      // Section 7: Housing Status
      dwellingPucca: survey.housingStatus?.dwellingUnitsPucca || 0,
      dwellingSemiPucca: survey.housingStatus?.dwellingUnitsSemiPucca || 0,
      dwellingKatcha: survey.housingStatus?.dwellingUnitsKatcha || 0,
      dwellingTotal: survey.housingStatus?.dwellingUnitsTotal || 0,
      electricityPucca: survey.housingStatus?.dwellingUnitsWithElectricityPucca || 0,
      electricitySemiPucca: survey.housingStatus?.dwellingUnitsWithElectricitySemiPucca || 0,
      electricityKatcha: survey.housingStatus?.dwellingUnitsWithElectricityKatcha || 0,
      electricityTotal: survey.housingStatus?.dwellingUnitsWithElectricityTotal || 0,
      landPatta: survey.housingStatus?.landTenureWithPatta || 0,
      landPossession: survey.housingStatus?.landTenurePossessionCertificate || 0,
      landEncroachedPrivate: survey.housingStatus?.landTenureEncroachedPrivate || 0,
      landEncroachedPublic: survey.housingStatus?.landTenureEncroachedPublic || 0,
      landRented: survey.housingStatus?.landTenureOnRent || 0,
      landOther: survey.housingStatus?.landTenureOther || 0,
      landTotal: survey.housingStatus?.landTenureTotal || 0,
      
      // Section 8: Economic Status
      incomeLessThan500: survey.economicStatus?.lessThan500 || 0,
      income500to1000: survey.economicStatus?.rs500to1000 || 0,
      income1000to1500: survey.economicStatus?.rs1000to1500 || 0,
      income1500to2000: survey.economicStatus?.rs1500to2000 || 0,
      income2000to3000: survey.economicStatus?.rs2000to3000 || 0,
      incomeMoreThan3000: survey.economicStatus?.moreThan3000 || 0,
      
      // Section 9: Employment
      selfEmployed: survey.employmentAndOccupation?.selfEmployed || 0,
      salaried: survey.employmentAndOccupation?.salaried || 0,
      regularWage: survey.employmentAndOccupation?.regularWage || 0,
      casualLabour: survey.employmentAndOccupation?.casualLabour || 0,
      employmentOthers: survey.employmentAndOccupation?.others || 0,
      
      // Section 10: Physical Infrastructure
      waterPipelines: survey.physicalInfrastructure?.sourceDrinkingWater?.tankPond || '',
      waterTaps: survey.physicalInfrastructure?.sourceDrinkingWater?.individualTap || '',
      waterBorewells: survey.physicalInfrastructure?.sourceDrinkingWater?.tubewellBorewellHandpump || '',
      connectivityCityWater: survey.physicalInfrastructure?.connectivityCityWaterSupply || '',
      drainageSewerage: survey.physicalInfrastructure?.drainageSewerageFacility || '',
      connectivityStorm: survey.physicalInfrastructure?.connectivityStormWaterDrainage || '',
      connectivitySewerage: survey.physicalInfrastructure?.connectivitySewerageSystem || '',
      proneToFlooding: survey.physicalInfrastructure?.proneToFlooding || '',
      // Latrine Facility - flattened structure with all sub-fields
      latrineOwnSepticFlush: survey.physicalInfrastructure?.latrineFacility?.ownSepticTankFlushLatrine || '',
      latrineOwnDry: survey.physicalInfrastructure?.latrineFacility?.ownDryLatrine || '',
      latrineSharedSepticFlush: survey.physicalInfrastructure?.latrineFacility?.sharedSepticTankFlushLatrine || '',
      latrineSharedDry: survey.physicalInfrastructure?.latrineFacility?.sharedDryLatrine || '',
      latrineCommunitySepticFlush: survey.physicalInfrastructure?.latrineFacility?.communitySepticTankFlushLatrine || '',
      latrineCommunityDry: survey.physicalInfrastructure?.latrineFacility?.communityDryLatrine || '',
      latrineOpenDefecation: survey.physicalInfrastructure?.latrineFacility?.openDefecation || '',
      wasteFreq: survey.physicalInfrastructure?.solidWasteManagement?.frequencyOfGarbageDisposal || '',
      wasteArrangement: survey.physicalInfrastructure?.solidWasteManagement?.arrangementForGarbageDisposal || '',
      drainsClearance: survey.physicalInfrastructure?.solidWasteManagement?.frequencyOfClearanceOfOpenDrains || '',
      approachRoadType: survey.physicalInfrastructure?.approachRoadType || '',
      distanceMotorableRoad: survey.physicalInfrastructure?.distanceToNearestMotorableRoad || '',
      internalRoadType: survey.physicalInfrastructure?.internalRoadType || '',
      streetLightAvailable: survey.physicalInfrastructure?.streetLightAvailable || '',
      
      // Section 11: Education Facilities
      anganwadiOption: survey.educationFacilities?.anganwadiUnderIcds?.option || '',
      anganwadiDistance: survey.educationFacilities?.anganwadiUnderIcds?.distance || 0,
      municipalPreschoolOption: survey.educationFacilities?.municipalPreschool?.option || '',
      municipalPreschoolDistance: survey.educationFacilities?.municipalPreschool?.distance || 0,
      privatePreschoolOption: survey.educationFacilities?.privatePreschool?.option || '',
      privatePreschoolDistance: survey.educationFacilities?.privatePreschool?.distance || 0,
      municipalPrimarySchoolOption: survey.educationFacilities?.municipalPrimarySchool?.option || '',
      municipalPrimarySchoolDistance: survey.educationFacilities?.municipalPrimarySchool?.distance || 0,
      statePrimarySchoolOption: survey.educationFacilities?.stateGovtPrimarySchool?.option || '',
      statePrimarySchoolDistance: survey.educationFacilities?.stateGovtPrimarySchool?.distance || 0,
      privatePrimarySchoolOption: survey.educationFacilities?.privatePrimarySchool?.option || '',
      privatePrimarySchoolDistance: survey.educationFacilities?.privatePrimarySchool?.distance || 0,
      municipalHighSchoolOption: survey.educationFacilities?.municipalHighSchool?.option || '',
      municipalHighSchoolDistance: survey.educationFacilities?.municipalHighSchool?.distance || 0,
      stateHighSchoolOption: survey.educationFacilities?.stateGovtHighSchool?.option || '',
      stateHighSchoolDistance: survey.educationFacilities?.stateGovtHighSchool?.distance || 0,
      privateHighSchoolOption: survey.educationFacilities?.privateHighSchool?.option || '',
      privateHighSchoolDistance: survey.educationFacilities?.privateHighSchool?.distance || 0,
      adultEducationOption: survey.educationFacilities?.adultEducationCentre?.option || '',
      adultEducationDistance: survey.educationFacilities?.adultEducationCentre?.distance || 0,
      nonFormalEducationOption: survey.educationFacilities?.nonFormalEducationCentre?.option || '',
      nonFormalEducationDistance: survey.educationFacilities?.nonFormalEducationCentre?.distance || 0,
      
      // Section 12: Health Facilities
      urbanHealthPost: survey.healthFacilities?.urbanHealthPost || '',
      primaryHealthCentre: survey.healthFacilities?.primaryHealthCentre || '',
      governmentHospital: survey.healthFacilities?.governmentHospital || '',
      maternityCentre: survey.healthFacilities?.maternityCentre || '',
      privateClinic: survey.healthFacilities?.privateClinic || '',
      rmp: survey.healthFacilities?.rmp || '',
      ayurvedicDoctor: survey.healthFacilities?.ayurvedicDoctor || '',
      
      // Section 13: Social Development/Welfare
      communityHall: survey.socialDevelopment?.communityHall || 0,
      livelihoodProductionCentre: survey.socialDevelopment?.livelihoodProductionCentre || 0,
      vocationalTrainingCentre: survey.socialDevelopment?.vocationalTrainingCentre || 0,
      streetChildrenRehabilitationCentre: survey.socialDevelopment?.streetChildrenRehabilitationCentre || 0,
      nightShelter: survey.socialDevelopment?.nightShelter || 0,
      oldAgeHome: survey.socialDevelopment?.oldAgeHome || 0,
      oldAgePensionsHolders: survey.socialDevelopment?.oldAgePensionsHolders || 0,
      widowPensionsHolders: survey.socialDevelopment?.widowPensionsHolders || 0,
      disabledPensionsHolders: survey.socialDevelopment?.disabledPensionsHolders || 0,
      generalInsuranceCovered: survey.socialDevelopment?.generalInsuranceCovered || 0,
      healthInsuranceCovered: survey.socialDevelopment?.healthInsuranceCovered || 0,
      selfHelpGroups: survey.socialDevelopment?.selfHelpGroups || 0,
      thriftCreditSocieties: survey.socialDevelopment?.thriftCreditSocieties || 0,
      slumDwellersAssociation: survey.socialDevelopment?.slumDwellersAssociation || '',
      youthAssociations: survey.socialDevelopment?.youthAssociations || 0,
      womensAssociations: survey.socialDevelopment?.womensAssociations || 0,
      
      // Section 14: Additional Infrastructure Requirements - Water Supply
      waterPipelinesExisting: survey.additionalInfrastructure?.waterSupply?.pipelines?.existing || 0,
      waterPipelinesAdditional: survey.additionalInfrastructure?.waterSupply?.pipelines?.additionalRequirement || 0,
      waterPipelinesCost: survey.additionalInfrastructure?.waterSupply?.pipelines?.estimatedCost || 0,
      waterTapsExisting: survey.additionalInfrastructure?.waterSupply?.individualTaps?.existing || 0,
      waterTapsAdditional: survey.additionalInfrastructure?.waterSupply?.individualTaps?.additionalRequirement || 0,
      waterTapsCost: survey.additionalInfrastructure?.waterSupply?.individualTaps?.estimatedCost || 0,
      waterBorewellsExisting: survey.additionalInfrastructure?.waterSupply?.borewells?.existing || 0,
      waterBorewellsAdditional: survey.additionalInfrastructure?.waterSupply?.borewells?.additionalRequirement || 0,
      waterBorewellsCost: survey.additionalInfrastructure?.waterSupply?.borewells?.estimatedCost || 0,
      
      // Drainage/Sewerage
      stormwaterDrainageExisting: survey.additionalInfrastructure?.drainageSewerage?.stormwaterDrainage?.existing || 0,
      stormwaterDrainageAdditional: survey.additionalInfrastructure?.drainageSewerage?.stormwaterDrainage?.additionalRequirement || 0,
      stormwaterDrainageCost: survey.additionalInfrastructure?.drainageSewerage?.stormwaterDrainage?.estimatedCost || 0,
      sewerLinesExisting: survey.additionalInfrastructure?.drainageSewerage?.sewerLines?.existing || 0,
      sewerLinesAdditional: survey.additionalInfrastructure?.drainageSewerage?.sewerLines?.additionalRequirement || 0,
      sewerLinesCost: survey.additionalInfrastructure?.drainageSewerage?.sewerLines?.estimatedCost || 0,
      
      // Roads
      internalRoadsCCExisting: survey.additionalInfrastructure?.roads?.internalRoadsCC?.existing || 0,
      internalRoadsCCAdditional: survey.additionalInfrastructure?.roads?.internalRoadsCC?.additionalRequirement || 0,
      internalRoadsCCCost: survey.additionalInfrastructure?.roads?.internalRoadsCC?.estimatedCost || 0,
      
      // Street Lighting
      streetLightPolesExisting: survey.additionalInfrastructure?.streetLighting?.poles?.existing || 0,
      streetLightPolesAdditional: survey.additionalInfrastructure?.streetLighting?.poles?.additionalRequirement || 0,
      streetLightPolesCost: survey.additionalInfrastructure?.streetLighting?.poles?.estimatedCost || 0,
      
      // Sanitation
      individualToiletsExisting: survey.additionalInfrastructure?.sanitation?.individualToilets?.existing || 0,
      individualToiletsAdditional: survey.additionalInfrastructure?.sanitation?.individualToilets?.additionalRequirement || 0,
      individualToiletsCost: survey.additionalInfrastructure?.sanitation?.individualToilets?.estimatedCost || 0,
      
      // Community Facilities
      communityHallsExisting: survey.additionalInfrastructure?.communityFacilities?.communityHalls?.existing || 0,
      communityHallsAdditional: survey.additionalInfrastructure?.communityFacilities?.communityHalls?.additionalRequirement || 0,
      communityHallsCost: survey.additionalInfrastructure?.communityFacilities?.communityHalls?.estimatedCost || 0,
      
      // Standalone Infrastructure
      electricityExisting: survey.additionalInfrastructure?.standaloneInfrastructureRequirements?.electricity?.existing || 0,
      electricityAdditional: survey.additionalInfrastructure?.standaloneInfrastructureRequirements?.electricity?.additionalRequirement || 0,
      electricityCost: survey.additionalInfrastructure?.standaloneInfrastructureRequirements?.electricity?.estimatedCost || 0,
      healthCareExisting: survey.additionalInfrastructure?.standaloneInfrastructureRequirements?.healthCare?.existing || 0,
      healthCareAdditional: survey.additionalInfrastructure?.standaloneInfrastructureRequirements?.healthCare?.additionalRequirement || 0,
      healthCareCost: survey.additionalInfrastructure?.standaloneInfrastructureRequirements?.healthCare?.estimatedCost || 0,
      
      // Survey Metadata
      surveyStatus: survey.surveyStatus,
      completionPercentage: survey.completionPercentage,
      createdAt: survey.createdAt.toISOString(),
      submittedAt: survey.submittedAt ? survey.submittedAt.toISOString() : ''
    }));

    // Add rows to worksheet
    excelData.forEach(data => worksheet.addRow(data));

    // Ensure temp directory exists
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Write Excel file
    const filePath = path.join(__dirname, '../temp/slum_surveys.xlsx');
    await workbook.xlsx.writeFile(filePath);

    // Generate filename with slum name, ID and timestamp
    const slumName = surveys[0]?.slum?.slumName ? 
      surveys[0].slum.slumName.replace(/\s+/g, '_') : 'All_Slums';
    const surveySlumId = surveys[0]?.slum?.slumId || '';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                      new Date().toISOString().split('T')[1].split('.')[0];
    const fileName = `Slum_Survey_${slumName}_${surveySlumId}_${timestamp}.xlsx`;

    // Send file
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Clean up temp file after sending
      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }, 1000);
    });

  } catch (error) {
    console.error('Export slum surveys error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error exporting slum surveys.'
    });
  }
});

// Export household surveys to Excel
router.get('/household-surveys/:slumId', auth, authorize('ADMIN', 'SUPERVISOR'), async (req, res) => {
  try {
    const { slumId } = req.params;
    const { columns } = req.query;

    // Validate slum exists
    const slum = await Slum.findById(slumId);
    if (!slum) {
      return res.status(404).json({
        success: false,
        message: 'Slum not found.'
      });
    }

    // Get only SUBMITTED surveys for this slum
    const surveys = await HouseholdSurvey.find({ slum: slumId, surveyStatus: 'SUBMITTED' })
      .populate('surveyor', 'name username')
      .populate('submittedBy', 'name username')
      .sort({ createdAt: -1 });

    if (surveys.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No household surveys found for this slum.'
      });
    }

    // Create Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Household Surveys');

    // Get column configuration based on selected columns or use all fields
    let selectedFields = [];
    if (columns && columns.trim() !== '') {
      const selectedColumnKeys = columns.split(',');
      surveySections.householdSurveySections.forEach(section => {
        section.fields.forEach(field => {
          if (selectedColumnKeys.includes(field.key)) {
            selectedFields.push(field);
          }
        });
      });
    } else {
      // Use all fields from all sections
      surveySections.householdSurveySections.forEach(section => {
        selectedFields.push(...section.fields);
      });
    }

    // Define columns with multi-level headers (Section -> Question)
    // Build hierarchical column structure for household survey
    const buildHierarchicalColumns = () => {
      const columns = [];
      
      selectedFields.forEach(field => {
        // Find which section this field belongs to
        let fieldSection = null;
        
        surveySections.householdSurveySections.forEach(section => {
          if (section.fields.some(f => f.key === field.key)) {
            fieldSection = section.label;
          }
        });
        
        columns.push({
          header: [fieldSection || '', field.label],
          key: field.key,
          width: Math.max(15, Math.min(25, field.label.length + 2))
        });
      });
      
      return columns;
    };

    // Define columns with hierarchical headers
    worksheet.columns = buildHierarchicalColumns();
    
    // Style the multi-level header rows
    // Row 1: Section headers (merged horizontally across columns in same section)
    // Row 2: Question labels
    
    const sectionRanges = [];
    let currentStart = 1;
    
    selectedFields.forEach((field, idx) => {
      const isLast = idx === selectedFields.length - 1;
      const nextField = selectedFields[idx + 1];
      
      // Find section for current field
      let currentSection = null;
      surveySections.householdSurveySections.forEach(section => {
        if (section.fields.some(f => f.key === field.key)) {
          currentSection = section.id;
        }
      });
      
      // Check if next field has different section
      let nextSection = null;
      if (nextField) {
        surveySections.householdSurveySections.forEach(section => {
          if (section.fields.some(f => f.key === nextField.key)) {
            nextSection = section.id;
          }
        });
      }
      
      if (isLast || currentSection !== nextSection) {
        sectionRanges.push({ start: currentStart, end: idx + 1, sectionId: currentSection });
        currentStart = idx + 2;
      }
    });
    
    // Apply section headers in row 1
    sectionRanges.forEach(range => {
      const cell = worksheet.getRow(1).getCell(range.start);
      const sectionLabel = surveySections.householdSurveySections.find(s => s.id === range.sectionId)?.label || '';
      cell.value = sectionLabel;
      cell.font = { bold: true, size: 11 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2E86AB' } // Teal blue for sections
      };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
      
      // Merge cells horizontally across columns in the same section (row 1 only, NO vertical merge)
      if (range.end > range.start) {
        worksheet.mergeCells(1, range.start, 1, range.end);
      }
    });
    
    // Row 2: Question labels - use contrasting color
    worksheet.getRow(2).eachCell(cell => {
      cell.font = { bold: true, size: 9 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFA8D5E2' } // Very light blue for questions
      };
      cell.font = { color: { argb: 'FF000000' }, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    
    // Set row heights for header rows
    worksheet.getRow(1).height = 30;
    worksheet.getRow(2).height = 35;

    // Prepare data for Excel - Map fields according to section structure
    const excelData = surveys.map(survey => ({
      // Survey Metadata
      _id: survey._id.toString(),
      surveyStatus: survey.surveyStatus,
      submittedAt: survey.submittedAt ? new Date(survey.submittedAt).toISOString() : '',
      submittedBy: survey.submittedBy ? (survey.submittedBy.name || survey.submittedBy.username || '') : '',
      
      // Core Identification
      surveyId: survey._id.toString(),
      householdId: survey.householdId || '',
      slumName: slum.slumName,
      houseDoorNo: survey.houseDoorNo || '',
      parcelId: survey.parcelId || '',
      propertyNo: survey.propertyNo || '',
      source: survey.source || '',
      surveyor: survey.surveyor?.name || '',
      ward: survey.ward || '',
      
      // SECTION I: GENERAL INFORMATION
      headName: survey.headName || '',
      fatherName: survey.fatherName || '',
      sex: survey.sex || '',
      caste: survey.caste || '',
      religion: survey.religion || '',
      minorityStatus: survey.minorityStatus || '',
      femaleHeadStatus: survey.femaleHeadStatus || '',
      
      // SECTION II: FAMILY MEMBERS & DEMOGRAPHICS
      // Family Members
      familyMembersMale: survey.familyMembersMale || 0,
      familyMembersFemale: survey.familyMembersFemale || 0,
      familyMembersTotal: survey.familyMembersTotal || 0,
      // Illiterate Adults
      illiterateAdultMale: survey.illiterateAdultMale || 0,
      illiterateAdultFemale: survey.illiterateAdultFemale || 0,
      illiterateAdultTotal: survey.illiterateAdultTotal || 0,
      // Children Not in School (6-14 years)
      childrenNotAttendingMale: survey.childrenNotAttendingMale || 0,
      childrenNotAttendingFemale: survey.childrenNotAttendingFemale || 0,
      childrenNotAttendingTotal: survey.childrenNotAttendingTotal || 0,
      // Handicapped Persons
      handicappedPhysically: survey.handicappedPhysically || 0,
      handicappedMentally: survey.handicappedMentally || 0,
      handicappedTotal: survey.handicappedTotal || 0,
      // Economic Status
      femaleEarningStatus: survey.femaleEarningStatus || '',
      belowPovertyLine: survey.belowPovertyLine || '',
      bplCard: survey.bplCard || '',
      
      // SECTION III: HOUSING & INFRASTRUCTURE
      landTenureStatus: survey.landTenureStatus || '',
      houseStructure: survey.houseStructure || '',
      roofType: survey.roofType || '',
      flooringType: survey.flooringType || '',
      houseLighting: survey.houselighting || '',
      cookingFuel: survey.cookingFuel || '',
      // Water & Sanitation
      waterSource: survey.waterSource || '',
      waterSupplyDuration: survey.waterSupplyDuration || '',
      waterSourceDistance: survey.waterSourceDistance || '',
      toiletFacility: survey.toiletFacility || '',
      bathroomFacility: survey.bathroomFacility || '',
      roadFrontType: survey.roadFrontType || '',
      
      // SECTION IV: EDUCATION & HEALTH FACILITIES
      // Education
      preschoolType: survey.preschoolType || '',
      primarySchoolType: survey.primarySchoolType || '',
      highSchoolType: survey.highSchoolType || '',
      // Health
      healthFacilityType: survey.healthFacilityType || '',
      // Welfare Benefits (array to string)
      welfareBenefits: survey.welfareBenefits?.join(', ') || '',
      // Consumer Durables (array to string)
      consumerDurables: survey.consumerDurables?.join(', ') || '',
      // Livestock (array to string)
      livestock: survey.livestock?.join(', ') || '',
      
      // SECTION V-VI: MIGRATION & INCOME
      // Migration
      yearsInTown: survey.yearsInTown || '',
      migrated: survey.migrated || '',
      migratedFrom: survey.migratedFrom || '',
      migrationType: survey.migrationType || '',
      migrationReasons: survey.migrationReasons?.join(', ') || '',
      // Income & Expenditure
      earningAdultMale: survey.earningAdultMale || 0,
      earningAdultFemale: survey.earningAdultFemale || 0,
      earningAdultTotal: survey.earningAdultTotal || 0,
      earningNonAdultMale: survey.earningNonAdultMale || 0,
      earningNonAdultFemale: survey.earningNonAdultFemale || 0,
      earningNonAdultTotal: survey.earningNonAdultTotal || 0,
      monthlyIncome: survey.monthlyIncome || 0,
      monthlyExpenditure: survey.monthlyExpenditure || 0,
      debtOutstanding: survey.debtOutstanding || 0,
      // Additional Info
      notes: survey.notes || ''
    }));

    // Add rows to worksheet
    excelData.forEach(data => worksheet.addRow(data));

    // Ensure temp directory exists
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Write Excel file
    const filePath = path.join(__dirname, '../temp/household_surveys.xlsx');
    await workbook.xlsx.writeFile(filePath);

    // Generate filename with slum name, ID and timestamp
    const slumNameFormatted = slum.slumName.replace(/\s+/g, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                      new Date().toISOString().split('T')[1].split('.')[0];
    const fileName = `Household_Surveys_${slumNameFormatted}_${slum.slumId}_${timestamp}.xlsx`;

    // Send file
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Clean up temp file after sending
      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }, 1000);
    });

  } catch (error) {
    console.error('Export household surveys error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error exporting household surveys.'
    });
  }
});

module.exports = router;