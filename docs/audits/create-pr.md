# Instructions pour créer la Pull Request

## Option 1 : Via l'interface GitHub (Recommandé)

1. Allez sur : https://github.com/b2aeddine/collabmarket-56/compare/main...fix/supabase-frontend-audit
2. Cliquez sur "Create pull request"
3. Remplissez les informations suivantes :

**Titre :**
```
fix: Security audit and performance improvements
```

**Description :**
```markdown
## 🔍 Audit de sécurité et corrections

Cette PR contient les corrections issues d'un audit complet de sécurité et de performance du projet.

### ✅ Corrections appliquées

#### Sécurité
- ✅ Remplacement des clés Supabase hardcodées par variables d'environnement
- ✅ Amélioration des politiques RLS (Row Level Security)
- ✅ Ajout de validation Zod dans les Edge Functions critiques
- ✅ CORS configurable via variable d'environnement

#### Performance
- ✅ Ajout de 12 index SQL pour optimiser les requêtes
- ✅ Remplacement de `select('*')` par sélections explicites
- ✅ Logger de production (pas de console.log en prod)

#### Corrections de bugs
- ✅ Suppression des Footer dupliqués sur les pages

### 📊 Statistiques
- **9 commits** avec corrections atomiques
- **1 migration SQL** avec index et améliorations RLS
- **4 Edge Functions** optimisées
- **7 pages** corrigées (Footer dupliqués)

### 📝 Fichiers modifiés
- `src/integrations/supabase/client.ts` - Variables d'environnement
- `src/lib/utils.ts` - Logger utilitaire
- `supabase/migrations/20250120000000_fix_security_and_performance.sql` - Migration SQL
- `supabase/functions/_shared/cors.ts` - Utilitaire CORS
- `supabase/functions/_shared/validation.ts` - Validation Zod
- 4 Edge Functions optimisées
- 7 pages corrigées

### 🚀 Déploiement
1. Créer `.env.local` avec `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
2. Appliquer la migration SQL : `supabase db push`
3. Configurer `ALLOWED_ORIGINS` dans les variables d'environnement Supabase

### 📖 Documentation
Voir `RAPPORT_AUDIT_SECURITE_2025.md` pour les détails complets.
```

## Option 2 : Via curl (si vous avez un token GitHub)

```bash
curl -X POST https://api.github.com/repos/b2aeddine/collabmarket-56/pulls \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -d '{
    "title": "fix: Security audit and performance improvements",
    "head": "fix/supabase-frontend-audit",
    "base": "main",
    "body": "## 🔍 Audit de sécurité et corrections\n\nCette PR contient les corrections issues d'\''un audit complet de sécurité et de performance du projet.\n\n### ✅ Corrections appliquées\n\n- ✅ Remplacement des clés Supabase hardcodées\n- ✅ Amélioration des politiques RLS\n- ✅ Ajout de validation Zod\n- ✅ Optimisation des requêtes SQL\n- ✅ Suppression des Footer dupliqués\n\nVoir RAPPORT_AUDIT_SECURITE_2025.md pour les détails."
  }'
```

