import React from 'react';

export function Button({ children, className = '', variant = 'default', size = 'default', ...props }) {
  const baseStyles = {
    default: 'px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700',
    outline: 'px-4 py-2 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50',
    link: 'text-blue-600 hover:text-blue-700 underline',
  };

  const sizeStyles = {
    default: '',
    sm: 'px-3 py-1 text-sm',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles[variant]} ${sizeStyles[size]} transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
} 