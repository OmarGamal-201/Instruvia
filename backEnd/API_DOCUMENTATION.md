# E-Learning Platform API Documentation

## Overview
This API documentation covers all endpoints for the updated e-learning platform with commission system, instructor verification, and admin approval features.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Routes

### POST /auth/register
Register a new user (automatically assigned student role)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### POST /auth/login
Login user

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### GET /auth/me
Get current user profile (Protected)

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "bio": null,
    "specialization": null,
    "isInstructorApproved": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### POST /auth/apply-instructor
Apply to become an instructor (Protected, File Upload)

**Request:** Form-data with files and fields
- `documents`: Files (max 5 files, 10MB each, allowed types: jpg, jpeg, png, pdf, doc, docx)
- `bio`: String (min 10, max 1000 chars)
- `specialization`: String (min 3, max 200 chars)
- `documentTypes[0]`: "certificate" | "id_proof" | "professional_document" | "other"

**Response (201):**
```json
{
  "success": true,
  "message": "Instructor application submitted successfully",
  "application": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j2",
    "status": "pending",
    "submittedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

### POST /auth/forgot-password
Request password reset

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

### POST /auth/reset-password
Reset password with token

**Request Body:**
```json
{
  "token": "abc123def456...",
  "password": "newpassword123"
}
```

---

## 2. Admin Routes (Admin Only)

### GET /admin/users
Get all users with pagination

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `role`: Filter by role (student, instructor, admin)
- `isInstructorApproved`: Filter by approval status (true/false)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "isInstructorApproved": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### GET /admin/users/:id
Get single user details

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "bio": null,
    "specialization": null,
    "isInstructorApproved": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### PUT /admin/users/:id
Update user details

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "role": "instructor",
  "bio": "Experienced software developer",
  "specialization": "Web Development",
  "isInstructorApproved": true
}
```

### GET /admin/instructor-applications
Get all instructor applications

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (pending, approved, rejected)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "applicant": {
        "id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "name": "John Doe",
        "email": "john@example.com",
        "createdAt": "2024-01-15T10:30:00.000Z"
      },
      "bio": "Experienced software developer with 5+ years...",
      "specialization": "Web Development",
      "documents": [
        {
          "type": "certificate",
          "filename": "cert-abc123.jpg",
          "originalName": "my-certificate.jpg",
          "url": "https://cloudinary.com/...",
          "size": 1024000,
          "uploadedAt": "2024-01-15T10:35:00.000Z"
        }
      ],
      "status": "pending",
      "submittedAt": "2024-01-15T10:35:00.000Z",
      "reviewedBy": null,
      "reviewedAt": null,
      "rejectionReason": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

### GET /admin/instructor-applications/:id
Get single instructor application details

### PUT /admin/instructor-applications/:id/approve
Approve or reject instructor application

**Request Body:**
```json
{
  "approved": true,
  "rejectionReason": "Application rejected due to insufficient documentation"
}
```

**Response (200) - Approved:**
```json
{
  "success": true,
  "message": "Instructor application approved successfully",
  "application": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j2",
    "status": "approved",
    "reviewedAt": "2024-01-15T11:00:00.000Z"
  },
  "user": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "instructor",
    "isInstructorApproved": true
  }
}
```

**Response (200) - Rejected:**
```json
{
  "success": true,
  "message": "Instructor application rejected successfully",
  "application": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j2",
    "status": "rejected",
    "rejectionReason": "Application rejected due to insufficient documentation",
    "reviewedAt": "2024-01-15T11:00:00.000Z"
  },
  "user": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "isInstructorApproved": false
  }
}
```

### GET /admin/stats
Get dashboard statistics

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 150,
    "totalStudents": 120,
    "totalInstructors": 25,
    "pendingInstructors": 5,
    "approvedInstructors": 20
  },
  "recentUsers": [
    {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "student",
      "createdAt": "2024-01-15T09:00:00.000Z"
    }
  ]
}
```

---

## 3. Payment Routes

### POST /payments/create-intent
Create payment intent for course purchase (Protected)

**Request Body:**
```json
{
  "courseId": "64f1a2b3c4d5e6f7g8h9i0j3"
}
```

**Response (200):**
```json
{
  "success": true,
  "clientSecret": "pi_abc123_def456_secret_xyz789",
  "amount": 99.99,
  "currency": "USD",
  "course": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j3",
    "title": "JavaScript Masterclass",
    "instructor": "64f1a2b3c4d5e6f7g8h9i0j4"
  }
}
```

### GET /payments/:paymentIntentId
Get payment status (Protected)

**Response (200):**
```json
{
  "success": true,
  "payment": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j5",
    "amount": 99.99,
    "platformCommission": 20.00,
    "instructorAmount": 79.99,
    "platformCommissionRate": 0.20,
    "currency": "USD",
    "status": "succeeded",
    "paymentMethod": "card",
    "createdAt": "2024-01-15T12:00:00.000Z",
    "updatedAt": "2024-01-15T12:05:00.000Z",
    "failureReason": null,
    "course": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j3",
      "title": "JavaScript Masterclass",
      "description": "Learn JavaScript from scratch",
      "instructor": "64f1a2b3c4d5e6f7g8h9i0j4"
    }
  }
}
```

### GET /payments/my-payments
Get user's payment history (Protected)

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (pending, succeeded, failed, canceled, refunded)

**Response (200):**
```json
{
  "success": true,
  "payments": [
    {
      "id": "64f1a2b3c4d5e6f7g8h9i0j5",
      "amount": 99.99,
      "platformCommission": 20.00,
      "instructorAmount": 79.99,
      "platformCommissionRate": 0.20,
      "currency": "USD",
      "status": "succeeded",
      "paymentMethod": "card",
      "createdAt": "2024-01-15T12:00:00.000Z",
      "course": {
        "id": "64f1a2b3c4d5e6f7g8h9i0j3",
        "title": "JavaScript Masterclass",
        "thumbnail": "https://cloudinary.com/...",
        "instructor": {
          "name": "John Instructor"
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

---

## 4. Course Routes

### POST /courses
Create new course (Instructor Only)

**Request Body:**
```json
{
  "title": "JavaScript Masterclass",
  "description": "Learn JavaScript from scratch to advanced concepts",
  "category": "Programming",
  "level": "Beginner",
  "price": 99.99,
  "duration": 1200,
  "lessons": [
    {
      "title": "Introduction to JavaScript",
      "description": "Getting started with JavaScript",
      "videoUrl": "https://example.com/video1",
      "duration": 30,
      "order": 1,
      "isPreview": true
    }
  ],
  "requirements": ["Basic computer skills"],
  "whatYouWillLearn": ["JavaScript fundamentals", "DOM manipulation"],
  "tags": ["javascript", "web development"]
}
```

### GET /courses
Get all courses with pagination and filtering

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `category`: Filter by category
- `level`: Filter by level (Beginner, Intermediate, Advanced)
- `priceMin`: Minimum price
- `priceMax`: Maximum price
- `search`: Search in title and description

---

## 5. Error Responses

### Validation Error (400)
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

### Authentication Error (401)
```json
{
  "message": "Access denied. No token provided."
}
```

### Authorization Error (403)
```json
{
  "message": "Access denied. Insufficient permissions."
}
```

### Not Found Error (404)
```json
{
  "message": "Resource not found"
}
```

### Server Error (500)
```json
{
  "message": "Server error",
  "error": "Detailed error message"
}
```

---

## 6. File Upload Specifications

### Instructor Application Documents
- **Max files**: 5 per application
- **Max size**: 10MB per file
- **Allowed formats**: 
  - Images: jpg, jpeg, png
  - Documents: pdf, doc, docx
- **Document types**:
  - `certificate`: Professional certificates
  - `id_proof`: Government ID or passport
  - `professional_document`: Work samples, portfolio, etc.
  - `other`: Any other supporting document

### Upload Process
1. Use form-data with `documents` field for files
2. Include `documentTypes[]` array for file type classification
3. Files are uploaded to Cloudinary storage
4. File URLs and metadata are stored in the database

---

## 7. Commission System

### How it Works
- **Platform Commission**: 20% of course price
- **Instructor Earnings**: 80% of course price
- **Automatic Calculation**: Commission is calculated and stored during payment creation
- **Database Storage**: All payment records include commission breakdown

### Example Breakdown
For a $100 course:
- **Total Amount**: $100.00
- **Platform Commission (20%)**: $20.00
- **Instructor Amount (80%)**: $80.00

---

## 8. Role Management

### User Roles
1. **Student**: Default role for all new users
   - Can browse and purchase courses
   - Can apply to become instructor
   - Cannot create courses

2. **Instructor**: Approved instructors
   - Can create and manage courses
   - Receives 80% of course revenue
   - Must be approved by admin

3. **Admin**: Platform administrators
   - Can manage all users
   - Can approve/reject instructor applications
   - Full platform access

### Role Change Process
1. Student submits instructor application with documents
2. Admin reviews application and documents
3. Admin approves or rejects application
4. If approved: Student role → Instructor role (automatic)
5. If rejected: Student remains student with rejection reason

---

## 9. Testing with Postman

### Setup Instructions
1. Import the provided Postman collection
2. Set environment variables:
   - `base_url`: http://localhost:5000/api
   - `token`: JWT token received from login
3. Use the collection folders for different feature testing

### Test Flow
1. **Registration**: Create a new student account
2. **Login**: Get JWT token for authentication
3. **Instructor Application**: Apply to become instructor with documents
4. **Admin Approval**: Use admin account to review and approve application
5. **Course Purchase**: Test course purchase with commission calculation
6. **Payment History**: Verify commission breakdown in payment records

### Important Notes
- All protected endpoints require valid JWT token
- Admin endpoints require admin role
- File uploads use form-data format
- Commission is automatically calculated (20% platform, 80% instructor)
- Instructor applications require document uploads
