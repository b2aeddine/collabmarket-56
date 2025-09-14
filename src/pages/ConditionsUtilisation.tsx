
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, CreditCard, AlertCircle, CheckCircle, XCircle } from "lucide-react";

const ConditionsUtilisation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50 flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Conditions d'utilisation
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Conditions générales d'utilisation de la plateforme Collabmarket
            </p>
          </div>

          <div className="space-y-8">
            {/* Objet */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-primary" />
                  1. Objet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Les présentes conditions générales d'utilisation (dites « CGU ») ont pour objet l'encadrement juridique des modalités de mise à disposition du site et des services par Collabmarket et de définir les conditions d'accès et d'utilisation des services par « l'Utilisateur ».
                </p>
                <p className="text-gray-600">
                  Collabmarket est une plateforme de mise en relation entre influenceurs et commerçants pour la création de partenariats commerciaux.
                </p>
              </CardContent>
            </Card>

            {/* Définitions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-secondary" />
                  2. Définitions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">La Plateforme :</h4>
                  <p className="text-gray-600">désigne le site internet accessible à l'URL www.collabmarket.fr</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">L'Utilisateur :</h4>
                  <p className="text-gray-600">désigne toute personne qui utilise la Plateforme ou l'un des services proposés par la Plateforme</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">L'Influenceur :</h4>
                  <p className="text-gray-600">désigne un Utilisateur proposant ses services de promotion sur les réseaux sociaux</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Le Commerçant :</h4>
                  <p className="text-gray-600">désigne un Utilisateur recherchant des services de promotion pour ses produits ou services</p>
                </div>
              </CardContent>
            </Card>

            {/* Accès au service */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-accent" />
                  3. Accès au service
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Le service est accessible 7 jours sur 7, 24 heures sur 24. Il peut arriver que pour des raisons de maintenance le service soit interrompu. Dans ce cas, nous nous efforcerons de communiquer préalablement aux utilisateurs les dates et heures de l'intervention.
                </p>
                <p className="text-gray-600">
                  L'accès au service nécessite une inscription préalable. L'inscription est gratuite.
                </p>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Conditions d'inscription :</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Être âgé de 18 ans minimum</li>
                    <li>Fournir des informations exactes et à jour</li>
                    <li>Accepter les présentes conditions d'utilisation</li>
                    <li>Ne pas créer plusieurs comptes</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Services proposés */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800">
                  4. Services proposés
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Pour les Influenceurs :</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Création et gestion d'un profil professionnel</li>
                    <li>Publication d'offres de services</li>
                    <li>Réception et gestion des commandes</li>
                    <li>Système de paiement sécurisé</li>
                    <li>Outils de communication avec les commerçants</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Pour les Commerçants :</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Accès au catalogue d'influenceurs</li>
                    <li>Outils de recherche et filtrage</li>
                    <li>Système de commande de prestations</li>
                    <li>Suivi des campagnes</li>
                    <li>Système d'évaluation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Obligations des utilisateurs */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
                  5. Obligations des utilisateurs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Tous les utilisateurs s'engagent à :</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Respecter les lois et règlements en vigueur</li>
                    <li>Fournir des informations exactes et régulièrement mises à jour</li>
                    <li>Ne pas utiliser la plateforme à des fins illégales</li>
                    <li>Respecter les droits de propriété intellectuelle</li>
                    <li>Maintenir la confidentialité de leurs identifiants</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Les Influenceurs s'engagent en plus à :</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Délivrer les prestations commandées dans les délais convenus</li>
                    <li>Respecter les exigences légales en matière de publicité</li>
                    <li>Mentionner clairement le caractère promotionnel de leurs publications</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Paiements et commission */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                  6. Paiements et commission
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Collabmarket prélève une commission de 5% sur chaque transaction réalisée via la plateforme.
                </p>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Modalités de paiement :</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Le paiement s'effectue par carte bancaire ou virement</li>
                    <li>Le paiement est sécurisé par notre prestataire Stripe</li>
                    <li>Le versement à l'influenceur s'effectue après validation de la prestation</li>
                    <li>Les remboursements sont traités selon notre politique de remboursement</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Résiliation */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <XCircle className="w-5 h-5 mr-2 text-red-500" />
                  7. Résiliation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  L'utilisateur peut résilier son compte à tout moment en contactant le support client ou directement depuis son espace personnel.
                </p>
                <p className="text-gray-600">
                  Collabmarket se réserve le droit de suspendre ou résilier un compte en cas de non-respect des présentes conditions d'utilisation.
                </p>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Motifs de résiliation par Collabmarket :</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Non-respect des conditions d'utilisation</li>
                    <li>Activité frauduleuse ou illégale</li>
                    <li>Non-paiement des commissions dues</li>
                    <li>Comportement inapproprié envers d'autres utilisateurs</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Limitation de responsabilité */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800">
                  8. Limitation de responsabilité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Collabmarket agit en qualité d'intermédiaire technique entre les utilisateurs. Elle ne peut être tenue responsable des dommages directs ou indirects résultant de l'utilisation de la plateforme.
                </p>
                <p className="text-gray-600">
                  Les utilisateurs sont seuls responsables du contenu qu'ils publient et des prestations qu'ils réalisent ou commandent.
                </p>
              </CardContent>
            </Card>

            {/* Modification des CGU */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800">
                  9. Modification des conditions d'utilisation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Les présentes conditions d'utilisation peuvent être modifiées à tout moment. Les utilisateurs seront informés de toute modification par email et/ou par notification sur la plateforme. L'utilisation continue de la plateforme après modification vaut acceptation des nouvelles conditions.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Dernière mise à jour */}
          <div className="text-center mt-12 p-6 bg-white rounded-lg shadow-lg">
            <p className="text-sm text-gray-500">
              Dernière mise à jour : 7 janvier 2025
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ConditionsUtilisation;
