
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import { Heart, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Redirection immédiate si l'utilisateur est connecté
  useEffect(() => {
    console.log('Login useEffect - user:', user, 'loading:', loading);
    
    if (user && !loading) {
      console.log('User detected in Login page, redirecting...', user.role);
      
      // Rediriger vers le dashboard selon le rôle
      const redirectTo = user.role === 'admin' 
        ? '/admin/dashboard'
        : user.role === 'influenceur'
        ? '/influencer-dashboard'
        : user.role === 'commercant'
        ? '/merchant-dashboard'
        : '/';
      
      console.log('Redirecting to:', redirectTo);
      navigate(redirectTo, { replace: true });
    }
  }, [user, loading, navigate]);

  // Si l'utilisateur est déjà connecté, ne pas afficher la page (la redirection sera gérée par useEffect)
  if (user && !loading) {
    console.log('User already logged in, not showing login form');
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <p className="text-lg text-gray-600">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Le mot de passe est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('Attempting login with:', formData.email);
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        console.error('Login error:', error);
        
        if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
          setErrors({
            email: "Email ou mot de passe incorrect",
            password: "Email ou mot de passe incorrect"
          });
          toast.error("Email ou mot de passe incorrect");
        } else if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
          toast.error("Veuillez confirmer votre email avant de vous connecter");
        } else {
          toast.error("Erreur de connexion: " + error.message);
        }
      } else {
        console.log('Login successful, user should be updated soon');
        toast.success("Connexion réussie !");
        
        // Forcer une redirection immédiate après connexion réussie
        // Récupérer la session pour obtenir le user_id et son rôle
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Récupérer le profil utilisateur pour obtenir le rôle
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          if (profile?.role) {
            const redirectTo = profile.role === 'admin' 
              ? '/admin/dashboard'
              : profile.role === 'influenceur'
              ? '/influencer-dashboard'
              : profile.role === 'commercant'
              ? '/merchant-dashboard'
              : '/';
            
            console.log('Redirecting immediately to:', redirectTo);
            navigate(redirectTo, { replace: true });
            return; // Sortir de la fonction pour éviter d'arrêter le loading
          }
        }
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50">
      <Header />
      
      <div className="py-6 sm:py-12 px-4">
        <div className="container mx-auto max-w-sm sm:max-w-md">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gradient">
              Bon retour !
            </h1>
            <p className="text-sm sm:text-base text-gray-600 px-4">
              Connectez-vous à votre compte Collabmarket
            </p>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-center text-xl sm:text-2xl">Connexion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? "border-red-500" : ""}
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <PasswordInput
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? "border-red-500" : ""}
                    required
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                  )}
                </div>


                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-primary text-base sm:text-lg py-5 sm:py-6 hover:opacity-90 transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </Button>
              </form>

              <div className="text-center text-sm sm:text-base text-gray-600 px-2">
                Pas encore de compte ?{" "}
                <Link to="/signup" className="text-primary hover:underline font-semibold">
                  Créer un compte
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
