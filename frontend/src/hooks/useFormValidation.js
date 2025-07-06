import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';

/**
 * Custom hook for real-time form validation with debouncing
 * @param {Object} initialValues - Initial form values
 * @param {Object} validationRules - Validation rules for each field
 * @param {number} debounceDelay - Delay for debounced validation (default: 300ms)
 * @returns {Object} - Form state and handlers
 */
export const useFormValidation = (initialValues, validationRules, debounceDelay = 300) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValidating, setIsValidating] = useState({});

  // Debounce values for validation
  const debouncedValues = useDebounce(values, debounceDelay);

  // Validate a single field
  const validateField = useCallback(async (fieldName, value) => {
    const rule = validationRules[fieldName];
    if (!rule) return '';

    setIsValidating(prev => ({ ...prev, [fieldName]: true }));

    try {
      if (typeof rule === 'function') {
        const error = await rule(value, values);
        return error || '';
      } else if (Array.isArray(rule)) {
        for (const r of rule) {
          const error = await r(value, values);
          if (error) return error;
        }
        return '';
      }
      return '';
    } catch (error) {
      console.error(`Validation error for ${fieldName}:`, error);
      return 'Validation error occurred';
    } finally {
      setIsValidating(prev => ({ ...prev, [fieldName]: false }));
    }
  }, [validationRules, values]);

  // Validate all fields
  const validateAll = useCallback(async () => {
    const newErrors = {};
    const validationPromises = Object.keys(validationRules).map(async (fieldName) => {
      const error = await validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    await Promise.all(validationPromises);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validateField, validationRules, values]);

  // Handle field change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setValues(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  }, []);

  // Handle field blur
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  }, []);

  // Effect to validate fields when debounced values change
  useEffect(() => {
    const validateTouchedFields = async () => {
      const newErrors = { ...errors };

      for (const fieldName of Object.keys(touched)) {
        if (touched[fieldName]) {
          const error = await validateField(fieldName, debouncedValues[fieldName]);
          if (error) {
            newErrors[fieldName] = error;
          } else {
            delete newErrors[fieldName];
          }
        }
      }

      setErrors(newErrors);
    };

    validateTouchedFields();
  }, [debouncedValues, touched, validateField]);

  // Get field status
  const getFieldStatus = useCallback((fieldName) => {
    const value = values[fieldName];
    const error = errors[fieldName];
    const isTouched = touched[fieldName];
    const isValidatingField = isValidating[fieldName];

    if (isValidatingField) return 'validating';
    if (!isTouched || !value) return 'neutral';
    if (error) return 'error';
    return 'success';
  }, [values, errors, touched, isValidating]);

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsValidating({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isValidating,
    handleChange,
    handleBlur,
    validateAll,
    getFieldStatus,
    reset,
    setValues,
    setErrors
  };
};

export default useFormValidation;
