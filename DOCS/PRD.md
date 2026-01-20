# 📘 Product Requirements Document (PRD)
## Project: Socio-Economic Survey System

---

## 1. Project Overview

### 1.1 Purpose
The Socio-Economic Survey System is a role-based, mobile-first application designed to conduct large-scale socio-economic data collection through two distinct but related survey types:

1. Slum Survey (area-level)
2. Household Survey (unit-level)

The system is built primarily for field surveyors using mobile devices, while supervisors and administrators use desktop systems for management, monitoring, and control.

---

### 1.2 Key Objectives
- Enable accurate, structured socio-economic data collection
- Maintain strict data integrity and authorization
- Support high-volume household-level surveys
- Provide a smooth, mobile-friendly experience for surveyors
- Enable supervisors to track progress effectively
- Generate clean, exportable datasets (CSV / Excel)

---

## 2. Stakeholders & User Roles

### 2.1 User Roles

#### Admin
- Full system authority
- Manage all users (admins, supervisors, surveyors)
- View and export all survey data
- Override assignments if required

#### Supervisor
- Create and manage slums
- Assign surveys to surveyors
- Monitor survey progress and completion
- Does NOT fill surveys

#### Surveyor
- Field-level user (primary mobile user)
- Conducts only assigned surveys
- Cannot assign surveys or modify assignments
- Cannot edit submitted surveys

---

## 3. Survey Types (Core Concept)

### 3.1 Slum Survey (Area-Level)

**Definition**
- One survey per slum
- Captures aggregated information about the entire slum/area

**Characteristics**
- Low volume
- Mandatory when full slum assignment is given
- Completed once per slum

**Source of Questions**
DOCS/slum_survey_form.md

markdown
Copy code

**Examples of Data**
- Infrastructure
- Amenities
- Population and demographic data
- Availability of services

---

### 3.2 Household Survey (Unit-Level)

**Definition**
- One survey per household
- Multiple households belong to one slum

**Characteristics**
- High volume
- Can exist independently of slum survey
- Each household is surveyed individually

**Source of Questions**
DOCS/HouseHold_Survey_Form.md

yaml
Copy code

**Examples of Data**
- Family details
- Income and livelihood
- Housing conditions
- Sanitation and utilities
- Education details

---

### 3.3 Relationship Between Surveys
- Only common link: `slumId`
- Slum Survey and Household Survey are independent survey types
- Household surveys may exist with or without a slum survey

---

## 4. Assignment Modes (Critical Requirement)

The system must support TWO assignment modes.

---

### 4.1 Mode A: Full Slum Assignment (Default)

**What is Assigned**
- A complete slum is assigned to a surveyor

**Surveyor Responsibilities**
1. Complete the Slum Survey
2. Complete ALL Household Surveys under that slum

**Flow**
Assigned Slum
├── Slum Survey (1)
└── Household Surveys (N)

markdown
Copy code

**UI Expectation**
- Surveyor dashboard shows “Assigned Slum Surveys”
- Slum detail page shows:
  - Slum Survey option
  - Household Surveys option

---

### 4.2 Mode B: Household-Only Assignment (Special Case)

**What is Assigned**
- Only household surveys for a slum

**Use Case**
- Slum survey already completed
- Or slum survey handled by another team

**Surveyor Responsibilities**
- Perform ONLY household surveys

**Restrictions**
- Slum survey must NOT be visible
- Slum details are read-only and prefetched

**Flow**
Assigned Household Surveys
└── Slum (read-only context)
└── Household Surveys (N)

yaml
Copy code

**UI Expectation**
- Surveyor dashboard shows “Assigned Household Surveys”
- No Slum Survey option visible

---

## 5. Authentication & Authorization

### 5.1 Authentication
- Username and password login
- JWT-based authentication
- Role information embedded in token

### 5.2 Authorization
- Role-based access control (RBAC)
- Assignment-based data visibility
- Surveyors can only access assigned slums/households

---

## 6. Application Navigation & UX

### 6.1 Surveyor UX (Mobile-First)

**Primary Device**
- Mobile phones (Android primarily)

**Navigation**
- Bottom navigation bar (mobile only)

Bottom Navigation Tabs:
Dashboard | Slums | Progress | Profile

yaml
Copy code

Rules:
- No sidebar for surveyors
- No global survey buttons
- Surveys start only from assigned slum/household context

---

### 6.2 Supervisor & Admin UX (Desktop-First)

**Primary Device**
- Desktop / Laptop

**Navigation**
- Left sidebar (collapsible)

Sidebar Items (example):
Dashboard
Slums
Assignments
Progress
Users (Admin only)
Exports (Admin only)

yaml
Copy code

Rules:
- Sidebar always mounted
- On mobile, sidebar becomes a drawer
- No bottom navigation for admin/supervisor

---

## 7. Slum Detail Page (Control Center)

This page acts as the single control center for survey actions.

**Must Display**
- Slum summary
- Assignment type
- Slum Survey status
- Household survey completion status

**CTAs**
- Slum Survey (only if permitted)
- Household Surveys

---

## 8. Survey UI Behavior

### 8.1 Slum Survey UI
- Stepper-based interface
- One logical section per step
- Calculated fields are read-only
- Submit locks the survey permanently

---

### 8.2 Household Survey UI
- Accordion-based sections
- Optimized for high-volume data entry
- Sticky bottom action bar:
Save Draft | Submit

yaml
Copy code

---

## 9. Data Integrity Rules
- Submitted surveys are immutable
- Draft surveys are editable
- No duplicate household entries per slum
- Slum survey cannot be edited after submission
- Household survey cannot change slum association

---

## 10. High-Level Data Models

- User
- Slum
- SlumSurvey
- Household
- HouseholdSurvey
- Assignment

Relationships:
- Slum → Households (1:N)
- Slum → SlumSurvey (1:1)
- Household → HouseholdSurvey (1:1)
- Assignment controls access and visibility

---

## 11. Performance & Scalability (Future Phase)
- Indexing on slumId, surveyorId, assignmentType
- Pagination for household lists
- Optimized exports
- Read-heavy dashboards

---

## 12. Out of Scope
- Payments
- GIS mapping (future phase)
- AI analytics
- Real-time sync
- Offline mode (future phase)

---

## 13. Success Criteria
The system is successful when:
- Surveyors can complete surveys without confusion
- Supervisors can track progress efficiently
- Admins can export clean, structured data
- Data integrity is preserved end-to-end

---

## 14. Reference Documents

Located in the `/DOCS` directory:
- `slum_survey_form.md`
- `HouseHold_Survey_Form.md`

These documents are the single source of truth for all survey questions.

---

## 15. Final Statement

This PRD is authoritative.
All implementations must align with this document.
Anything not explicitly mentioned here is out of scope unless formally approved.

---