# 🔐 Admin Setup Guide

## Secret Admin Account Creation

### Overview
This application includes a secret admin setup page for creating the first admin account. This page is hidden from regular users and requires a secret key for access.

### Access URL
```
http://localhost:3000/secret-admin-setup
```

### Secret Key
```
TOURS_ADMIN_2024_SECRET
```

### Features
- ✅ Secret key verification
- ✅ Secure admin account creation
- ✅ Role-based access control
- ✅ Form validation
- ✅ Password strength requirements
- ✅ Responsive design
- ✅ No navbar/footer (hidden page)

### Security Features
1. **Secret Key Protection**: Requires a secret key to access the form
2. **Hidden Route**: Not linked from any public pages
3. **Admin Role Assignment**: Automatically assigns 'admin' role
4. **Password Requirements**: Minimum 6 characters
5. **Form Validation**: Comprehensive client-side validation

### Usage Instructions

1. **Navigate to the secret URL**:
   ```
   http://localhost:3000/secret-admin-setup
   ```

2. **Enter the secret key**:
   ```
   TOURS_ADMIN_2024_SECRET
   ```

3. **Click "Verify Secret Key"**

4. **Fill out the admin registration form**:
   - First Name
   - Last Name
   - Email Address
   - Phone Number
   - Password (min 6 characters)
   - Confirm Password

5. **Click "Create Admin Account"**

6. **You'll be redirected to the admin dashboard**

### Production Deployment

⚠️ **Important Security Notes for Production**:

1. **Change the Secret Key**: 
   - Update the `ADMIN_SECRET_KEY` in `SecretAdminSetup.jsx`
   - Use environment variables instead of hardcoded values
   - Generate a strong, unique secret key

2. **Environment Variables**:
   ```bash
   VITE_ADMIN_SECRET_KEY=your_super_secret_key_here
   ```

3. **Remove After First Admin**:
   - Consider removing this route after creating the first admin
   - Or add additional security layers

4. **Access Logs**:
   - Monitor access to this endpoint
   - Set up alerts for unauthorized attempts

### File Locations
- **Component**: `src/pages/admin/SecretAdminSetup.jsx`
- **Route**: Added in `src/App.jsx`
- **Auth Service**: `src/services/firebase/auth.js`

### Styling
- Dark theme with red accents
- Gradient background
- Responsive design
- Framer Motion animations
- Heroicons for icons

### Error Handling
- Invalid secret key detection
- Form validation errors
- Firebase authentication errors
- Network error handling

### Next Steps After Admin Creation
1. Login to admin dashboard at `/admin`
2. Configure application settings
3. Add content (trips, hotels)
4. Manage users and permissions
5. Review analytics and reports

---

**⚠️ Keep this information secure and do not share the secret key publicly!**
