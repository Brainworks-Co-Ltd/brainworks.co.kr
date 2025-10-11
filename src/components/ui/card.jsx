import React from 'react';

export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`p-8 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={`text-2xl font-bold text-gray-900 ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-8 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
} 