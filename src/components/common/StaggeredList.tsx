import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StaggeredListProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number; // Delay between items in ms
}

/**
 * Wrapper component that applies staggered fade-in animations to list items
 * Each child will appear with a slight delay after the previous one
 */
export const StaggeredList = ({ 
  children, 
  className,
  staggerDelay = 50 
}: StaggeredListProps) => {
  return (
    <div className={cn("contents", className)}>
      {children.map((child, index) => (
        <div
          key={index}
          className="animate-fade-in"
          style={{
            animationDelay: `${index * staggerDelay}ms`,
            animationFillMode: 'both'
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

