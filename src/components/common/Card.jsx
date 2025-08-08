import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = true,
  padding = 'medium',
  shadow = 'medium',
  rounded = 'medium',
  background = 'white',
  border = false,
  onClick,
  ...props
}) => {
  const baseClasses = 'transition-all duration-200';

  const paddingClasses = {
    none: '',
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6',
    xl: 'p-8',
  };

  const shadowClasses = {
    none: '',
    small: 'shadow-sm',
    medium: 'shadow-md',
    large: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const roundedClasses = {
    none: '',
    small: 'rounded-sm',
    medium: 'rounded-lg',
    large: 'rounded-xl',
    xl: 'rounded-2xl',
  };

  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    blue: 'bg-blue-50',
    transparent: 'bg-transparent',
  };

  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1' : '';
  const borderClasses = border ? 'border border-gray-200' : '';
  const cursorClasses = onClick ? 'cursor-pointer' : '';

  const classes = `
    ${baseClasses}
    ${paddingClasses[padding]}
    ${shadowClasses[shadow]}
    ${roundedClasses[rounded]}
    ${backgroundClasses[background]}
    ${hoverClasses}
    ${borderClasses}
    ${cursorClasses}
    ${className}
  `.trim();

  const cardProps = {
    className: classes,
    onClick,
    ...props,
  };

  if (hover || onClick) {
    return (
      <motion.div
        whileHover={hover ? { y: -4, shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' } : {}}
        whileTap={onClick ? { scale: 0.98 } : {}}
        transition={{ duration: 0.2 }}
        {...cardProps}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div {...cardProps}>
      {children}
    </div>
  );
};

export default Card;
