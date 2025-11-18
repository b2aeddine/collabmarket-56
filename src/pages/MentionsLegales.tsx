
import React from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, FileText, Shield } from "lucide-react";

const MentionsLegales = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50 flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Mentions légales
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Informations légales et réglementaires concernant la plateforme Collabmarket
            </p>
          </div>

          <div className="space-y-8">
            {/* Éditeur du site */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-primary" />
                  Éditeur du site
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Collabmarket SAS</h3>
                  <p className="text-gray-600">
                    Société par Actions Simplifiée au capital de 100 000 €<br />
                    RCS Paris : 123 456 789<br />
                    SIRET : 123 456 789 00012<br />
                    TVA intracommunautaire : FR12 123456789
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Siège social :</h4>
                  <p className="text-gray-600">
                    123 Avenue des Collaborations<br />
                    75001 Paris, France
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Contact :</h4>
                  <p className="text-gray-600">
                    Email : contact@collabmarket.fr<br />
                    Téléphone : +33 1 23 45 67 89
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Directeur de la publication :</h4>
                  <p className="text-gray-600">Jean Dupont, Président</p>
                </div>
              </CardContent>
            </Card>

            {/* Hébergement */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-secondary" />
                  Hébergement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Le site web est hébergé par :<br />
                  <strong>Vercel Inc.</strong><br />
                  340 S Lemon Ave #4133<br />
                  Walnut, CA 91789, États-Unis<br />
                  <a href="https://vercel.com" className="text-primary hover:underline">vercel.com</a>
                </p>
              </CardContent>
            </Card>

            {/* Propriété intellectuelle */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-accent" />
                  Propriété intellectuelle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés.
                </p>
                <p className="text-gray-600">
                  Les marques, logos, signes ainsi que tous les contenus du site (textes, images, son...) font l'objet d'une protection par le Code de la propriété intellectuelle et plus particulièrement par le droit d'auteur.
                </p>
                <p className="text-gray-600">
                  La marque "Collabmarket" est une marque déposée. Toute représentation et/ou reproduction et/ou exploitation partielle ou totale de cette marque, de quelque nature que ce soit, est totalement prohibée.
                </p>
              </CardContent>
            </Card>

            {/* Responsabilité */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800">
                  Limitation de responsabilité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Les informations contenues sur ce site sont aussi précises que possible et le site remis à jour à différentes périodes de l'année, mais peut toutefois contenir des inexactitudes ou des omissions.
                </p>
                <p className="text-gray-600">
                  Si vous constatez une lacune, erreur ou ce qui parait être un dysfonctionnement, merci de bien vouloir le signaler par email à l'adresse contact@collabmarket.fr en décrivant le problème de la manière la plus précise possible.
                </p>
                <p className="text-gray-600">
                  Collabmarket ne pourra être tenue responsable des dommages directs et indirects causés au matériel de l'utilisateur, lors de l'accès au site, et résultant soit de l'utilisation d'un matériel ne répondant pas aux spécifications indiquées, soit de l'apparition d'un bug ou d'une incompatibilité.
                </p>
              </CardContent>
            </Card>

            {/* Données personnelles */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800">
                  Protection des données personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi "Informatique et Libertés", vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données personnelles.
                </p>
                <p className="text-gray-600">
                  Pour exercer ces droits ou pour toute question sur le traitement de vos données dans ce dispositif, vous pouvez contacter notre délégué à la protection des données (DPO) :
                </p>
                <p className="text-gray-600">
                  Email : dpo@collabmarket.fr<br />
                  Adresse postale : DPO Collabmarket, 123 Avenue des Collaborations, 75001 Paris
                </p>
                <p className="text-gray-600">
                  Si vous estimez, après nous avoir contactés, que vos droits "Informatique et Libertés" ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL.
                </p>
              </CardContent>
            </Card>

            {/* Droit applicable */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800">
                  Droit applicable et juridiction compétente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Tout litige en relation avec l'utilisation du site www.collabmarket.fr est soumis au droit français. Il est fait attribution exclusive de juridiction aux tribunaux compétents de Paris.
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
    </div>
  );
};

export default MentionsLegales;
