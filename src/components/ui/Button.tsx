import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  onClick 
}: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };
  
  const sizes = {
    small: 'px-2 py-1 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}