import React from 'react';
import { PiSpinnerGap } from "react-icons/pi";

const Button = ({ 
  children, 
  isLoading, 
  disabled, 
  className = "", 
  variant = "custom", 
  type = "button",
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary px-4 py-2 rounded",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary px-4 py-2 rounded",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive px-4 py-2 rounded",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground focus:ring-ring px-4 py-2 rounded",
    ghost: "hover:bg-accent hover:text-accent-foreground focus:ring-ring px-4 py-2 rounded",
    custom: "",
  };

  const combinedClassName = `${baseStyles} ${variants[variant] || ""} ${className}`;

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
