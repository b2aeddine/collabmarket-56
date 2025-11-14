import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export const AnimatedLoader = ({ 
  size = "md", 
  className,
  text 
}: AnimatedLoaderProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin-slow text-primary", sizeClasses[size])} />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse-subtle">
          {text}
        </p>
      )}
    </div>
  );
};

