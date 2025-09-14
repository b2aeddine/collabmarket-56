
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { GlobalLoader } from '@/components/common/GlobalLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'commercant' | 'influenceur' | 'admin';
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  requireRole, 
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate(redirectTo);
    }
  }, [user, loading, navigate, redirectTo]);

  if (loading) {
    return <GlobalLoader message="Vérification en cours..." />;
  }

  if (!user) {
    return null;
  }

  if (requireRole && user?.role !== requireRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Accès non autorisé</h1>
          <p className="text-gray-600 mb-4">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <p className="text-sm text-gray-500">
            Rôle requis: {requireRole}, votre rôle: {user?.role}
          </p>
        </div>
      </div>
    );
  }


  return <>{children}</>;
};

export default ProtectedRoute;
