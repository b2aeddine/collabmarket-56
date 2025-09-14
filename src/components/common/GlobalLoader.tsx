import { LoadingSpinner } from "./LoadingSpinner";

interface GlobalLoaderProps {
  message?: string;
  className?: string;
}

export const GlobalLoader = ({ 
  message = "Chargement...", 
  className = "" 
}: GlobalLoaderProps) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50 flex items-center justify-center ${className}`}>
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600 text-lg">{message}</p>
      </div>
    </div>
  );
};