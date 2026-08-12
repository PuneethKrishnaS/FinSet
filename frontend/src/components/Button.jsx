import React from 'react';
import { PiSpinnerGap } from "react-icons/pi";

const Button = ({ 
  children, 
  isLoading, 
  disabled, 
  className = "", 
  variant = "primary", 
  type = "button",
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-medium px-4 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground focus:ring-ring",
    ghost: "hover:bg-accent hover:text-accent-foreground focus:ring-ring",
  };

  const combinedClassName = `${baseStyles} ${variants[variant] || variants.primary} ${className}`;

  return (
    <button
      type={type}
      className={combinedClassName}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <PiSpinnerGap className="animate-spin" size={18} />}
      {children}
    </button>
  );
};

export default Button;
