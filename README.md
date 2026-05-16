# MRMS – Medical Record Management System

The Medical Record Management System (MRMS) is a core module of the Hospital Appointment System (HAS) integration. MRMS manages doctor profiles and integrates with the Authentication system to handle user account creation for both patients and doctors.

## System Overview

MRMS is responsible for:
- **Doctor Profile Management** – Create, retrieve, and manage doctor profiles with availability schedules
- **User Account Management** – Create and manage user accounts for patients and doctors (delegated to Auth system)
- **Access Control** – Enforce role-based access control (staff and admin only)
- **Adapter Integration** – Coordinate with the Adapter Layer for legacy HAS patient data

## Service Deployments

**Production URL:**
```txt
https://mrms-hospital.onrender.com/api
```

**Local Development URL:**
```txt
http://localhost:9100/api
```

---

## Test Credentials

```txt
Email: admin@gmail.com
Password: Admin123@
Role: admin (staff)
Auth Token: Bearer mock-token-admin
```

---

## Authentication Flow

```txt
Register User (Auth) → Create Account (MRMS) → Assign Role (Doctor) → Access Protected Routes
```

The API uses:
- JWT Bearer Tokens (via Auth system)
- Role-Based Access Control (RBAC)
- Staff/Admin authorization requirement

---

## Run Locally

### Prerequisites
- Node.js v16+
- MongoDB Atlas account with cluster configured

### Setup

1. Clone repository and install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Configure environment variables:
```env
PORT=9100
MRMS_DB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=MRMS
AUTH_BASE_URL=https://has-auth.onrender.com/api
AUTH_USE_MOCK=false
ADAPTER_BASE_URL=<adapter-url-when-ready>
ADAPTER_USE_MOCK=true
```

4. Start the development server:
```bash
npm run dev
```

Server starts on `http://localhost:9100`

---

## API Endpoints

### 1. Health Check

Returns system status and integration information.

#### Route

```http
GET /health
```

#### Full URL

```txt
https://mrms-hospital.onrender.com/api/health
```

#### Response

```json
{
  "service": "mrms",
  "status": "ok",
  "adapter": {
    "mockMode": true,
    "baseUrlConfigured": false
  },
  "auth": {
    "mockMode": false,
    "baseUrlConfigured": true
  }
}
```

---

### 2. Create Doctor Profile

Creates a new doctor profile in MRMS database with availability schedule.

#### Route

```http
POST /doctors
```

#### Full URL

```txt
https://mrms-hospital.onrender.com/api/doctors
```

#### Headers

```
Content-Type: application/json
Authorization: Bearer <token>
```

#### Body

```json
{
  "firstName": "Ana",
  "lastName": "Reyes",
  "specialization": "Dermatology",
  "phone": "09175551234",
  "email": "ana.reyes@example.com",
  "availability": [
    {
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "12:00"
    },
    {
      "day": "Wednesday",
      "startTime": "14:00",
      "endTime": "17:00"
    }
  ]
}
```

#### Success Response (201 Created)

```json
{
  "_id": "66abc1234567890abcdef001",
  "firstName": "Ana",
  "lastName": "Reyes",
  "specialization": "Dermatology",
  "phone": "09175551234",
  "email": "ana.reyes@example.com",
  "availability": [
    {
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "12:00"
    },
    {
      "day": "Wednesday",
      "startTime": "14:00",
      "endTime": "17:00"
    }
  ],
  "isActive": true,
  "createdAt": "2026-05-16T10:30:00.000Z",
  "updatedAt": "2026-05-16T10:30:00.000Z"
}
```

---

### 3. Get All Doctors

Retrieves all doctor profiles sorted by creation date.

#### Route

```http
GET /doctors
```

#### Full URL

```txt
https://mrms-hospital.onrender.com/api/doctors
```

#### Headers

```
Authorization: Bearer <token>
```

#### Success Response (200 OK)

```json
[
  {
    "_id": "66abc1234567890abcdef001",
    "firstName": "Ana",
    "lastName": "Reyes",
    "specialization": "Dermatology",
    "phone": "09175551234",
    "email": "ana.reyes@example.com",
    "availability": [
      {
        "day": "Monday",
        "startTime": "09:00",
        "endTime": "12:00"
      }
    ],
    "isActive": true,
    "createdAt": "2026-05-16T10:30:00.000Z",
    "updatedAt": "2026-05-16T10:30:00.000Z"
  }
]
```

---

### 4. Get Doctor by ID

Retrieves a specific doctor profile by ID.

#### Route

```http
GET /doctors/:doctorId
```

#### Full URL

```txt
https://mrms-hospital.onrender.com/api/doctors/66abc1234567890abcdef001
```

#### Headers

```
Authorization: Bearer <token>
```

#### Success Response (200 OK)

```json
{
  "_id": "66abc1234567890abcdef001",
  "firstName": "Ana",
  "lastName": "Reyes",
  "specialization": "Dermatology",
  "phone": "09175551234",
  "email": "ana.reyes@example.com",
  "availability": [
    {
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "12:00"
    }
  ],
  "isActive": true,
  "createdAt": "2026-05-16T10:30:00.000Z",
  "updatedAt": "2026-05-16T10:30:00.000Z"
}
```

#### Error Response (404 Not Found)

```json
{
  "error": "Doctor not found"
}
```

---

### 5. Create Patient Account

Creates a new patient user account via the Auth system.

#### Route

```http
POST /accounts/patient
```

#### Full URL

```txt
https://mrms-hospital.onrender.com/api/accounts/patient
```

#### Headers

```
Content-Type: application/json
Authorization: Bearer <token>
```

#### Body

```json
{
  "firstName": "Juan",
  "lastName": "Dela Cruz",
  "email": "juan.cruz@example.com",
  "password": "SecurePass123"
}
```

#### Success Response (201 Created)

```json
{
  "message": "User created",
  "user": {
    "id": "user-123",
    "firstName": "Juan",
    "lastName": "Dela Cruz",
    "email": "juan.cruz@example.com",
    "role": "patient"
  }
}
```

---

### 6. Create Doctor Account

Creates a new doctor user account via the Auth system and assigns the `doctor` role.

#### Route

```http
POST /accounts/doctor
```

#### Full URL

```txt
https://mrms-hospital.onrender.com/api/accounts/doctor
```

#### Headers

```
Content-Type: application/json
Authorization: Bearer <token>
```

#### Body

```json
{
  "firstName": "Dr. Maria",
  "lastName": "Santos",
  "email": "dr.maria.santos@example.com",
  "password": "DoctorPass456"
}
```

#### Success Response (201 Created)

```json
{
  "message": "User created",
  "user": {
    "id": "user-456",
    "firstName": "Dr. Maria",
    "lastName": "Santos",
    "email": "dr.maria.santos@example.com",
    "role": "patient"
  },
  "roleAssignment": {
    "message": "Role assigned",
    "userId": "user-456",
    "role": "doctor"
  }
}
```

---

### 7. Create Patient Profile

Creates a new patient profile (routes through Adapter Layer to legacy HAS).

#### Route

```http
POST /patients
```

#### Full URL

```txt
https://mrms-hospital.onrender.com/api/patients
```

#### Headers

```
Content-Type: application/json
Authorization: Bearer <token>
```

#### Body

```json
{
  "name": "Juan Dela Cruz",
  "birthdate": "1985-04-12T00:00:00.000Z",
  "address": "Quezon City",
  "phone": "09171234567"
}
```

#### Success Response (201 Created)

```json
{
  "_id": "patient-789",
  "name": "Juan Dela Cruz",
  "birthdate": "1985-04-12T00:00:00.000Z",
  "address": "Quezon City",
  "phone": "09171234567"
}
```

---

### 8. Get All Patients

Retrieves all patient profiles (routes through Adapter Layer to legacy HAS).

#### Route

```http
GET /patients
```

#### Full URL

```txt
https://mrms-hospital.onrender.com/api/patients
```

#### Headers

```
Authorization: Bearer <token>
```

#### Success Response (200 OK)

```json
[
  {
    "_id": "patient-789",
    "name": "Juan Dela Cruz",
    "birthdate": "1985-04-12T00:00:00.000Z",
    "address": "Quezon City",
    "phone": "09171234567"
  }
]
```

---

### 9. Get Patient Records by ID

Retrieves all records for a specific patient (appointments, consultations, billing).

#### Route

```http
GET /patients/:patientId/records
```

#### Full URL

```txt
https://mrms-hospital.onrender.com/api/patients/patient-789/records
```

#### Headers

```
Authorization: Bearer <token>
```

#### Success Response (200 OK)

```json
{
  "patient": {
    "_id": "patient-789",
    "name": "Juan Dela Cruz",
    "birthdate": "1985-04-12T00:00:00.000Z",
    "address": "Quezon City",
    "phone": "09171234567"
  },
  "consultations": [
    {
      "_id": "consult-001",
      "patientId": "patient-789",
      "doctorId": "doctor-001",
      "date": "2026-05-15T10:00:00.000Z",
      "notes": "Follow-up appointment"
    }
  ],
  "appointments": [
    {
      "_id": "appt-001",
      "patientId": "patient-789",
      "doctorId": "doctor-001",
      "dateTime": "2026-05-20T14:00:00.000Z",
      "status": "scheduled"
    }
  ],
  "billing": [
    {
      "_id": "bill-001",
      "patientId": "patient-789",
      "amount": 5000,
      "status": "pending",
      "date": "2026-05-15T00:00:00.000Z"
    }
  ]
}
```

---

## Error Responses

### 401 Unauthorized

Missing or invalid authorization token.

```json
{
  "error": "Authorization header with bearer token is required"
}
```

### 403 Forbidden

Insufficient role permissions (only staff/admin allowed).

```json
{
  "error": "Forbidden: insufficient role permissions"
}
```

### 400 Bad Request

Invalid request body or missing required fields.

```json
{
  "error": "firstName, lastName, specialization, phone, email are required"
}
```

### 404 Not Found

Resource not found.

```json
{
  "error": "Doctor not found"
}
```

---

## Integration Notes

### Authentication & Authorization
- All endpoints (except `/health`) require valid JWT token in `Authorization: Bearer <token>` header
- Only users with `staff` or `admin` role can access protected endpoints
- Auth system integration: Communicates with https://has-auth.onrender.com/api

### Adapter Layer Integration
- Patient operations (`POST /patients`, `GET /patients`, `GET /patients/:patientId/records`) route through Adapter Layer
- Currently in mock mode; awaiting Group 2 (Adapter Layer) deployment
- Once Adapter is live, set `ADAPTER_BASE_URL` and `ADAPTER_USE_MOCK=false`

### Doctor Profile Management
- Doctor data persists in MongoDB Atlas MRMS database
- Doctor role assignment implemented for users created via `/accounts/doctor`
- Doctors can be queried independently from Auth system

---

## Current Status

| Feature | Status | Notes |
|---------|--------|-------|
| Doctor CRUD operations | ✅ Fully functional | Tested on local and Render |
| Patient/Doctor account creation | ✅ Fully functional | Delegates to Auth system |
| Doctor role assignment | ✅ Implemented | Auto-promotes to 'doctor' role |
| Unauthorized access prevention | ✅ Implemented | All endpoints protected |
| Patient operations | ⏳ Ready (blocked) | Awaiting Adapter Layer deployment |
| Token validation | ⏳ In progress | Mock mode enabled for testing |

---

## Deployment on Render

The MRMS is deployed on Render with the following configuration:
- **Service:** Node.js application
- **Database:** MongoDB Atlas (MRMS cluster)
- **Environment:** Production with mock Auth validation enabled

View the deployed service: https://mrms-hospital.onrender.com/

---

## Academic Exercise Context

MRMS is part of a group project to integrate multiple hospital systems through an Adapter Layer. This exercise demonstrates:
- Microservices architecture and integration patterns
- API design and RESTful principles
- Role-based access control implementation
- Horizontal system integration approaches
- Working with legacy systems through adapter patterns
