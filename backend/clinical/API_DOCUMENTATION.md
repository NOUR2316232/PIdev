# Clinical Service CRUD API Documentation

## Overview
The Clinical Service provides a complete CRUD (Create, Read, Update, Delete) API for managing consultations and medical histories in a healthcare system.

## Base URL
```
http://localhost:8079/api
```

## Consultation Endpoints

### 1. Create Consultation
**POST** `/consultations`

Creates a new consultation record.

**Request Body:**
```json
{
  "patientId": 1,
  "doctorId": 2,
  "consultationDate": "2026-02-14T14:30:00",
  "diagnosis": "Flu",
  "treatmentPlan": "Rest and hydration",
  "followUpDate": "2026-02-21",
  "status": "SCHEDULED",
  "medicalHistoryId": 1
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "patientId": 1,
  "doctorId": 2,
  "consultationDate": "2026-02-14T14:30:00",
  "diagnosis": "Flu",
  "treatmentPlan": "Rest and hydration",
  "followUpDate": "2026-02-21",
  "status": "SCHEDULED",
  "medicalHistoryId": 1
}
```

---

### 2. Get All Consultations
**GET** `/consultations`

Retrieves all consultations.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "patientId": 1,
    "doctorId": 2,
    "consultationDate": "2026-02-14T14:30:00",
    "diagnosis": "Flu",
    "treatmentPlan": "Rest and hydration",
    "followUpDate": "2026-02-21",
    "status": "SCHEDULED",
    "medicalHistoryId": 1
  }
]
```

---

### 3. Get Consultation by ID
**GET** `/consultations/{id}`

Retrieves a specific consultation by ID.

**Response (200 OK):**
```json
{
  "id": 1,
  "patientId": 1,
  "doctorId": 2,
  "consultationDate": "2026-02-14T14:30:00",
  "diagnosis": "Flu",
  "treatmentPlan": "Rest and hydration",
  "followUpDate": "2026-02-21",
  "status": "SCHEDULED",
  "medicalHistoryId": 1
}
```

---

### 4. Get Consultations by Patient ID
**GET** `/consultations/patient/{patientId}`

Retrieves all consultations for a specific patient.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "patientId": 1,
    "doctorId": 2,
    "consultationDate": "2026-02-14T14:30:00",
    "diagnosis": "Flu",
    "treatmentPlan": "Rest and hydration",
    "followUpDate": "2026-02-21",
    "status": "SCHEDULED",
    "medicalHistoryId": 1
  }
]
```

---

### 5. Get Consultations by Doctor ID
**GET** `/consultations/doctor/{doctorId}`

Retrieves all consultations conducted by a specific doctor.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "patientId": 1,
    "doctorId": 2,
    "consultationDate": "2026-02-14T14:30:00",
    "diagnosis": "Flu",
    "treatmentPlan": "Rest and hydration",
    "followUpDate": "2026-02-21",
    "status": "SCHEDULED",
    "medicalHistoryId": 1
  }
]
```

---

### 6. Update Consultation
**PUT** `/consultations/{id}`

Updates an existing consultation.

**Request Body:**
```json
{
  "patientId": 1,
  "doctorId": 2,
  "consultationDate": "2026-02-14T14:30:00",
  "diagnosis": "Flu",
  "treatmentPlan": "Rest and hydration",
  "followUpDate": "2026-02-21",
  "status": "COMPLETED",
  "medicalHistoryId": 1
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "patientId": 1,
  "doctorId": 2,
  "consultationDate": "2026-02-14T14:30:00",
  "diagnosis": "Flu",
  "treatmentPlan": "Rest and hydration",
  "followUpDate": "2026-02-21",
  "status": "COMPLETED",
  "medicalHistoryId": 1
}
```

---

### 7. Delete Consultation
**DELETE** `/consultations/{id}`

Deletes a consultation record.

**Response (204 No Content):** Empty body

---

## Medical History Endpoints

### 1. Create Medical History
**POST** `/medical-histories`

Creates a new medical history record.

**Request Body:**
```json
{
  "userId": 1,
  "diagnosis": "Hypertension",
  "allergies": "Penicillin",
  "chronicConditions": "Diabetes, High Blood Pressure",
  "familyHistory": "Diabetes in family",
  "notes": "Regular checkups required"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "userId": 1,
  "diagnosis": "Hypertension",
  "allergies": "Penicillin",
  "chronicConditions": "Diabetes, High Blood Pressure",
  "familyHistory": "Diabetes in family",
  "notes": "Regular checkups required"
}
```

---

### 2. Get All Medical Histories
**GET** `/medical-histories`

Retrieves all medical history records.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "userId": 1,
    "diagnosis": "Hypertension",
    "allergies": "Penicillin",
    "chronicConditions": "Diabetes, High Blood Pressure",
    "familyHistory": "Diabetes in family",
    "notes": "Regular checkups required"
  }
]
```

---

### 3. Get Medical History by ID
**GET** `/medical-histories/{id}`

Retrieves a specific medical history by ID.

**Response (200 OK):**
```json
{
  "id": 1,
  "userId": 1,
  "diagnosis": "Hypertension",
  "allergies": "Penicillin",
  "chronicConditions": "Diabetes, High Blood Pressure",
  "familyHistory": "Diabetes in family",
  "notes": "Regular checkups required"
}
```

---

### 4. Get Medical History by User ID
**GET** `/medical-histories/user/{userId}`

Retrieves the medical history for a specific user.

**Response (200 OK):**
```json
{
  "id": 1,
  "userId": 1,
  "diagnosis": "Hypertension",
  "allergies": "Penicillin",
  "chronicConditions": "Diabetes, High Blood Pressure",
  "familyHistory": "Diabetes in family",
  "notes": "Regular checkups required"
}
```

---

### 5. Update Medical History
**PUT** `/medical-histories/{id}`

Updates an existing medical history record.

**Request Body:**
```json
{
  "userId": 1,
  "diagnosis": "Hypertension Type 2",
  "allergies": "Penicillin, Ibuprofen",
  "chronicConditions": "Diabetes, High Blood Pressure",
  "familyHistory": "Diabetes in family",
  "notes": "Regular checkups required, new medication"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "userId": 1,
  "diagnosis": "Hypertension Type 2",
  "allergies": "Penicillin, Ibuprofen",
  "chronicConditions": "Diabetes, High Blood Pressure",
  "familyHistory": "Diabetes in family",
  "notes": "Regular checkups required, new medication"
}
```

---

### 6. Delete Medical History
**DELETE** `/medical-histories/{id}`

Deletes a medical history record.

**Response (204 No Content):** Empty body

---

## Consultation Status Values
- `SCHEDULED` - Consultation is scheduled
- `IN_PROGRESS` - Consultation is currently happening
- `COMPLETED` - Consultation has been completed
- `CANCELLED` - Consultation has been cancelled
- `NO_SHOW` - Patient did not show up

---

## Error Responses

### 404 Not Found
```json
{
  "status": 404,
  "message": "Consultation not found with id: 999",
  "timestamp": "2026-02-14T22:20:45"
}
```

### 400 Bad Request (Validation Error)
```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": {
    "patientId": "Patient ID is required",
    "diagnosis": "Diagnosis cannot be blank"
  },
  "timestamp": "2026-02-14T22:20:45"
}
```

### 500 Internal Server Error
```json
{
  "status": 500,
  "message": "An unexpected error occurred",
  "timestamp": "2026-02-14T22:20:45"
}
```

---

## Required Fields

### Consultation
- `patientId` (Long) - ID of the patient
- `doctorId` (Long) - ID of the doctor
- `consultationDate` (LocalDateTime) - Date and time of consultation
- `diagnosis` (String) - Diagnosis from consultation
- `status` (ConsultationStatus) - Status of consultation

### Medical History
- `userId` (Long) - ID of the user

---

## Testing with cURL

### Create a Consultation
```bash
curl -X POST http://localhost:8079/api/consultations \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 1,
    "doctorId": 2,
    "consultationDate": "2026-02-14T14:30:00",
    "diagnosis": "Flu",
    "treatmentPlan": "Rest and hydration",
    "followUpDate": "2026-02-21",
    "status": "SCHEDULED"
  }'
```

### Get All Consultations
```bash
curl -X GET http://localhost:8079/api/consultations
```

### Get Consultation by ID
```bash
curl -X GET http://localhost:8079/api/consultations/1
```

### Update Consultation
```bash
curl -X PUT http://localhost:8079/api/consultations/1 \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 1,
    "doctorId": 2,
    "consultationDate": "2026-02-14T14:30:00",
    "diagnosis": "Flu",
    "treatmentPlan": "Rest and hydration",
    "followUpDate": "2026-02-21",
    "status": "COMPLETED"
  }'
```

### Delete Consultation
```bash
curl -X DELETE http://localhost:8079/api/consultations/1
```

---

## Database Schema

### consultations table
- `id` (BIGINT PRIMARY KEY AUTO_INCREMENT)
- `patient_id` (BIGINT NOT NULL)
- `doctor_id` (BIGINT NOT NULL)
- `medical_history_id` (BIGINT)
- `consultation_date` (DATETIME)
- `diagnosis` (VARCHAR)
- `treatment_plan` (TEXT)
- `follow_up_date` (DATE)
- `status` (VARCHAR)

### medical_histories table
- `id` (BIGINT PRIMARY KEY AUTO_INCREMENT)
- `user_id` (BIGINT NOT NULL UNIQUE)
- `diagnosis` (TEXT)
- `allergies` (TEXT)
- `chronic_conditions` (TEXT)
- `family_history` (TEXT)
- `notes` (TEXT)
