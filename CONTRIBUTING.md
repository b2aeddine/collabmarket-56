# Guide de Contribution

Merci de votre intérêt pour contribuer à CollabMarket ! 🎉

## Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Standards de Code](#standards-de-code)
- [Processus de Pull Request](#processus-de-pull-request)
- [Structure du Projet](#structure-du-projet)
- [Tests](#tests)
- [Sécurité](#sécurité)

## Code de Conduite

En participant à ce projet, vous vous engagez à respecter notre code de conduite. Soyez respectueux et constructif dans vos interactions.

## Comment Contribuer

### Signaler un Bug

1. Vérifiez que le bug n'a pas déjà été signalé dans les [Issues](https://github.com/collabmarket/collabmarket/issues)
2. Créez une nouvelle issue en utilisant le template "Bug Report"
3. Incluez :
   - Description claire du problème
   - Étapes pour reproduire
   - Comportement attendu vs actuel
   - Screenshots si applicable
   - Environnement (OS, navigateur, version)

### Proposer une Fonctionnalité

1. Vérifiez que la fonctionnalité n'est pas déjà demandée
2. Créez une issue avec le template "Feature Request"
3. Expliquez le cas d'usage et la valeur ajoutée
4. Attendez les retours avant de commencer le développement

### Corriger un Bug ou Implémenter une Fonctionnalité

1. Fork le repository
2. Créez une branche : `git checkout -b fix/bug-description` ou `feat/feature-name`
3. Faites vos modifications
4. Testez localement
5. Committez : `git commit -m "fix: description"`
6. Push : `git push origin fix/bug-description`
7. Ouvrez une Pull Request

## Standards de Code

### Style de Code

Nous utilisons ESLint et Prettier. Votre code doit passer les vérifications :

```bash
npm run lint
npm run lint:fix  # Pour corriger automatiquement
```

### Conventions de Nommage

```typescript
// ✅ BON
const userName = "John";
const getUserProfile = () => {};
interface UserProfile {}
type UserId = string;

// ❌ MAUVAIS
const username = "John";
const get_user_profile = () => {};
interface userProfile {}
```

### Conventions de Commit

Nous utilisons [Conventional Commits](https://www.conventionalcommits.org/) :

```
feat: Ajout de la fonctionnalité X
fix: Correction du bug Y
docs: Mise à jour de la documentation
style: Formatage du code
refactor: Refactoring de Z
test: Ajout de tests pour W
chore: Mise à jour des dépendances
```

### TypeScript

- Utilisez TypeScript pour tous les nouveaux fichiers
- Évitez `any`, préférez `unknown` si nécessaire
- Définissez des types/interfaces clairs

```typescript
// ✅ BON
interface User {
  id: string;
  email: string;
  role: 'influenceur' | 'commercant';
}

const getUser = (id: string): Promise<User> => {
  // ...
}

// ❌ MAUVAIS
const getUser = (id: any): any => {
  // ...
}
```

## Processus de Pull Request

### Avant de Soumettre

- [ ] Le code compile sans erreur
- [ ] Tous les tests passent : `npm test`
- [ ] Le linter passe : `npm run lint`
- [ ] Les tests de sécurité passent : `npm run security:check`
- [ ] La documentation est mise à jour si nécessaire
- [ ] Les commits suivent les conventions

### Template de PR

```markdown
## Description
Brève description des changements

## Type de Changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Comment Tester
Étapes pour tester les changements

## Checklist
- [ ] Tests ajoutés/mis à jour
- [ ] Documentation mise à jour
- [ ] Pas de régression
- [ ] Code review effectué
```

### Processus de Review

1. Au moins 1 approbation requise
2. Tous les checks CI doivent passer
3. Pas de conflits avec `main`
4. Code review constructif et respectueux

## Structure du Projet

```
collabmarket/
├── .github/              # GitHub Actions, templates
│   └── workflows/        # CI/CD pipelines
├── public/               # Assets statiques
├── scripts/              # Scripts utilitaires
│   ├── check-secrets.js  # Scan de sécurité
│   └── remove-console-logs.js
├── src/
│   ├── components/       # Composants React
│   │   ├── admin/        # Composants admin
│   │   ├── common/       # Composants réutilisables
│   │   ├── forms/        # Composants de formulaires
│   │   └── ui/           # shadcn-ui components
│   ├── hooks/            # Custom React hooks
│   │   └── __tests__/    # Tests des hooks
│   ├── integrations/     # Intégrations externes
│   │   └── supabase/     # Client Supabase
│   ├── pages/            # Pages de l'application
│   ├── types/            # Types TypeScript
│   ├── utils/            # Fonctions utilitaires
│   │   └── __tests__/    # Tests des utils
│   └── main.tsx          # Point d'entrée
├── supabase/
│   ├── functions/        # Edge Functions
│   └── migrations/       # Migrations SQL
├── analysis.md           # Analyse technique
├── SECURITY.md           # Politique de sécurité
├── CONTRIBUTING.md       # Ce fichier
└── README.md             # Documentation principale
```

## Tests

### Écrire des Tests

Tous les nouveaux composants et fonctions doivent avoir des tests :

```typescript
// src/utils/__tests__/myFunction.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from '../myFunction';

describe('myFunction', () => {
  it('should return expected value', () => {
    expect(myFunction('input')).toBe('expected');
  });

  it('should handle edge cases', () => {
    expect(myFunction('')).toBe('');
    expect(myFunction(null)).toBe(null);
  });
});
```

### Lancer les Tests

```bash
# Tous les tests
npm test

# Tests avec couverture
npm run test:coverage

# Mode watch
npm test -- --watch

# UI interactive
npm run test:ui
```

### Couverture de Tests

Objectif : **60% minimum**

Priorité aux :
- Fonctions critiques de sécurité
- Logique métier complexe
- Hooks personnalisés
- Utilitaires de validation

## Sécurité

### Checklist Sécurité

Avant de soumettre du code :

- [ ] Pas de secrets hardcodés
- [ ] Utilisation de variables d'environnement
- [ ] Validation de toutes les entrées utilisateur
- [ ] Pas de console.log avec données sensibles
- [ ] Gestion appropriée des erreurs
- [ ] Vérifications d'autorisation
- [ ] Tests de sécurité inclus

### Validation des Entrées

```typescript
import { z } from 'zod';

// ✅ BON
const emailSchema = z.string().email();
const validatedEmail = emailSchema.parse(userInput);

// ❌ MAUVAIS
const email = req.body.email; // Pas de validation
```

### Gestion des Secrets

```typescript
// ✅ BON
const apiKey = import.meta.env.VITE_API_KEY;

// ❌ MAUVAIS
const apiKey = "sk_live_1234567890";
```

### Signalement de Vulnérabilités

Voir [SECURITY.md](SECURITY.md) pour les instructions.

## Développement Local

### Prérequis

- Node.js 18+
- npm ou yarn
- Git

### Installation

```bash
# Cloner le repository
git clone https://github.com/collabmarket/collabmarket.git
cd collabmarket

# Installer les dépendances
npm install

# Copier .env.example vers .env
cp .env.example .env

# Configurer les variables d'environnement
# Éditer .env avec vos valeurs

# Démarrer le serveur de développement
npm run dev
```

### Docker (Optionnel)

```bash
# Développement
docker-compose up dev

# Production
docker-compose up prod
```

## Ressources

- [Documentation React](https://react.dev/)
- [Documentation TypeScript](https://www.typescriptlang.org/)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Vite](https://vitejs.dev/)
- [shadcn-ui](https://ui.shadcn.com/)

## Questions ?

- Ouvrez une issue avec le tag "question"
- Contactez l'équipe : dev@collabmarket.com

## Licence

En contribuant, vous acceptez que vos contributions soient sous la même licence que le projet.

---

Merci de contribuer à CollabMarket ! 🚀

