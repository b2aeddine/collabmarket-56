import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import { User, HandHeart, Building2, Target, Zap, BarChart3, Star, Users } from "lucide-react";
import ScrollReveal from "@/components/common/ScrollReveal";

const Index = () => {
  return <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="py-8 sm:py-12 md:py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 leading-tight">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Des 
Collaborations</span>
              <br />
              <span className="text-gray-800">qui cartonnent</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-12 max-w-xl mx-auto leading-relaxed px-4">
              La plateforme qui connecte influenceurs et commerçants pour des partenariats authentiques et rentables
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-12 sm:mb-16 max-w-lg mx-auto px-4">
              <Button size="lg" asChild className="bg-gradient-primary text-white text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full hover:opacity-90 w-full sm:flex-1">
                <Link to="/signup?role=influencer">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Je suis influenceur
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-2 border-accent text-accent text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full hover:bg-accent hover:text-white w-full sm:flex-1">
                <Link to="/signup?role=merchant">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Je suis commerçant
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Cards */}
      <section className="py-8 sm:py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-md">
          <div className="bg-gradient-to-br from-pink-100 via-orange-100 to-teal-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-8">
            
            {/* Influenceurs */}
            <div className="text-center mb-10 sm:mb-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">
                Influenceurs
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
                Créez votre profil et monétisez votre audience
              </p>
            </div>

            {/* Collaboration */}
            <div className="text-center mb-10 sm:mb-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <HandHeart className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">
                Collaboration
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
                Connexion simple et efficace
              </p>
            </div>

            {/* Commerçants */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">
                Commerçants
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
                Trouvez les parfaits ambassadeurs
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-8 sm:py-12 md:py-16 px-4">
        <div className="container mx-auto text-center max-w-md">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gray-800 px-2">
            Pourquoi choisir <span className="bg-gradient-primary bg-clip-text text-transparent">Collabmarket</span> ?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-8 sm:mb-12 leading-relaxed px-4">
            Une plateforme pensée pour faciliter vos collaborations et maximiser vos résultats
          </p>

          <div className="space-y-8 sm:space-y-12">
            {/* Ciblage précis */}
            <div className="bg-gradient-to-br from-pink-50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Target className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">
                Ciblage précis
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
                Filtrez par niche, audience et budget pour trouver le partenaire idéal
              </p>
            </div>

            {/* Process simplifié */}
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">
                Process simplifié
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
                Commandez et gérez vos collaborations en quelques clics
              </p>
            </div>

            {/* Analytics complets */}
            <div className="bg-gradient-to-br from-teal-50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">
                Analytics complets
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
                Suivez vos performances et optimisez vos stratégies
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-gradient-hero">
        <div className="container mx-auto text-center max-w-lg">
          <div className="text-white px-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Prêt à démarrer ?
            </h2>
            <p className="text-base sm:text-lg mb-8 sm:mb-10 opacity-90 leading-relaxed px-4">
              Rejoignez des milliers d'influenceurs et commerçants qui font déjà confiance à Collabmarket
            </p>
            
            <div className="flex flex-col gap-3 sm:gap-4 px-4">
              <Button size="lg" asChild className="bg-white text-primary text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 rounded-full hover:bg-gray-100 w-full">
                <Link to="/signup?role=influencer">
                  Commencer comme influenceur
                </Link>
              </Button>
              <Button size="lg" asChild className="bg-gray-800 text-white text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 rounded-full hover:bg-gray-700 w-full">
                <Link to="/signup?role=merchant">
                  Commencer comme commerçant
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>;
};
export default Index;