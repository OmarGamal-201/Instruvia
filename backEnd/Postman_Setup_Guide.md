# Postman Collection Setup Guide

## Step-by-Step Instructions

### 1. Create New Collection
1. Open Postman
2. Click "Collections" tab
3. Click "+ New Collection"
4. Name it: "E-Learning Platform API"
5. Description: "Complete API collection for e-learning platform with commission system and instructor verification"

### 2. Set Up Environment Variables
1. Click "Environments" tab
2. Click "+ New Environment"
3. Name it: "E-Learning Platform"
4. Add these variables:
   - `base_url`: `http://localhost:5000/api`
   - `token`: (will be set automatically)
   - `admin_token`: (will be set manually)
   - `user_id`: (will be set automatically)
   - `user_email`: (will be set automatically)
   - `application_id`: (will be set manually)
   - `course_id`: (will be set manually)
   - `payment_intent_id`: (will be set manually)

### 3. Create Authentication Folder
**Folder Name**: "Authentication"

#### Request 1: Register User
- **Method**: POST
- **URL**: `{{base_url}}/auth/register`
- **Headers**: Content-Type: application/json
- **Body** (raw JSON):
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123"
}
```
- **Tests** (Script tab):
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("token", response.token);
    pm.environment.set("user_id", response.user.id);
    pm.environment.set("user_email", response.user.email);
}
```

#### Request 2: Login User
- **Method**: POST
- **URL**: `{{base_url}}/auth/login`
- **Headers**: Content-Type: application/json
- **Body** (raw JSON):
```json
{
  "email": "{{user_email}}",
  "password": "password123"
}
```
- **Tests** (Script tab):
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.token);
    pm.environment.set("user_id", response.user.id);
    pm.environment.set("user_email", response.user.email);
}
```

#### Request 3: Get Current User
- **Method**: GET
- **URL**: `{{base_url}}/auth/me`
- **Headers**: Authorization: Bearer {{token}}

#### Request 4: Apply for Instructor
- **Method**: POST
- **URL**: `{{base_url}}/auth/apply-instructor`
- **Headers**: Authorization: Bearer {{token}}
- **Body** (form-data):
  - `bio`: "Experienced software developer with 5+ years in web development. Passionate about teaching and helping others learn programming."
  - `specialization`: "Web Development, JavaScript, React"
  - `documents`: [Select a file - certificate.pdf, id.jpg, etc.]
  - `documentTypes`: "certificate"

### 4. Create Admin Folder
**Folder Name**: "Admin"

#### Request 1: Get All Users
- **Method**: GET
- **URL**: `{{base_url}}/admin/users?page=1&limit=10`
- **Headers**: Authorization: Bearer {{admin_token}}

#### Request 2: Get Instructor Applications
- **Method**: GET
- **URL**: `{{base_url}}/admin/instructor-applications?status=pending`
- **Headers**: Authorization: Bearer {{admin_token}}

#### Request 3: Approve Application
- **Method**: PUT
- **URL**: `{{base_url}}/admin/instructor-applications/{{application_id}}/approve`
- **Headers**: Authorization: Bearer {{admin_token}}, Content-Type: application/json
- **Body** (raw JSON):
```json
{
  "approved": true
}
```

#### Request 4: Reject Application
- **Method**: PUT
- **URL**: `{{base_url}}/admin/instructor-applications/{{application_id}}/approve`
- **Headers**: Authorization: Bearer {{admin_token}}, Content-Type: application/json
- **Body** (raw JSON):
```json
{
  "approved": false,
  "rejectionReason": "Insufficient documentation provided"
}
```

#### Request 5: Get Dashboard Stats
- **Method**: GET
- **URL**: `{{base_url}}/admin/stats`
- **Headers**: Authorization: Bearer {{admin_token}}

### 5. Create Payments Folder
**Folder Name**: "Payments"

#### Request 1: Create Payment Intent
- **Method**: POST
- **URL**: `{{base_url}}/payments/create-intent`
- **Headers**: Authorization: Bearer {{token}}, Content-Type: application/json
- **Body** (raw JSON):
```json
{
  "courseId": "{{course_id}}"
}
```

#### Request 2: Get Payment History
- **Method**: GET
- **URL**: `{{base_url}}/payments/my-payments?page=1&limit=10`
- **Headers**: Authorization: Bearer {{token}}

### 6. Create Courses Folder
**Folder Name**: "Courses"

#### Request 1: Get All Courses
- **Method**: GET
- **URL**: `{{base_url}}/courses?page=1&limit=10`

#### Request 2: Create Course (Instructor Only)
- **Method**: POST
- **URL**: `{{base_url}}/courses`
- **Headers**: Authorization: Bearer {{instructor_token}}, Content-Type: application/json
- **Body** (raw JSON):
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

## Testing Workflow

### 1. Basic User Flow
1. **Register**: Use "Register User" request
2. **Login**: Use "Login User" request (token saved automatically)
3. **Check Profile**: Use "Get Current User" request
4. **Apply for Instructor**: Use "Apply for Instructor" request (upload documents)

### 2. Admin Approval Flow
1. **Login as Admin**: Manually set `admin_token` environment variable
2. **View Applications**: Use "Get Instructor Applications" request
3. **Copy Application ID**: From response, set `application_id` environment variable
4. **Approve Application**: Use "Approve Application" request
5. **Check Stats**: Use "Get Dashboard Stats" request

### 3. Course Purchase Flow
1. **Create Course**: Use "Create Course" request (requires instructor token)
2. **Copy Course ID**: From response, set `course_id` environment variable
3. **Create Payment**: Use "Create Payment Intent" request
4. **Check Payment History**: Use "Get Payment History" request

### 4. Commission Verification
1. After successful payment, check payment history
2. Verify commission breakdown:
   - `platformCommission`: 20% of total
   - `instructorAmount`: 80% of total
   - `platformCommissionRate`: 0.20

## Important Notes

### File Upload Testing
- For instructor application, use actual files (PDF, JPG, DOC)
- Supported formats: jpg, jpeg, png, pdf, doc, docx
- Max file size: 10MB per file
- Max files: 5 per application

### Environment Setup
- Always run "Register" then "Login" first to set tokens
- For admin testing, manually set `admin_token` with a real admin JWT
- Copy IDs from responses to environment variables for dependent requests

### Error Testing
- Try invalid emails in registration
- Test file upload with invalid formats
- Test admin endpoints without admin token
- Test instructor endpoints with student token

### Commission Testing
- Create a course with a specific price (e.g., $100)
- Purchase the course
- Verify $20 platform commission, $80 instructor amount

## Collection Features

### Automated Tests
- Registration/Login automatically set environment variables
- Response validation for success/error scenarios
- Commission calculation verification

### Environment Variables
- Dynamic token management
- ID copying between requests
- Flexible testing across different users

### Request Organization
- Logical grouping by feature
- Clear naming conventions
- Comprehensive documentation

This setup provides complete testing coverage for all new features including the commission system, instructor verification, and admin approval workflows.
