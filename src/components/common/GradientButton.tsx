
import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GradientButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  asChild?: boolean;
}

export const GradientButton = ({ 
  children, 
  className = "", 
  onClick, 
  type = "button",
  disabled = false,
  asChild = false,
  ...props 
}: GradientButtonProps) => {
  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      asChild={asChild}
      className={cn(
        "bg-gradient-to-r from-pink-500 via-purple-500 to-teal-500 hover:from-pink-600 hover:via-purple-600 hover:to-teal-600 text-white border-0",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};
