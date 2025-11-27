
import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import { Heart, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { logger } from "@/utils/logger";

// Nouveaux composants
import { GradientText, GradientButton } from "@/components/common";
import { InputField, SelectField } from "@/components/forms";
import { TextareaField } from "@/components/forms/TextareaField";
import { RoleSelector } from "@/components/signup/RoleSelector";
import { StepIndicator } from "@/components/signup/StepIndicator";
import { validateEmail, validatePassword, validateSIRET } from "@/utils/validation";

const SignUp = () => {
  const [searchParams] = useSearchParams();
  const { signUp } = useAuth();
  const defaultRole = searchParams.get("role") || "influencer";
  const [selectedRole, setSelectedRole] = useState(defaultRole);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    twitter: "",
    category: "",
    bio: "",
    isAdult: false,
    rgpdConsent: false,
    companyName: "",
    contactName: "",
    businessEmail: "",
    website: "",
    siret: "",
  });

  const categories = [
    "Tech & Gaming", "Mode & Lifestyle", "Beauté & Cosmétiques",
    "Food & Cooking", "Fitness & Sport", "Voyage & Aventure",
    "Art & Créativité", "Business & Finance", "Famille & Parentalité"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Form input change
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateStep = (step: number) => {
    const newErrors: { [key: string]: string } = {};

    if (step === 1) {
      if (!formData.email.trim()) {
        newErrors.email = "L'email est requis";
      } else if (!validateEmail(formData.email)) {
        newErrors.email = "L'email n'est pas valide";
      }

      if (!formData.password.trim()) {
        newErrors.password = "Le mot de passe est requis";
      } else {
        const passwordValidation = validatePassword(formData.password, 8);
        if (!passwordValidation.isValid) {
          newErrors.password = passwordValidation.errors[0] || "Le mot de passe n'est pas valide";
        }
      }
    }

    if (step === 2) {
      if (selectedRole === "influencer") {
        if (!formData.firstName.trim()) {
          newErrors.firstName = "Le prénom est requis";
        }
        if (!formData.lastName.trim()) {
          newErrors.lastName = "Le nom est requis";
        }
        if (!formData.dateOfBirth.trim()) {
          newErrors.dateOfBirth = "La date de naissance est requise";
        } else {
          const birthDate = new Date(formData.dateOfBirth);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 18) {
            newErrors.dateOfBirth = "Vous devez être majeur(e)";
          }
        }
      } else if (selectedRole === "merchant") {
        if (!formData.companyName.trim()) {
          newErrors.companyName = "Le nom de l'entreprise est requis";
        }
        if (!formData.contactName.trim()) {
          newErrors.contactName = "Le nom du contact est requis";
        }
        if (!formData.businessEmail.trim()) {
          newErrors.businessEmail = "L'email professionnel est requis";
        } else if (!validateEmail(formData.businessEmail)) {
          newErrors.businessEmail = "L'email professionnel n'est pas valide";
        }
        if (!formData.siret.trim()) {
          newErrors.siret = "Le SIRET est requis";
        } else if (!validateSIRET(formData.siret)) {
          newErrors.siret = "Le SIRET n'est pas valide";
        }
      }
    }

    if (step === 3) {
      if (!formData.isAdult) {
        newErrors.isAdult = "Vous devez certifier être majeur(e)";
      }
      if (!formData.rgpdConsent) {
        newErrors.rgpdConsent = "Vous devez accepter le traitement de vos données";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(3)) {
      return;
    }

    setIsLoading(true);

    try {
      const userData: Record<string, string | boolean | undefined> = {
        role: selectedRole === "influencer" ? "influencer" : selectedRole === "admin" ? "admin" : "merchant"
      };

      if (selectedRole === "influencer") {
        userData.first_name = formData.firstName.trim();
        userData.last_name = formData.lastName.trim();
        userData.date_of_birth = formData.dateOfBirth;
        userData.bio = formData.bio;
        userData.category = formData.category;
      } else {
        const nameParts = formData.contactName.trim().split(' ');
        userData.first_name = nameParts[0] || '';
        userData.last_name = nameParts.slice(1).join(' ') || '';
        userData.company_name = formData.companyName;
        userData.business_email = formData.businessEmail;
        userData.website = formData.website;
        userData.siret = formData.siret;
      }

      const { error } = await signUp(formData.email, formData.password, userData);

      if (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';

        if (errorMessage.includes('User already registered') || errorMessage.includes('already registered')) {
          setErrors({ email: "Un compte avec cet email existe déjà" });
          toast.error("Un compte avec cet email existe déjà. Essayez de vous connecter.");
        } else if (errorMessage.includes('Password should be at least 6 characters')) {
          setErrors({ password: "Le mot de passe doit contenir au moins 6 caractères" });
          toast.error("Le mot de passe doit contenir au moins 6 caractères.");
        } else if (errorMessage.includes('Invalid email')) {
          setErrors({ email: "L'adresse email n'est pas valide" });
          toast.error("L'adresse email n'est pas valide.");
        } else if (errorMessage.includes('Signup disabled')) {
          toast.error("Les inscriptions sont temporairement désactivées.");
        } else {
          toast.error("Erreur lors de l'inscription: " + errorMessage);
        }
        setIsLoading(false);
        return;
      }

      toast.success("Inscription réussie ! Redirection vers votre dashboard...");

      // Redirection immédiate selon le rôle sans attendre la vérification email
      setTimeout(() => {
        if (selectedRole === "influencer") {
          // Pour les influenceurs, rediriger vers l'onboarding Stripe obligatoire
          window.location.href = "/influencer-dashboard?onboarding=stripe";
        } else {
          window.location.href = "/merchant-dashboard";
        }
      }, 1000);

    } catch (error) {
      logger.error('Unexpected signup error:', error);
      toast.error("Une erreur inattendue s'est produite. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50">
        <Header />

        <div className="py-6 sm:py-12 px-4">
          <div className="container mx-auto max-w-2xl">
            <Card className="shadow-xl border-0 text-center">
              <CardContent className="py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  <GradientText>Inscription réussie !</GradientText>
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 mb-4">
                  Vérifiez votre email pour activer votre compte.
                </p>
                <GradientButton asChild>
                  <Link to="/login">Se connecter</Link>
                </GradientButton>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50">
      <Header />

      <div className="py-6 sm:py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold mb-4">
              <GradientText>Rejoignez Collabmarket</GradientText>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">
              Créez votre compte et commencez à collaborer
            </p>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-center text-xl sm:text-2xl">
                Inscription - Étape {currentStep}/3
              </CardTitle>
              <StepIndicator currentStep={currentStep} totalSteps={3} />
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <RoleSelector selectedRole={selectedRole} onRoleChange={setSelectedRole} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Email"
                      type="email"
                      name="email"
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      error={errors.email}
                      required
                    />
                    <InputField
                      label="Mot de passe"
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      error={errors.password}
                      description="Minimum 6 caractères"
                      required
                    />
                  </div>

                  <GradientButton onClick={nextStep} className="w-full text-lg py-6">
                    Continuer
                  </GradientButton>
                </div>
              )}

              {currentStep === 2 && selectedRole === "influencer" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Prénom"
                      name="firstName"
                      placeholder="Votre prénom"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      error={errors.firstName}
                      required
                    />
                    <InputField
                      label="Nom"
                      name="lastName"
                      placeholder="Votre nom"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      error={errors.lastName}
                      required
                    />
                  </div>

                  <InputField
                    label="Date de naissance"
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    error={errors.dateOfBirth}
                    required
                  />

                  <SelectField
                    label="Catégorie principale"
                    placeholder="Sélectionnez votre niche"
                    value={formData.category}
                    onChange={(value) => handleSelectChange("category", value)}
                    options={categories.map(cat => ({ value: cat, label: cat }))}
                  />

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Réseaux sociaux (optionnel)</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Vous pourrez connecter vos comptes plus tard depuis votre profil pour afficher vos statistiques automatiquement.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField
                        label="Instagram"
                        name="instagram"
                        placeholder="@votre_instagram"
                        value={formData.instagram}
                        onChange={handleInputChange}
                      />
                      <InputField
                        label="TikTok"
                        name="tiktok"
                        placeholder="@votre_tiktok"
                        value={formData.tiktok}
                        onChange={handleInputChange}
                      />
                      <InputField
                        label="YouTube"
                        name="youtube"
                        placeholder="Votre chaîne YouTube"
                        value={formData.youtube}
                        onChange={handleInputChange}
                      />
                      <InputField
                        label="Twitter (X)"
                        name="twitter"
                        placeholder="@votre_twitter"
                        value={formData.twitter}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between gap-3">
                    <Button variant="outline" onClick={prevStep}>
                      Retour
                    </Button>
                    <GradientButton onClick={nextStep}>
                      Continuer
                    </GradientButton>
                  </div>
                </div>
              )}


              {currentStep === 2 && selectedRole === "merchant" && (
                <div className="space-y-4">
                  <InputField
                    label="Nom de l'entreprise"
                    name="companyName"
                    placeholder="Mon Entreprise"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    error={errors.companyName}
                    required
                  />

                  <InputField
                    label="Nom du contact"
                    name="contactName"
                    placeholder="Votre nom"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    error={errors.contactName}
                    required
                  />

                  <InputField
                    label="Email professionnel"
                    type="email"
                    name="businessEmail"
                    placeholder="contact@monentreprise.com"
                    value={formData.businessEmail}
                    onChange={handleInputChange}
                    error={errors.businessEmail}
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Site internet (optionnel)"
                      name="website"
                      placeholder="https://monsite.com"
                      value={formData.website}
                      onChange={handleInputChange}
                    />
                    <InputField
                      label="SIRET"
                      name="siret"
                      placeholder="12345678901234"
                      value={formData.siret}
                      onChange={handleInputChange}
                      error={errors.siret}
                      required
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between gap-3">
                    <Button variant="outline" onClick={prevStep}>
                      Retour
                    </Button>
                    <GradientButton onClick={nextStep}>
                      Continuer
                    </GradientButton>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {selectedRole === "influencer" && (
                    <TextareaField
                      label="Bio"
                      placeholder="Parlez-nous de vous et de votre contenu..."
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      required={false}
                    />
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isAdult"
                        checked={formData.isAdult}
                        onCheckedChange={(checked) => handleCheckboxChange("isAdult", checked as boolean)}
                      />
                      <Label htmlFor="isAdult" className="text-sm">
                        Je certifie être majeur(e) *
                      </Label>
                    </div>
                    {errors.isAdult && (
                      <p className="text-sm text-red-500 mt-1">{errors.isAdult}</p>
                    )}

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rgpdConsent"
                        checked={formData.rgpdConsent}
                        onCheckedChange={(checked) => handleCheckboxChange("rgpdConsent", checked as boolean)}
                      />
                      <Label htmlFor="rgpdConsent" className="text-sm">
                        J'accepte le traitement de mes données personnelles conformément au RGPD *
                      </Label>
                    </div>
                    {errors.rgpdConsent && (
                      <p className="text-sm text-red-500 mt-1">{errors.rgpdConsent}</p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between gap-3">
                    <Button variant="outline" onClick={prevStep} type="button">
                      Retour
                    </Button>
                    <GradientButton
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Création en cours...
                        </>
                      ) : (
                        "Créer mon compte"
                      )}
                    </GradientButton>
                  </div>
                </form>
              )}

              <div className="text-center text-gray-600">
                Déjà inscrit ?{" "}
                <Link to="/login" className="text-primary hover:underline font-semibold">
                  Se connecter
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
