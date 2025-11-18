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
      <section className="py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal variant="fade-up" delay={0.1}>
              <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Des 
Collaborations</span>
                <br />
                <span className="text-gray-800">qui cartonnent</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal variant="fade-up" delay={0.2}>
              <p className="text-lg text-gray-600 mb-12 max-w-xl mx-auto leading-relaxed">
                La plateforme qui connecte influenceurs et commerçants pour des partenariats authentiques et rentables
              </p>
            </ScrollReveal>
            
            <ScrollReveal variant="scale-in" delay={0.3}>
              <div className="flex flex-col gap-4 mb-16 max-w-sm mx-auto">
                <Button size="lg" asChild className="bg-gradient-primary text-white text-lg px-8 py-6 rounded-full hover:opacity-90 w-full">
                  <Link to="/signup?role=influencer">
                    <Star className="w-5 h-5 mr-2" />
                    Je suis influenceur
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-2 border-accent text-accent text-lg px-8 py-6 rounded-full hover:bg-accent hover:text-white w-full">
                  <Link to="/signup?role=merchant">
                    <Building2 className="w-5 h-5 mr-2" />
                    Je suis commerçant
                  </Link>
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Features Cards */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-md">
          <ScrollReveal variant="fade-down" delay={0.1}>
            <div className="bg-gradient-to-br from-pink-100 via-orange-100 to-teal-100 rounded-3xl p-8 mb-8">
              
              {/* Influenceurs */}
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">
                  Influenceurs
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Créez votre profil et monétisez votre audience
                </p>
              </div>

              {/* Collaboration */}
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <HandHeart className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">
                  Collaboration
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Connexion simple et efficace
                </p>
              </div>

              {/* Commerçants */}
              <div className="text-center">
                <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">
                  Commerçants
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Trouvez les parfaits ambassadeurs
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto text-center max-w-md">
          <ScrollReveal variant="fade-up" delay={0.1}>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Pourquoi choisir <span className="bg-gradient-primary bg-clip-text text-transparent">Collabmarket</span> ?
            </h2>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.2}>
            <p className="text-gray-600 mb-12 leading-relaxed">
              Une plateforme pensée pour faciliter vos collaborations et maximiser vos résultats
            </p>
          </ScrollReveal>

          <div className="space-y-12">
            {/* Ciblage précis */}
            <ScrollReveal variant="fade-right" delay={0.1}>
              <div className="bg-gradient-to-br from-pink-50 to-white rounded-3xl p-8">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">
                  Ciblage précis
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Filtrez par niche, audience et budget pour trouver le partenaire idéal
                </p>
              </div>
            </ScrollReveal>

            {/* Process simplifié */}
            <ScrollReveal variant="fade-left" delay={0.2}>
              <div className="bg-gradient-to-br from-orange-50 to-white rounded-3xl p-8">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">
                  Process simplifié
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Commandez et gérez vos collaborations en quelques clics
                </p>
              </div>
            </ScrollReveal>

            {/* Analytics complets */}
            <ScrollReveal variant="zoom-in" delay={0.3}>
              <div className="bg-gradient-to-br from-teal-50 to-white rounded-3xl p-8">
                <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">
                  Analytics complets
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Suivez vos performances et optimisez vos stratégies
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-hero">
        <div className="container mx-auto text-center max-w-md">
          <div className="text-white">
            <ScrollReveal variant="fade-up" delay={0.1}>
              <h2 className="text-4xl font-bold mb-6">
                Prêt à démarrer ?
              </h2>
            </ScrollReveal>
            <ScrollReveal variant="fade-up" delay={0.2}>
              <p className="text-lg mb-10 opacity-90 leading-relaxed">
                Rejoignez des milliers d'influenceurs et commerçants qui font déjà confiance à Collabmarket
              </p>
            </ScrollReveal>
            
            <ScrollReveal variant="scale-in" delay={0.3}>
              <div className="flex flex-col gap-4">
                <Button size="lg" asChild className="bg-white text-primary text-lg px-10 py-6 rounded-full hover:bg-gray-100 w-full">
                  <Link to="/signup?role=influencer">
                    Commencer comme influenceur
                  </Link>
                </Button>
                <Button size="lg" asChild className="bg-gray-800 text-white text-lg px-10 py-6 rounded-full hover:bg-gray-700 w-full">
                  <Link to="/signup?role=merchant">
                    Commencer comme commerçant
                  </Link>
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>;
};
export default Index;