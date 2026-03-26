import React from 'react';

export const Button = ({ 
  children, 
  variant = 'default', 
  disabled = false, 
  onClick, 
  className = '' 
}) => {
  let btnClass = 'btn';
  if (variant === 'primary') btnClass += ' btn-primary';
  if (variant === 'icon') btnClass += ' btn-icon';
  
  return (
    <button 
      className={`${btnClass} ${className}`.trim()} 
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
