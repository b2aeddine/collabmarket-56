import { ReactNode, Suspense } from "react";
import { GlobalLoader } from "./GlobalLoader";

interface PageTransitionProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const PageTransition = ({ 
  children, 
  fallback = <GlobalLoader message="Chargement de la page..." /> 
}: PageTransitionProps) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};