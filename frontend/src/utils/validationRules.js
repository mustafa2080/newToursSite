/**
 * Validation rules for form fields
 */

// Email validation
export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address';
  return '';
};

// Password validation
export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return '';
};

// Strong password validation
export const validateStrongPassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  
  let strength = 0;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  if (strength < 3) return 'Password is too weak. Use a mix of letters, numbers, and symbols';
  return '';
};

// Name validation
export const validateName = (name, fieldName = 'Name') => {
  if (!name || !name.trim()) return `${fieldName} is required`;
  if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`;
  if (!/^[a-zA-Z\s]+$/.test(name)) return `${fieldName} can only contain letters`;
  return '';
};

// First name validation
export const validateFirstName = (firstName) => validateName(firstName, 'First name');

// Last name validation
export const validateLastName = (lastName) => validateName(lastName, 'Last name');

// Phone validation
export const validatePhone = (phone) => {
  if (!phone) return ''; // Phone is optional
  if (!/^\+?[\d\s\-\(\)]{10,}$/.test(phone)) return 'Please enter a valid phone number';
  return '';
};

// Confirm password validation
export const validateConfirmPassword = (confirmPassword, allValues) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (confirmPassword !== allValues.password) return 'Passwords do not match';
  return '';
};

// Terms agreement validation
export const validateTermsAgreement = (agreed) => {
  if (!agreed) return 'You must agree to the terms and conditions';
  return '';
};

// Login validation rules
export const loginValidationRules = {
  email: validateEmail,
  password: validatePassword
};

// Registration validation rules
export const registerValidationRules = {
  firstName: validateFirstName,
  lastName: validateLastName,
  email: validateEmail,
  password: validateStrongPassword,
  confirmPassword: validateConfirmPassword,
  phone: validatePhone,
  agreeToTerms: validateTermsAgreement
};

// Password strength calculator
export const calculatePasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
};

// Password strength text
export const getPasswordStrengthText = (strength) => {
  switch (strength) {
    case 0:
    case 1:
      return 'Very Weak';
    case 2:
      return 'Weak';
    case 3:
      return 'Fair';
    case 4:
      return 'Good';
    case 5:
      return 'Strong';
    default:
      return '';
  }
};

// Password strength color
export const getPasswordStrengthColor = (strength) => {
  switch (strength) {
    case 0:
    case 1:
      return 'bg-red-500';
    case 2:
      return 'bg-orange-500';
    case 3:
      return 'bg-yellow-500';
    case 4:
      return 'bg-blue-500';
    case 5:
      return 'bg-green-500';
    default:
      return 'bg-gray-300';
  }
};
