
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Database, Shield, Cookie, Users, Lock } from "lucide-react";

const PolitiqueConfidentialite = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50 flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Politique de confidentialité
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Comment nous collectons, utilisons et protégeons vos données personnelles
            </p>
          </div>

          <div className="space-y-8">
            {/* Introduction */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-primary" />
                  Introduction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Chez Collabmarket, nous accordons une grande importance à la protection de vos données personnelles. Cette politique de confidentialité vous informe sur la manière dont nous collectons, utilisons, stockons et protégeons vos informations personnelles.
                </p>
                <p className="text-gray-600">
                  Cette politique s'applique à tous les utilisateurs de notre plateforme, qu'ils soient influenceurs ou commerçants.
                </p>
              </CardContent>
            </Card>

            {/* Données collectées */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <Database className="w-5 h-5 mr-2 text-secondary" />
                  Données que nous collectons
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Données d'identification :</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Nom et prénom</li>
                    <li>Adresse email</li>
                    <li>Numéro de téléphone</li>
                    <li>Adresse postale</li>
                    <li>Photo de profil</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Données professionnelles :</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Informations sur vos réseaux sociaux</li>
                    <li>Statistiques d'audience</li>
                    <li>Tarifs et services proposés</li>
                    <li>Historique des collaborations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Données de navigation :</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Adresse IP</li>
                    <li>Type de navigateur</li>
                    <li>Pages visitées</li>
                    <li>Durée de visite</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Données de paiement :</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Informations bancaires (traitées par Stripe)</li>
                    <li>Historique des transactions</li>
                    <li>Factures et reçus</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Utilisation des données */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-accent" />
                  Comment nous utilisons vos données
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Fourniture du service :</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Création et gestion de votre compte</li>
                    <li>Mise en relation entre influenceurs et commerçants</li>
                    <li>Traitement des commandes et paiements</li>
                    <li>Support client</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Amélioration du service :</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Analyse des performances de la plateforme</li>
                    <li>Développement de nouvelles fonctionnalités</li>
                    <li>Personnalisation de l'expérience utilisateur</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Communication :</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Envoi de notifications importantes</li>
                    <li>Newsletter (avec votre consentement)</li>
                    <li>Communication sur nos nouveaux services</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Base légale */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  Base légale du traitement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Exécution d'un contrat :</h4>
                  <p className="text-gray-600">
                    Le traitement de vos données est nécessaire pour l'exécution du contrat de service entre vous et Collabmarket.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Intérêt légitime :</h4>
                  <p className="text-gray-600">
                    L'amélioration de nos services et la sécurité de la plateforme constituent nos intérêts légitimes.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Consentement :</h4>
                  <p className="text-gray-600">
                    Certains traitements, comme l'envoi de newsletters, nécessitent votre consentement explicite.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Partage des données */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800">
                  Partage de vos données
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Nous ne vendons, ne louons ni ne partageons vos données personnelles avec des tiers, sauf dans les cas suivants :
                </p>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Prestataires de services :</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Stripe pour le traitement des paiements</li>
                    <li>Supabase pour l'hébergement des données</li>
                    <li>Services d'envoi d'emails</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Obligations légales :</h4>
                  <p className="text-gray-600">
                    Nous pouvons être amenés à divulguer vos données si la loi l'exige ou en réponse à une demande judiciaire.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sécurité */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-red-500" />
                  Sécurité de vos données
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles :
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Chiffrement des données sensibles</li>
                  <li>Accès sécurisé par authentification</li>
                  <li>Sauvegarde régulière des données</li>
                  <li>Formation du personnel à la sécurité</li>
                  <li>Audits de sécurité réguliers</li>
                </ul>
              </CardContent>
            </Card>

            {/* Durée de conservation */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800">
                  Durée de conservation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Compte actif :</h4>
                  <p className="text-gray-600">
                    Vos données sont conservées tant que votre compte est actif.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Après suppression du compte :</h4>
                  <p className="text-gray-600">
                    Les données sont supprimées dans un délai de 30 jours, sauf obligation légale de conservation plus longue.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Données comptables :</h4>
                  <p className="text-gray-600">
                    Les données liées aux transactions sont conservées 10 ans conformément aux obligations comptables.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Vos droits */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800">
                  Vos droits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Conformément au RGPD, vous disposez des droits suivants :
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Droit d'accès :</h4>
                    <p className="text-gray-600 text-sm">Obtenir une copie de vos données personnelles</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Droit de rectification :</h4>
                    <p className="text-gray-600 text-sm">Corriger vos données inexactes</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Droit d'effacement :</h4>
                    <p className="text-gray-600 text-sm">Demander la suppression de vos données</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Droit de portabilité :</h4>
                    <p className="text-gray-600 text-sm">Récupérer vos données dans un format structuré</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Droit d'opposition :</h4>
                    <p className="text-gray-600 text-sm">S'opposer au traitement de vos données</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Droit de limitation :</h4>
                    <p className="text-gray-600 text-sm">Limiter le traitement de vos données</p>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-600">
                    <strong>Pour exercer vos droits :</strong><br />
                    Contactez-nous à l'adresse : privacy@collabmarket.fr<br />
                    Nous nous engageons à vous répondre dans un délai de 30 jours.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <Cookie className="w-5 h-5 mr-2 text-yellow-600" />
                  Cookies et technologies similaires
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Nous utilisons des cookies pour améliorer votre expérience utilisateur :
                </p>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Cookies essentiels :</h4>
                  <p className="text-gray-600">Nécessaires au fonctionnement de la plateforme</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Cookies analytiques :</h4>
                  <p className="text-gray-600">Nous aident à comprendre comment vous utilisez notre site</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Gestion des cookies :</h4>
                  <p className="text-gray-600">Vous pouvez configurer vos préférences cookies dans les paramètres de votre navigateur.</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800">
                  Contact et réclamations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Délégué à la Protection des Données :</h4>
                  <p className="text-gray-600">
                    Email : dpo@collabmarket.fr<br />
                    Adresse : DPO Collabmarket, 123 Avenue des Collaborations, 75001 Paris
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Réclamation auprès de la CNIL :</h4>
                  <p className="text-gray-600">
                    Si vous estimez que vos droits ne sont pas respectés, vous pouvez déposer une réclamation auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL).
                  </p>
                </div>
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

export default PolitiqueConfidentialite;
