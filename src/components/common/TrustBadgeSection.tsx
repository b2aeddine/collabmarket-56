import { ShieldCheck } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

interface TrustBadgeSectionProps {
  withAnimation?: boolean;
}

export const TrustBadgeSection = ({ withAnimation = false }: TrustBadgeSectionProps) => {
  const content = (
    <section className="py-8 sm:py-12 md:py-16 px-4">
      <div className="container mx-auto max-w-md">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">
              Votre sécurité, notre priorité
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 px-2">
              Collabmarket garantit des transactions 100% sécurisées pour les commerçants et les influenceurs.
            </p>
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                <p className="text-sm sm:text-base text-gray-700 font-medium">
                  💳 Paiement sécurisé
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Votre paiement n'est transféré qu'après validation de la campagne
                </p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                <p className="text-sm sm:text-base text-gray-700 font-medium">
                  🛡️ Protection garantie
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Un système qui évite les arnaques et protège vos investissements
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  if (withAnimation) {
    return (
      <ScrollReveal variant="fade-up" delay={0.2}>
        {content}
      </ScrollReveal>
    );
  }

  return content;
};
