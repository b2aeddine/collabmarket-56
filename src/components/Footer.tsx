
import { Link } from "react-router-dom";
import { Building2, Home, HelpCircle, Users, Mail, FileText, Shield, Eye } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* À propos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-primary" />
              À propos
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Collabmarket est la plateforme qui connecte influenceurs et commerçants pour des partenariats authentiques et rentables. Créez des collaborations qui cartonnent !
            </p>
          </div>

          {/* Liens utiles */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Liens utiles</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-300 hover:text-primary transition-colors duration-200 flex items-center text-sm"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Accueil
                </Link>
              </li>
              <li>
                <Link 
                  to="/how-it-works" 
                  className="text-gray-300 hover:text-primary transition-colors duration-200 flex items-center text-sm"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Comment ça marche ?
                </Link>
              </li>
              <li>
                <Link 
                  to="/influencer-catalog" 
                  className="text-gray-300 hover:text-primary transition-colors duration-200 flex items-center text-sm"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Catalogue
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-300 hover:text-primary transition-colors duration-200 flex items-center text-sm"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  to="/faq" 
                  className="text-gray-300 hover:text-primary transition-colors duration-200 flex items-center text-sm"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Légal</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/mentions-legales" 
                  className="text-gray-300 hover:text-primary transition-colors duration-200 flex items-center text-sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link 
                  to="/conditions-utilisation" 
                  className="text-gray-300 hover:text-primary transition-colors duration-200 flex items-center text-sm"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link 
                  to="/politique-confidentialite" 
                  className="text-gray-300 hover:text-primary transition-colors duration-200 flex items-center text-sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Logo et CTA */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Collabmarket
              </h2>
            </Link>
            <p className="text-gray-300 text-sm">
              Rejoignez notre communauté dès aujourd'hui
            </p>
            <div className="flex flex-col space-y-2">
              <Link
                to="/signup?role=influencer"
                className="text-primary hover:text-primary/80 transition-colors text-sm font-medium"
              >
                Devenir influenceur →
              </Link>
              <Link
                to="/signup?role=merchant"
                className="text-secondary hover:text-secondary/80 transition-colors text-sm font-medium"
              >
                Devenir commerçant →
              </Link>
            </div>
          </div>
        </div>

        {/* Ligne de séparation */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Collabmarket. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
