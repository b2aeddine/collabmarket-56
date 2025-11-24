import { HomeIcon, Building2, Users, MessageSquare, ShoppingCart, Euro, Settings, Star } from "lucide-react";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import InfluencerDashboard from "./pages/InfluencerDashboard";
import MerchantDashboard from "./pages/MerchantDashboard";
import InfluencerCatalog from "./pages/InfluencerCatalog";
import InfluencerProfile from "./pages/InfluencerProfile";
import PublicInfluencerProfile from "./pages/PublicInfluencerProfile";
import MessagesPage from "./pages/MessagesPage";
import MessagesInbox from "./pages/MessagesInbox";
import OrderPage from "./pages/OrderPage";
import OrdersManagement from "./pages/OrdersManagement";
import RevenueManagement from "./pages/RevenueManagement";
import NotFound from "./pages/NotFound";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import HowItWorks from "./pages/HowItWorks";
import MentionsLegales from "./pages/MentionsLegales";
import PolitiqueConfidentialite from "./pages/PolitiqueConfidentialite";
import ConditionsUtilisation from "./pages/ConditionsUtilisation";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import AdminDisputes from "./pages/AdminDisputes";
import AdminDashboard from "./pages/AdminDashboard";
import OnboardingRefresh from "./pages/OnboardingRefresh";

import ProtectedRoute from "./components/ProtectedRoute";

export const navItems = [
  {
    title: "Accueil",
    to: "/",
    page: <Index />,
  },
  {
    title: "Comment ça marche",
    to: "/how-it-works",
    page: <HowItWorks />,
  },
  {
    title: "Catalogue",
    to: "/catalog",
    page: <InfluencerCatalog />,
  },
  {
    title: "Profil Influenceur",
    to: "/influencer/:id",
    page: <InfluencerProfile />,
  },
  {
    title: "Profil Public",
    to: "/p/:username",
    page: <PublicInfluencerProfile />,
  },
  {
    title: "Connexion",
    to: "/login",
    page: <Login />,
  },
  {
    title: "Inscription",
    to: "/signup",
    page: <SignUp />,
  },
  {
    title: "Dashboard Influenceur",
    to: "/influencer-dashboard",
    page: (
      <ProtectedRoute requireRole="influenceur">
        <InfluencerDashboard />
      </ProtectedRoute>
    ),
  },
  {
    title: "Dashboard Marchand",
    to: "/merchant-dashboard",
    page: (
      <ProtectedRoute requireRole="commercant">
        <MerchantDashboard />
      </ProtectedRoute>
    ),
  },
  {
    title: "Messages",
    to: "/messages",
    page: (
      <ProtectedRoute>
        <MessagesPage />
      </ProtectedRoute>
    ),
  },
  {
    title: "Boîte de réception",
    to: "/messages/:conversationId",
    page: (
      <ProtectedRoute>
        <MessagesInbox />
      </ProtectedRoute>
    ),
  },
  {
    title: "Gestion des commandes",
    to: "/orders",
    page: (
      <ProtectedRoute>
        <OrdersManagement />
      </ProtectedRoute>
    ),
  },
  {
    title: "Page de commande",
    to: "/order/:serviceId",
    page: (
      <ProtectedRoute requireRole="commercant">
        <OrderPage />
      </ProtectedRoute>
    ),
  },
  {
    title: "Gestion des revenus",
    to: "/revenue-management",
    page: (
      <ProtectedRoute requireRole="influenceur">
        <RevenueManagement />
      </ProtectedRoute>
    ),
  },
  {
    title: "Gestion des litiges",
    to: "/admin/disputes",
    page: (
      <ProtectedRoute>
        <AdminDisputes />
      </ProtectedRoute>
    ),
  },
  {
    title: "Dashboard Admin",
    to: "/admin/dashboard",
    page: (
      <ProtectedRoute requireRole="admin">
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    title: "Paiement réussi",
    to: "/payment/success",
    page: <PaymentSuccess />,
  },
  {
    title: "Paiement annulé",
    to: "/payment/cancel",
    page: <PaymentCancel />,
  },
  {
    title: "Contact",
    to: "/contact", 
    page: <Contact />,
  },
  {
    title: "FAQ",
    to: "/faq",
    page: <FAQ />,
  },
  {
    title: "Conditions d'utilisation",
    to: "/conditions-utilisation",
    page: <ConditionsUtilisation />,
  },
  {
    title: "Politique de confidentialité",
    to: "/politique-confidentialite",
    page: <PolitiqueConfidentialite />,
  },
  {
    title: "Mentions légales",
    to: "/mentions-legales",
    page: <MentionsLegales />,
  },
  {
    title: "Onboarding Refresh",
    to: "/onboarding/refresh",
    page: (
      <ProtectedRoute requireRole="influenceur">
        <OnboardingRefresh />
      </ProtectedRoute>
    ),
  },
  {
    title: "Page introuvable",
    to: "*",
    page: <NotFound />,
  },
];
