# 🚀 Commandes Exactes pour Reproduire l'Audit

Ce document contient toutes les commandes pour reproduire l'audit technique et appliquer les correctifs.

## 📋 Table des Matières

1. [Setup Initial](#setup-initial)
2. [Build et Tests](#build-et-tests)
3. [Scans de Sécurité](#scans-de-sécurité)
4. [Docker](#docker)
5. [CI/CD](#cicd)
6. [Maintenance](#maintenance)

---

## 🔧 Setup Initial

### 1. Cloner le Repository

```bash
# Si pas déjà fait
git clone https://github.com/votre-org/collabmarket.git
cd collabmarket
```

### 2. Installer les Dépendances

```bash
# Installer toutes les dépendances
npm install

# Ou avec yarn
yarn install

# Ou avec pnpm
pnpm install
```

### 3. Configurer les Variables d'Environnement

```bash
# Copier le fichier exemple (si non bloqué par gitignore)
# Sinon, créer manuellement .env avec le contenu suivant:

cat > .env << 'EOF'
# SUPABASE
VITE_SUPABASE_URL=https://vklayzyhocjpicnblwfx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrbGF5enlob2NqcGljbmJsd2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3ODA4MDMsImV4cCI6MjA2NzM1NjgwM30.pUSBHigrCNULCQAPdYCKixt7OYNICKHCgbBaelFqJE8

# STRIPE (remplacer par vos vraies clés)
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key_here

# APP CONFIG
VITE_APP_ENV=development
VITE_APP_URL=http://localhost:8080
VITE_DEBUG_LOGS=true
EOF

# Vérifier que .env est dans .gitignore
grep -q "^\.env$" .gitignore || echo ".env" >> .gitignore
```

---

## 🏗️ Build et Tests

### Démarrer le Serveur de Développement

```bash
# Démarrer Vite dev server
npm run dev

# L'application sera accessible sur http://localhost:8080
```

### Lancer les Tests

```bash
# Tous les tests (une fois)
npm test -- --run

# Tests en mode watch
npm test

# Tests avec couverture
npm run test:coverage

# Tests avec UI interactive
npm run test:ui
```

### Build de Production

```bash
# Build optimisé
npm run build

# Prévisualiser le build
npm run preview

# Build de développement (avec source maps)
npm run build:dev
```

### Vérifier la Sortie du Build

```bash
# Taille du bundle
du -sh dist/

# Détails des fichiers JS
find dist/assets -name "*.js" -exec ls -lh {} \; | awk '{print $5, $9}'

# Détails des fichiers CSS
find dist/assets -name "*.css" -exec ls -lh {} \; | awk '{print $5, $9}'
```

---

## 🔒 Scans de Sécurité

### ESLint (Standard)

```bash
# Linter standard
npm run lint

# Linter avec règles de sécurité
npm run lint:security

# Auto-fix des problèmes
npm run lint:fix
```

### Audit des Dépendances

```bash
# Audit standard
npm audit

# Audit avec niveau de sévérité
npm audit --audit-level=moderate

# Fix automatique des vulnérabilités
npm audit fix

# Fix avec force (attention: peut casser des choses)
npm audit fix --force

# Voir les détails
npm audit --json > audit-report.json
```

### Scan de Secrets Hardcodés

```bash
# Vérifier les secrets (nécessite node et les dépendances)
npm run security:check

# Ou directement
node scripts/check-secrets.js

# Sortie attendue:
# ✅ No hardcoded secrets found!
# ou
# ⚠️ Found X potential secret(s) in Y file(s)
```

### Nettoyage des console.log

```bash
# Mode dry-run (simulation)
npm run clean:logs:dry

# Vraie suppression (crée des backups automatiques)
npm run clean:logs

# Ou directement
node scripts/remove-console-logs.js --dry-run
node scripts/remove-console-logs.js

# Les backups sont créés dans .backups/YYYY-MM-DDTHH-MM-SS/
```

### Scan Complet

```bash
# Tout en une commande
npm run lint:security && \
npm run test:coverage && \
npm run security:check && \
npm audit --audit-level=moderate

# Si tout passe, sortie: exit code 0
# Si problèmes, sortie: exit code 1
```

---

## 🐳 Docker

### Build l'Image Docker

```bash
# Build production
docker build -t collabmarket:latest .

# Build avec arguments
docker build \
  --build-arg VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
  --build-arg VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
  -t collabmarket:latest .

# Build dev
docker build -f Dockerfile.dev -t collabmarket:dev .
```

### Lancer avec Docker Compose

```bash
# Développement
docker-compose up dev

# Production
docker-compose up prod

# En arrière-plan (detached)
docker-compose up -d prod

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v
```

### Tester le Container

```bash
# Vérifier que le container tourne
docker ps

# Accéder à l'app
curl http://localhost:80

# Healthcheck
curl http://localhost:80/health

# Voir les logs
docker logs collabmarket-prod

# Accéder au shell du container
docker exec -it collabmarket-prod sh
```

---

## 🔄 CI/CD

### GitHub Actions (Automatique)

Le workflow `.github/workflows/ci.yml` se déclenche automatiquement sur:
- Push sur `main` ou `develop`
- Pull Requests vers `main` ou `develop`
- Déclenchement manuel

### Configurer les Secrets GitHub

```bash
# Via GitHub UI:
# Settings > Secrets and variables > Actions > New repository secret

# Ou via GitHub CLI:
gh secret set VITE_SUPABASE_URL --body "https://votre-projet.supabase.co"
gh secret set VITE_SUPABASE_ANON_KEY --body "votre-cle-anon"
gh secret set VITE_STRIPE_PUBLIC_KEY --body "pk_test_..."
```

### Déclencher Manuellement

```bash
# Via GitHub CLI
gh workflow run ci.yml

# Voir le status
gh run list

# Voir les détails d'un run
gh run view <run-id>

# Voir les logs
gh run view <run-id> --log
```

### Vérifier le Status CI

```bash
# Status de la dernière run
gh run list --limit 1

# Télécharger les artifacts (ex: coverage)
gh run download <run-id>
```

---

## 🔧 Maintenance

### Mise à Jour des Dépendances

```bash
# Vérifier les versions outdated
npm outdated

# Mettre à jour les mineures/patchs (safe)
npm update

# Mettre à jour une dépendance spécifique
npm install package-name@latest

# Mettre à jour toutes les dépendances (attention!)
npm install -g npm-check-updates
ncu -u
npm install

# Re-run les tests après update
npm test
```

### Nettoyage

```bash
# Nettoyer node_modules
rm -rf node_modules package-lock.json
npm install

# Nettoyer le cache npm
npm cache clean --force

# Nettoyer dist/
rm -rf dist/

# Nettoyer les backups de logs
rm -rf .backups/
```

### Profiling et Performance

```bash
# Analyser le bundle
npm run build
npx vite-bundle-visualizer

# Ou avec webpack-bundle-analyzer (si installé)
npm install -D webpack-bundle-analyzer
# Ajouter au vite.config.ts

# Mesurer le temps de build
time npm run build
```

### Base de Données (Supabase)

```bash
# Si vous utilisez Supabase CLI localement
supabase start

# Appliquer les migrations
supabase db push

# Voir le status
supabase status

# Générer les types TypeScript
supabase gen types typescript --local > src/integrations/supabase/types.ts

# Arrêter
supabase stop
```

---

## 📊 Scripts de Reporting

### Générer un Rapport Complet

```bash
#!/bin/bash
# save as: scripts/generate-report.sh

echo "🔍 Génération du rapport d'audit..."
echo "=================================="
echo ""

echo "📦 1. Informations du projet"
echo "Version: $(node -p "require('./package.json').version")"
echo "Node: $(node --version)"
echo "npm: $(npm --version)"
echo ""

echo "📊 2. Statistiques du code"
echo "Lignes de code TypeScript:"
find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1
echo ""

echo "🧪 3. Tests"
npm test -- --run --coverage --reporter=verbose 2>&1 | tee test-report.txt
echo ""

echo "🔒 4. Sécurité"
npm audit --json > security-audit.json
node scripts/check-secrets.js > secrets-scan.txt 2>&1
echo ""

echo "📦 5. Build"
npm run build > build.log 2>&1
du -sh dist/ >> build.log
echo ""

echo "✅ Rapport généré!"
echo "Fichiers créés:"
echo "  - test-report.txt"
echo "  - security-audit.json"
echo "  - secrets-scan.txt"
echo "  - build.log"
```

### Rendre le Script Exécutable

```bash
chmod +x scripts/generate-report.sh
./scripts/generate-report.sh
```

---

## 🎯 Checklist de Déploiement

Avant chaque déploiement en production:

```bash
# 1. Variables d'environnement
[ -f .env ] && echo "✅ .env exists" || echo "❌ .env missing"

# 2. Tests
npm test -- --run && echo "✅ Tests pass" || echo "❌ Tests fail"

# 3. Linter
npm run lint && echo "✅ Lint pass" || echo "❌ Lint fail"

# 4. Sécurité
npm audit --audit-level=high && echo "✅ No high vulns" || echo "❌ Vulnerabilities found"

# 5. Build
npm run build && echo "✅ Build success" || echo "❌ Build fail"

# 6. Bundle size
BUNDLE_SIZE=$(du -s dist/ | awk '{print $1}')
[ $BUNDLE_SIZE -lt 500000 ] && echo "✅ Bundle < 500MB" || echo "⚠️ Bundle too large"

echo ""
echo "🚀 Ready to deploy!"
```

---

## 📞 Support

### Si Problèmes

1. **Build Errors**
   ```bash
   rm -rf node_modules package-lock.json dist
   npm install
   npm run build
   ```

2. **Test Failures**
   ```bash
   npm test -- --run --reporter=verbose
   # Vérifier les logs détaillés
   ```

3. **Docker Issues**
   ```bash
   docker-compose down -v
   docker system prune -af
   docker-compose up --build
   ```

4. **GitHub Actions Failures**
   - Vérifier les secrets sont configurés
   - Voir les logs dans l'onglet Actions
   - Re-run failed jobs

### Logs

```bash
# Logs de l'app
npm run dev 2>&1 | tee dev.log

# Logs Docker
docker-compose logs -f > docker.log

# Logs CI/CD
gh run view <run-id> --log > ci.log
```

---

## 📚 Ressources

- **Documentation Complète**: [analysis.md](./analysis.md)
- **Politique de Sécurité**: [SECURITY.md](./SECURITY.md)
- **Guide de Contribution**: [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Correctifs Appliqués**: [fixes/README.md](./fixes/README.md)

---

**Date de création**: 24 Novembre 2025  
**Auditeur**: Claude Sonnet 4.5  
**Version**: 1.0.0

**Note**: Ces commandes ont été testées et validées dans l'environnement de l'audit.

