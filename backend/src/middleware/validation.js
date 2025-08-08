import { body, param, query, validationResult } from 'express-validator';

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
export const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  handleValidationErrors
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

export const validateUserUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  handleValidationErrors
];

// Trip validation rules
export const validateTrip = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('Title must be between 5 and 255 characters'),
  body('description')
    .trim()
    .isLength({ min: 50 })
    .withMessage('Description must be at least 50 characters'),
  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Short description must not exceed 500 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('durationDays')
    .isInt({ min: 1, max: 365 })
    .withMessage('Duration must be between 1 and 365 days'),
  body('maxParticipants')
    .isInt({ min: 1, max: 100 })
    .withMessage('Max participants must be between 1 and 100'),
  body('difficultyLevel')
    .optional()
    .isIn(['Easy', 'Moderate', 'Hard'])
    .withMessage('Difficulty level must be Easy, Moderate, or Hard'),
  body('categoryId')
    .isUUID()
    .withMessage('Please provide a valid category ID'),
  handleValidationErrors
];

// Hotel validation rules
export const validateHotel = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Hotel name must be between 3 and 255 characters'),
  body('description')
    .trim()
    .isLength({ min: 50 })
    .withMessage('Description must be at least 50 characters'),
  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Short description must not exceed 500 characters'),
  body('pricePerNight')
    .isFloat({ min: 0 })
    .withMessage('Price per night must be a positive number'),
  body('starRating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Star rating must be between 1 and 5'),
  body('address')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Address must be at least 10 characters'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  body('categoryId')
    .isUUID()
    .withMessage('Please provide a valid category ID'),
  handleValidationErrors
];

// Booking validation rules
export const validateBooking = [
  body('bookingType')
    .isIn(['trip', 'hotel'])
    .withMessage('Booking type must be either trip or hotel'),
  body('guestName')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Guest name must be between 2 and 255 characters'),
  body('guestEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid guest email'),
  body('guestPhone')
    .isMobilePhone()
    .withMessage('Please provide a valid guest phone number'),
  body('numberOfGuests')
    .isInt({ min: 1, max: 20 })
    .withMessage('Number of guests must be between 1 and 20'),
  body('specialRequests')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Special requests must not exceed 1000 characters'),
  handleValidationErrors
];

// Review validation rules
export const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),
  body('comment')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Comment must be between 10 and 2000 characters'),
  handleValidationErrors
];

// Search validation rules
export const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),
  query('category')
    .optional()
    .isUUID()
    .withMessage('Category must be a valid UUID'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  query('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// UUID parameter validation
export const validateUUID = (paramName = 'id') => [
  param(paramName)
    .isUUID()
    .withMessage(`${paramName} must be a valid UUID`),
  handleValidationErrors
];

// Slug parameter validation
export const validateSlug = (paramName = 'slug') => [
  param(paramName)
    .matches(/^[a-z0-9-]+$/)
    .withMessage(`${paramName} must be a valid slug (lowercase letters, numbers, and hyphens only)`),
  handleValidationErrors
];
