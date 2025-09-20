# User Management System Setup Instructions

## Overview
This system implements a comprehensive role-based user management system with the following features:

- **Admin Role**: Full system access, can create users with any role
- **Accountant Role**: Financial and invoicing access
- **Invoicing User Role**: Limited invoicing access (default for signup users)
- **Contacts Table**: Stores vendors/customers with or without login access
- **Dynamic Permissions**: Role-based permissions stored in JSON format

## Database Setup

### 1. Run Database Migration
Execute the SQL file to create all necessary tables:
```bash
psql -d your_database_name -f server/src/models/tables.sql
```

### 2. Create Initial Admin User
Run the admin user creation script:
```bash
cd server
node src/utils/createAdminUser.js
```

**Default Admin Credentials:**
- Login ID: `admin`
- Password: `Admin123!`
- Email: `admin@system.com`

## System Features

### User Types & Access

1. **Admin Users**
   - Created only through admin interface
   - Full access to all system features
   - Can create users with any role
   - Stored in `users` table only

2. **Accountant Users**
   - Created only through admin interface
   - Financial and invoicing access
   - Stored in `users` table only

3. **Invoicing Users**
   - Can be created through admin interface OR self-signup
   - Limited invoicing access
   - Stored in both `users` and `contacts` tables

4. **Vendors/Customers**
   - **Without login access**: Stored only in `contacts` table
   - **With login access**: Stored in both `users` and `contacts` tables

### API Endpoints

#### Public Endpoints
- `POST /api/user-management/signup` - User self-registration
- `POST /api/user-management/login` - Login with login_id or email
- `POST /api/user-management/verify-otp` - Verify email OTP

#### Protected Endpoints
- `GET /api/user-management/roles` - Get all available roles

#### Admin Only Endpoints
- `POST /api/user-management/admin/create-user` - Create user with specific role
- `GET /api/user-management/admin/users` - Get all users

### Frontend Routes

- `/login` - User login page
- `/register` - User signup page (creates invoicing_user role)
- `/verify-otp` - Email verification page
- `/admin/users` - Admin user management interface

## Validation Rules

### Login ID
- Must be unique
- 6-12 characters long
- Required for all users

### Password
- Must contain at least one lowercase letter
- Must contain at least one uppercase letter
- Must contain at least one special character
- Must be at least 8 characters long
- Must be unique

### Email
- Must be unique
- Standard email format validation

## Role Permissions Structure

```json
{
  "users": {
    "create": true,
    "read": true,
    "update": true,
    "delete": true
  },
  "products": {
    "create": true,
    "read": true,
    "update": true,
    "delete": true
  },
  "contacts": {
    "create": true,
    "read": true,
    "update": true,
    "delete": true
  }
}
```

## Usage Examples

### 1. Admin Creates User
```javascript
// Admin creates an accountant user
const response = await adminCreateUser(
  "John Doe",
  "john_doe",
  "john@company.com",
  "SecurePass123!",
  2, // accountant role ID
  {
    phone: "+1234567890",
    company: "ABC Corp",
    contactType: "customer"
  }
);
```

### 2. User Self-Signup
```javascript
// User signs up (automatically gets invoicing_user role)
const response = await signupUser(
  "Jane Smith",
  "jane_smith",
  "jane@email.com",
  "MyPass123!"
);
```

### 3. Login
```javascript
// Login with either login_id or email
const response = await loginUser("john_doe", "SecurePass123!");
// or
const response = await loginUser("john@company.com", "SecurePass123!");
```

## Security Features

- Password hashing with bcrypt
- JWT tokens with role information
- Role-based access control middleware
- Input validation and sanitization
- SQL injection protection with parameterized queries

## Next Steps for Scaling

1. **Permission Granularity**: Add more specific permissions (e.g., "products.read.own", "products.read.all")
2. **Role Hierarchy**: Implement role inheritance
3. **Audit Logging**: Track user actions and changes
4. **Bulk Operations**: Add bulk user creation/management
5. **Advanced Contact Management**: Add contact categories, tags, and relationships
6. **API Rate Limiting**: Implement rate limiting for security
7. **Two-Factor Authentication**: Add 2FA support
8. **User Groups**: Create user groups for easier management

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running and credentials are correct
2. **Role Not Found**: Run the database migration script to ensure roles are created
3. **Permission Denied**: Check if user has the correct role and permissions
4. **OTP Not Sent**: Verify email configuration in mailer.js

### Logs
Check server logs for detailed error messages and debugging information.
