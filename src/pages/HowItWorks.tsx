import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { User, FileEdit, Search, Handshake } from "lucide-react";
import ScrollReveal from "@/components/common/ScrollReveal";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto text-center max-w-md">
          <ScrollReveal variant="slide-down" delay={0.1}>
            <h1 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
              <span className="text-gray-800">Comment</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                ça marche
              </span>
              <span className="text-secondary text-5xl">?</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.2}>
            <p className="text-lg text-gray-600 mb-12 leading-relaxed">
              Découvrez comment Collabmarket révolutionne les collaborations entre influenceurs et commerçants
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* 4 Steps Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-md">
          <ScrollReveal variant="fade-up" delay={0.1}>
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              4 étapes simples pour commencer
            </h2>
          </ScrollReveal>
          
          <div className="space-y-8">
            {/* Step 1 */}
            <ScrollReveal variant="slide-up" delay={0.1}>
              <div className="relative">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4 flex-shrink-0">
                    1
                  </div>
                  <div className="bg-white rounded-3xl p-8 shadow-lg flex-1">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">
                      Inscrivez-vous
                    </h3>
                    <p className="text-gray-600 text-center leading-relaxed">
                      Créez votre compte gratuitement en choisissant votre rôle : influenceur ou commerçant
                    </p>
                  </div>
                </div>
                <div className="absolute left-6 top-16 w-0.5 h-12 bg-gray-200"></div>
              </div>
            </ScrollReveal>

            {/* Step 2 */}
            <ScrollReveal variant="slide-up" delay={0.2}>
              <div className="relative">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4 flex-shrink-0">
                    2
                  </div>
                  <div className="bg-white rounded-3xl p-8 shadow-lg flex-1">
                    <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                      <FileEdit className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">
                      Créez votre profil
                    </h3>
                    <p className="text-gray-600 text-center leading-relaxed">
                      Ajoutez vos informations, vos réseaux sociaux et définissez vos services
                    </p>
                  </div>
                </div>
                <div className="absolute left-6 top-16 w-0.5 h-12 bg-gray-200"></div>
              </div>
            </ScrollReveal>

            {/* Step 3 */}
            <ScrollReveal variant="slide-up" delay={0.3}>
              <div className="relative">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4 flex-shrink-0">
                    3
                  </div>
                  <div className="bg-white rounded-3xl p-8 shadow-lg flex-1">
                    <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">
                      Connectez-vous
                    </h3>
                    <p className="text-gray-600 text-center leading-relaxed">
                      Trouvez le partenaire idéal grâce à nos filtres de recherche avancés
                    </p>
                  </div>
                </div>
                <div className="absolute left-6 top-16 w-0.5 h-12 bg-gray-200"></div>
              </div>
            </ScrollReveal>

            {/* Step 4 */}
            <ScrollReveal variant="slide-up" delay={0.4}>
              <div className="relative">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4 flex-shrink-0">
                    4
                  </div>
                  <div className="bg-white rounded-3xl p-8 shadow-lg flex-1">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Handshake className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">
                      Collaborez
                    </h3>
                    <p className="text-gray-600 text-center leading-relaxed">
                      Lancez vos collaborations et suivez vos performances en temps réel
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* For Influencers Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-md">
          <ScrollReveal variant="fade-up" delay={0.1}>
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
              Pour les <span className="text-primary">Influenceurs</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.2}>
            <p className="text-lg text-gray-600 text-center mb-12 leading-relaxed">
              Monétisez votre audience et développez vos partenariats
            </p>
          </ScrollReveal>

          <div className="space-y-8">
            {/* Create Showcase */}
            <ScrollReveal variant="fade-right" delay={0.1}>
              <div className="bg-pink-50 rounded-3xl p-8">
                <div className="text-center mb-6">
                  ⭐
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">
                  Créez votre showcase
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Présentez vos réseaux sociaux, votre audience et vos tarifs
                </p>
              </div>
            </ScrollReveal>

            {/* Manage Offers */}
            <ScrollReveal variant="fade-left" delay={0.2}>
              <div className="bg-orange-50 rounded-3xl p-8">
                <div className="text-center mb-6 text-2xl">
                  💼
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">
                  Gérez vos offres
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Définissez vos services : posts, stories, reels avec vos prix
                </p>
              </div>
            </ScrollReveal>

            {/* Receive Orders */}
            <ScrollReveal variant="fade-right" delay={0.3}>
              <div className="bg-teal-50 rounded-3xl p-8">
                <div className="text-center mb-6 text-2xl">
                  📦
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">
                  Recevez des commandes
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Les marques vous trouvent et commandent directement vos services
                </p>
              </div>
            </ScrollReveal>

            {/* Track Revenue */}
            <ScrollReveal variant="fade-left" delay={0.4}>
              <div className="bg-yellow-50 rounded-3xl p-8">
                <div className="text-center mb-6 text-2xl">
                  💰
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">
                  Suivez vos revenus
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Dashboard complet avec statistiques et gestion des paiements
                </p>
              </div>
            </ScrollReveal>
          </div>

          <div className="mt-12 text-center">
            <Button 
              size="lg" 
              asChild 
              className="bg-gradient-primary text-white text-lg px-8 py-6 rounded-full hover:opacity-90 w-full"
            >
              <Link to="/signup?role=influencer">
                Devenir influenceur
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* For Merchants Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-md">
          <ScrollReveal variant="fade-up" delay={0.1}>
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
              Pour les <span className="text-accent">Commerçants</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.2}>
            <p className="text-lg text-gray-600 text-center mb-12 leading-relaxed">
              Trouvez les parfaits ambassadeurs pour votre marque
            </p>
          </ScrollReveal>

          <div className="space-y-8">
            {/* Browse Catalog */}
            <ScrollReveal variant="zoom-in" delay={0.1}>
              <div className="bg-teal-50 rounded-3xl p-8">
                <div className="text-center mb-6 text-2xl">
                  🔍
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">
                  Parcourez le catalogue
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Découvrez des milliers d'influenceurs par niche et budget
                </p>
              </div>
            </ScrollReveal>

            {/* Filter Precisely */}
            <ScrollReveal variant="zoom-in" delay={0.2}>
              <div className="bg-red-50 rounded-3xl p-8">
                <div className="text-center mb-6 text-2xl">
                  🎯
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">
                  Filtrez précisément
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Trouvez l'influenceur parfait selon vos critères spécifiques
                </p>
              </div>
            </ScrollReveal>

            {/* Order Simply */}
            <ScrollReveal variant="zoom-in" delay={0.3}>
              <div className="bg-yellow-50 rounded-3xl p-8">
                <div className="text-center mb-6 text-2xl">
                  ⚡
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">
                  Commandez simplement
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Choisissez un service et passez commande en quelques clics
                </p>
              </div>
            </ScrollReveal>

            {/* Track Campaigns */}
            <ScrollReveal variant="zoom-in" delay={0.4}>
              <div className="bg-green-50 rounded-3xl p-8">
                <div className="text-center mb-6 text-2xl">
                  📊
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">
                  Suivez vos campagnes
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Tableau de bord pour gérer toutes vos collaborations
                </p>
              </div>
            </ScrollReveal>
          </div>

          <div className="mt-12 text-center">
            <Button 
              size="lg" 
              asChild 
              className="bg-accent text-white text-lg px-8 py-6 rounded-full hover:bg-accent/90 w-full"
            >
              <Link to="/signup?role=merchant">
                Devenir commerçant
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-md">
          <ScrollReveal variant="fade-up" delay={0.1}>
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
              Questions fréquentes
            </h2>
          </ScrollReveal>

          <div className="space-y-6">
            {/* FAQ Item 1 */}
            <ScrollReveal variant="fade-left" delay={0.1}>
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-gray-800">
                  Collabmarket prend-elle une commission ?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Oui, nous prélevons une petite commission sur chaque transaction pour maintenir et améliorer la plateforme.
                </p>
              </div>
            </ScrollReveal>

            {/* FAQ Item 2 */}
            <ScrollReveal variant="fade-right" delay={0.2}>
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-gray-800">
                  Comment sont protégés les paiements ?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Tous les paiements sont sécurisés et le versement aux influenceurs se fait après validation du travail.
                </p>
              </div>
            </ScrollReveal>

            {/* FAQ Item 3 */}
            <ScrollReveal variant="fade-left" delay={0.3}>
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-gray-800">
                  Puis-je modifier mes tarifs ?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Oui, vous pouvez ajuster vos tarifs et services à tout moment depuis votre dashboard.
                </p>
              </div>
            </ScrollReveal>

            {/* FAQ Item 4 */}
            <ScrollReveal variant="fade-right" delay={0.4}>
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-gray-800">
                  Y a-t-il un minimum de followers ?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Non, nous accueillons tous les influenceurs, des nano aux macro-influenceurs.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center max-w-md">
          <ScrollReveal variant="scale-in" delay={0.1}>
            <div className="bg-gradient-hero rounded-3xl p-12 text-white">
              <h2 className="text-4xl font-bold mb-6">
                Prêt à commencer ?
              </h2>
              <p className="text-lg mb-10 opacity-90 leading-relaxed">
                Rejoignez des milliers d'utilisateurs qui font déjà confiance à Collabmarket
              </p>
              
              <div className="space-y-4">
                <Button 
                  size="lg" 
                  asChild 
                  className="bg-white text-primary text-lg px-10 py-6 rounded-full hover:bg-gray-100 w-full"
                >
                  <Link to="/signup?role=influencer">
                    Je suis influenceur
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  asChild 
                  className="bg-gray-800 text-white text-lg px-10 py-6 rounded-full hover:bg-gray-700 w-full"
                >
                  <Link to="/signup?role=merchant">
                    Je suis commerçant
                  </Link>
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
