import React from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon = null,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500',
    ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500',
  };

  const sizeClasses = {
    small: 'px-4 py-2 text-lg',
    medium: 'px-5 py-3 text-lg',
    large: 'px-7 py-4 text-xl',
    xl: 'px-9 py-5 text-2xl',
  };

  const iconSizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-5 w-5',
    large: 'h-6 w-6',
    xl: 'h-7 w-7',
  };

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();

  const handleClick = (e) => {
    if (disabled || loading) return;
    onClick?.(e);
  };

  const renderIcon = (position) => {
    if (!icon || iconPosition !== position) return null;
    
    const iconElement = React.cloneElement(icon, {
      className: `${iconSizeClasses[size]} ${
        children && position === 'left' ? 'mr-2' : ''
      } ${children && position === 'right' ? 'ml-2' : ''}`
    });

    return iconElement;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <LoadingSpinner 
            size={size === 'small' ? 'small' : 'medium'} 
            color="white" 
          />
          {children && <span className="ml-2">{children}</span>}
        </>
      );
    }

    return (
      <>
        {renderIcon('left')}
        {children}
        {renderIcon('right')}
      </>
    );
  };

  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      className={classes}
      onClick={handleClick}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {renderContent()}
    </motion.button>
  );
};

export default Button;
