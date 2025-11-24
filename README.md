# Plateforme Influenceurs - Marketplace SaaS

## 📋 Description du Projet

Plateforme de mise en relation entre marques (merchants) et influenceurs pour des campagnes marketing sur les réseaux sociaux. Les marques peuvent découvrir des influenceurs, commander des prestations personnalisées et suivre leurs campagnes. Les influenceurs peuvent gérer leurs offres, réseaux sociaux, et revenus.

## ✨ Fonctionnalités Principales

### Pour les Marques (Merchants)
- 🔍 Catalogue d'influenceurs avec filtres avancés
- 📦 Commande de prestations personnalisées
- 💬 Messagerie intégrée
- 📊 Tableau de bord avec statistiques
- ⭐ Système de favoris et d'avis
- 💳 Paiements sécurisés via Stripe

### Pour les Influenceurs
- 🎨 Profil public personnalisable
- 📱 Gestion des réseaux sociaux (Instagram, TikTok, YouTube, X, Snapchat, Facebook, LinkedIn)
- 💼 Création et gestion d'offres de prestations
- 📸 Portfolio de réalisations
- 💰 Gestion des revenus et retraits via Stripe Connect
- 📈 Statistiques de performance

### Pour les Administrateurs
- 🛡️ Gestion des contestations
- ✅ Validation des influenceurs
- 💸 Gestion des retraits
- 📧 Gestion des messages de contact

## 🛠️ Technologies Utilisées

### Frontend
- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Composants UI réutilisables
- **Framer Motion** - Animations fluides
- **React Router** - Navigation
- **TanStack Query** - Gestion des requêtes

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Row Level Security (RLS)
  - Edge Functions (Deno)
  - Storage pour avatars et portfolio

### Paiements
- **Stripe** - Paiements et transferts
  - Stripe Connect - Paiements aux influenceurs
  - Stripe Identity - Vérification d'identité

## 📊 Structure de la Base de Données

### Tables Principales

#### `profiles`
Profils utilisateurs (merchants, influenceurs, admins)
- Informations personnelles
- Statuts de vérification
- Configuration Stripe Connect

#### `offers`
Offres de prestations créées par les influenceurs
- Prix, description, délai de livraison
- Plateforme concernée

#### `orders`
Commandes entre merchants et influenceurs
- Statuts multiples (pending, payment_authorized, en_cours, delivered, terminée, etc.)
- Gestion des paiements via Stripe
- Système de contestation

#### `social_links`
Réseaux sociaux des influenceurs
- Plateforme, username, followers
- Taux d'engagement

#### `reviews`
Avis des merchants sur les influenceurs

#### `influencer_revenues`
Revenus des influenceurs
- Montant net après commission (10%)
- Statut (available, withdrawn)

#### `withdrawal_requests`
Demandes de retrait des influenceurs

#### `contestations`
Contestations sur les commandes

## 🚀 Installation et Lancement

### Prérequis
- Node.js 18+ et npm
- Compte Supabase
- Compte Stripe (pour les paiements)

### Installation

```bash
# 1. Cloner le repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

### Configuration Supabase

Le projet est déjà connecté à Supabase. Les clés publiques sont dans:
- `src/integrations/supabase/client.ts`

Les Edge Functions sont dans:
- `supabase/functions/`

### Variables d'Environnement

Les secrets sont gérés via Supabase Secrets (pas de fichier .env):
- `STRIPE_SECRET_KEY` - Clé secrète Stripe
- `STRIPE_WEBHOOK_SECRET` - Secret webhook Stripe
- `SUPABASE_URL` - URL du projet Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Clé service role

## 📁 Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── admin/          # Composants admin
│   ├── catalog/        # Composants du catalogue
│   ├── common/         # Composants communs (skeletons, loaders)
│   ├── forms/          # Composants de formulaire
│   ├── merchant/       # Composants merchant
│   ├── order/          # Composants de commande
│   ├── profile/        # Composants de profil
│   ├── ui/             # shadcn/ui components
│   └── ...             # Modales, cartes, etc.
├── hooks/              # Custom React hooks
├── integrations/       # Configuration Supabase
├── pages/              # Pages principales
├── types/              # Types TypeScript
├── utils/              # Fonctions utilitaires
└── main.tsx            # Point d'entrée

supabase/
├── functions/          # Edge Functions
│   ├── create-payment-with-connect/
│   ├── stripe-webhook/
│   ├── check-stripe-account-status/
│   └── ...
└── migrations/         # Migrations SQL
```

## 🔐 Sécurité

- ✅ Row Level Security (RLS) activée sur toutes les tables
- ✅ Validation côté client (Zod) et serveur
- ✅ Gestion des erreurs centralisée
- ✅ Pas de clés API privées dans le code
- ✅ Authentification via Supabase Auth
- ✅ Stripe Connect pour les paiements sécurisés

## 🧪 Tests

```bash
# Lancer les tests
npm test

# Tests avec coverage
npm run test:coverage
```

## 📦 Déploiement

### Via Lovable (Recommandé)
1. Aller sur [Lovable](https://lovable.dev/projects/9d0d6c25-90ae-4d8c-ae3e-efa82e588394)
2. Cliquer sur Share → Publish

### Déploiement Manuel
```bash
npm run build
# Les fichiers de production seront dans /dist
```

## 🌐 Domaine Personnalisé

Pour connecter un domaine:
1. Aller dans Project > Settings > Domains
2. Cliquer sur "Connect Domain"
3. Suivre les instructions

[Documentation](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## 🤝 Contribution

Ce projet utilise:
- ESLint pour le linting avec règles de sécurité
- TypeScript strict mode activé
- Prettier pour le formatage
- Console.log automatiquement supprimés en production

## 📚 Documentation

Tous les rapports d'audit et analyses techniques sont disponibles dans le dossier [`docs/audits/`](./docs/audits/):
- Audits de sécurité
- Audits de synchronisation
- Diagnostics Stripe
- Optimisations de performance
- Analyses techniques

## 📄 License

Tous droits réservés.

## 📞 Support

Pour toute question, contactez l'équipe de développement via le formulaire de contact de la plateforme.
