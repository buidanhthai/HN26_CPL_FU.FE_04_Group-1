import React, { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', style, ...props }) => {
  const getColors = () => {
    switch (variant) {
      case 'secondary':
        return { 
          bg: 'var(--surface-color)', 
          text: 'var(--secondary-text)', 
          hoverBg: 'rgba(111, 78, 55, 0.12)',
          border: '1px solid var(--border-color)'
        };
      case 'danger':
        return { 
          bg: '#e07a5f', 
          text: '#ffffff', 
          hoverBg: '#c65f45',
          border: 'none'
        };
      case 'primary':
      default:
        return { 
          bg: 'var(--accent-color)', 
          text: 'var(--primary-text)', 
          hoverBg: 'var(--accent-hover)',
          border: 'none'
        };
    }
  };

  const colors = getColors();

  return (
    <button
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: colors.border || 'none',
        padding: '10px 22px',
        borderRadius: '25px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        fontSize: '0.9rem',
        fontFamily: 'var(--font-ui)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: variant === 'primary' ? '0 4px 10px rgba(212, 163, 115, 0.2)' : 'none',
        ...style
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = colors.hoverBg;
        if (variant === 'primary') {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 15px rgba(212, 163, 115, 0.35)';
        } else {
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = colors.bg;
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = variant === 'primary' ? '0 4px 10px rgba(212, 163, 115, 0.2)' : 'none';
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
