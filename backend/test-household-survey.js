const mongoose = require('mongoose');
const HouseholdSurvey = require('./src/models/HouseholdSurvey');
const { v4: uuidv4 } = require('uuid');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/socio_economic_survey', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const testNewWorkflow = async () => {
  try {
    console.log('Testing new household survey workflow...');
    
    // Create a test survey with new structure
    const testSurvey = new HouseholdSurvey({
      slum: mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), // Dummy slum ID
      householdId: uuidv4(),
      houseDoorNo: '123A',
      surveyor: mongoose.Types.ObjectId('507f1f77bcf86cd799439012'), // Dummy surveyor ID
      slumName: 'Test Slum',
      locationWard: 'Ward 5',
      houseDoorNo: '123A',
      headName: 'John Doe',
      fatherName: 'Robert Doe',
      sex: 'MALE',
      caste: 'GENERAL',
      religion: 'HINDU',
      minorityStatus: 'NON_MINORITY',
      femaleHeadStatus: 'MARRIED',
      familyMembersMale: 2,
      familyMembersFemale: 3,
      familyMembersTotal: 5,
      surveyStatus: 'DRAFT'
    });
    
    await testSurvey.save();
    console.log('✓ New survey created successfully');
    console.log('Survey ID:', testSurvey._id);
    console.log('Household ID:', testSurvey.householdId);
    console.log('House Door No:', testSurvey.houseDoorNo);
    
    // Test finding the survey
    const foundSurvey = await HouseholdSurvey.findOne({ 
      slum: testSurvey.slum,
      houseDoorNo: testSurvey.houseDoorNo 
    });
    
    console.log('✓ Survey found successfully');
    console.log('Found survey ID:', foundSurvey._id);
    
    // Clean up
    await HouseholdSurvey.findByIdAndDelete(testSurvey._id);
    console.log('✓ Test cleanup completed');
    
    console.log('\n🎉 All tests passed! New workflow is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    mongoose.connection.close();
  }
};

testNewWorkflow();