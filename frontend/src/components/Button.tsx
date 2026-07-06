import React, { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', style, ...props }) => {
  const getColors = () => {
    switch (variant) {
      case 'secondary':
        return { bg: '#2d2d3f', text: '#fff', hoverBg: '#3d3d55' };
      case 'danger':
        return { bg: '#ff5c75', text: '#fff', hoverBg: '#e04b61' };
      case 'primary':
      default:
        return { bg: '#00e1d9', text: '#000', hoverBg: '#00c4bd' };
    }
  };

  const colors = getColors();

  return (
    <button
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: 'none',
        padding: '10px 18px',
        borderRadius: '6px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        fontSize: '0.9rem',
        ...style
      }}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = colors.hoverBg)}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = colors.bg)}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
