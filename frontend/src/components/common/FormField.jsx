import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

/**
 * Enhanced form field component with real-time validation
 */
const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  error,
  status = 'neutral', // 'neutral', 'success', 'error', 'validating'
  showPasswordToggle = false,
  showPassword = false,
  onPasswordToggle,
  autoComplete,
  className = '',
  ...props
}) => {
  const getFieldClasses = () => {
    const baseClasses = 'appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm transition-colors duration-200';
    
    switch (status) {
      case 'error':
        return `${baseClasses} border-red-300 focus:ring-red-500 focus:border-red-500`;
      case 'success':
        return `${baseClasses} border-green-300 focus:ring-green-500 focus:border-green-500`;
      case 'validating':
        return `${baseClasses} border-blue-300 focus:ring-blue-500 focus:border-blue-500`;
      default:
        return `${baseClasses} border-gray-300 focus:ring-blue-500 focus:border-blue-500`;
    }
  };

  const renderIcon = () => {
    if (showPasswordToggle) {
      return (
        <div className="absolute inset-y-0 right-0 flex items-center">
          {status === 'success' && (
            <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
          )}
          {status === 'error' && (
            <XMarkIcon className="h-5 w-5 text-red-500 mr-2" />
          )}
          {status === 'validating' && (
            <div className="mr-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
          <button
            type="button"
            className="pr-3 flex items-center"
            onClick={onPasswordToggle}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      );
    }

    switch (status) {
      case 'success':
        return (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <CheckIcon className="h-5 w-5 text-green-500" />
          </div>
        );
      case 'error':
        return (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <XMarkIcon className="h-5 w-5 text-red-500" />
          </div>
        );
      case 'validating':
        return (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="mt-1 relative">
        <input
          id={name}
          name={name}
          type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`${getFieldClasses()} ${showPasswordToggle ? 'pr-20' : 'pr-10'}`}
          {...props}
        />
        {renderIcon()}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="mt-1 text-sm text-red-600"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default FormField;
