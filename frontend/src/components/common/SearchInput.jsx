import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const SearchInput = ({
  value,
  onChange,
  onKeyPress,
  placeholder = "Search...",
  className = "",
  size = "medium", // small, medium, large
  disabled = false,
  autoFocus = false,
  ...props
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      input: "pl-8 pr-3 py-1.5 text-sm",
      icon: "h-3.5 w-3.5",
      iconContainer: "pl-2.5"
    },
    medium: {
      input: "pl-10 pr-4 py-2.5 text-sm",
      icon: "h-4 w-4",
      iconContainer: "pl-3"
    },
    large: {
      input: "pl-12 pr-4 py-3 text-base",
      icon: "h-5 w-5",
      iconContainer: "pl-3.5"
    }
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  const baseInputClasses = `
    w-full 
    border border-gray-300 
    rounded-lg 
    bg-gray-50 
    focus:bg-white 
    focus:outline-none 
    focus:ring-2 
    focus:ring-blue-500 
    focus:border-transparent 
    transition-all 
    duration-200
    ${config.input}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="relative">
      {/* Search Icon */}
      <div className={`absolute inset-y-0 left-0 ${config.iconContainer} flex items-center justify-center pointer-events-none`}>
        <MagnifyingGlassIcon className={`${config.icon} text-gray-400`} />
      </div>
      
      {/* Input Field */}
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={baseInputClasses}
        {...props}
      />
    </div>
  );
};

export default SearchInput;
