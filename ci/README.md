# Configuration CI/CD

Ce dossier contient les configurations pour l'intégration et le déploiement continu (CI/CD).

## 📁 Structure

```
ci/
├── README.md              # Ce fichier
├── github-actions.yml     # Snippet GitHub Actions
├── gitlab-ci.yml          # Snippet GitLab CI (optionnel)
└── azure-pipelines.yml    # Snippet Azure Pipelines (optionnel)
```

## 🔄 GitHub Actions (Recommandé)

Le fichier principal est déjà créé dans `.github/workflows/ci.yml`.

### Configuration

1. **Copier le workflow** (déjà fait)
   ```bash
   # Le fichier existe déjà dans:
   .github/workflows/ci.yml
   ```

2. **Configurer les secrets GitHub**
   ```bash
   # Via GitHub UI:
   Settings > Secrets and variables > Actions

   # Secrets requis:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_STRIPE_PUBLIC_KEY
   ```

3. **Activer GitHub Actions**
   ```bash
   # Settings > Actions > General
   # Cocher "Allow all actions and reusable workflows"
   ```

### Jobs Configurés

#### 1. **lint** 🔍
- ESLint avec règles de sécurité
- Vérification des console.log
- Durée: ~1-2 min

#### 2. **security** 🔒
- npm audit
- Scan de secrets
- Dependency review (sur PR)
- Durée: ~2-3 min

#### 3. **test** 🧪
- Tests unitaires Vitest
- Couverture de code
- Upload vers Codecov
- Durée: ~2-3 min

#### 4. **typecheck** 📝
- Vérification TypeScript
- Durée: ~1 min

#### 5. **build** 🏗️
- Build de production
- Analyse de bundle size
- Upload des artifacts
- Durée: ~2-4 min

#### 6. **deploy-staging** 🚀 (optionnel)
- Déploiement automatique sur `develop`
- Environnement staging
- Durée: ~3-5 min

#### 7. **deploy-production** 🚀 (optionnel)
- Déploiement automatique sur `main`
- Environnement production
- Durée: ~3-5 min

### Déclencheurs

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  workflow_dispatch:  # Déclenchement manuel
```

### Status Badges

Ajouter au README.md:

```markdown
![CI Status](https://github.com/votre-org/collabmarket/workflows/CI%2FCD%20Pipeline/badge.svg)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen)
![Coverage](https://img.shields.io/codecov/c/github/votre-org/collabmarket)
```

## 🦊 GitLab CI (Alternatif)

Si vous utilisez GitLab, créer `.gitlab-ci.yml`:

```yaml
stages:
  - lint
  - test
  - build
  - deploy

# Variables globales
variables:
  NODE_VERSION: "18"
  
# Template de base
.node_template:
  image: node:${NODE_VERSION}-alpine
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
  before_script:
    - npm ci

# Job: Lint
lint:
  extends: .node_template
  stage: lint
  script:
    - npm run lint
    - npm run lint:security

# Job: Security
security:
  extends: .node_template
  stage: lint
  script:
    - npm audit --audit-level=moderate
    - node scripts/check-secrets.js

# Job: Tests
test:
  extends: .node_template
  stage: test
  script:
    - npm test -- --run --coverage
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

# Job: Build
build:
  extends: .node_template
  stage: build
  script:
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week

# Job: Deploy Staging
deploy:staging:
  extends: .node_template
  stage: deploy
  script:
    - echo "Deploying to staging..."
    # Ajouter commandes de déploiement
  only:
    - develop
  environment:
    name: staging
    url: https://staging.collabmarket.com

# Job: Deploy Production
deploy:production:
  extends: .node_template
  stage: deploy
  script:
    - echo "Deploying to production..."
    # Ajouter commandes de déploiement
  only:
    - main
  environment:
    name: production
    url: https://collabmarket.com
  when: manual  # Déploiement manuel en prod
```

## ☁️ Azure Pipelines (Alternatif)

Si vous utilisez Azure DevOps, créer `azure-pipelines.yml`:

```yaml
trigger:
  branches:
    include:
      - main
      - develop

pool:
  vmImage: 'ubuntu-latest'

variables:
  nodeVersion: '18.x'

stages:
- stage: Lint
  jobs:
  - job: ESLint
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: $(nodeVersion)
    - script: npm ci
      displayName: 'Install dependencies'
    - script: npm run lint:security
      displayName: 'Run ESLint'

- stage: Test
  jobs:
  - job: UnitTests
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: $(nodeVersion)
    - script: npm ci
      displayName: 'Install dependencies'
    - script: npm test -- --run --coverage
      displayName: 'Run tests'
    - task: PublishTestResults@2
      inputs:
        testResultsFormat: 'JUnit'
        testResultsFiles: '**/junit.xml'
    - task: PublishCodeCoverageResults@1
      inputs:
        codeCoverageTool: 'Cobertura'
        summaryFileLocation: '**/coverage/cobertura-coverage.xml'

- stage: Build
  jobs:
  - job: BuildApp
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: $(nodeVersion)
    - script: npm ci
      displayName: 'Install dependencies'
    - script: npm run build
      displayName: 'Build application'
    - task: PublishBuildArtifacts@1
      inputs:
        pathToPublish: 'dist'
        artifactName: 'app-build'

- stage: Deploy
  condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
  jobs:
  - deployment: Production
    environment: 'production'
    strategy:
      runOnce:
        deploy:
          steps:
          - script: echo "Deploying to production..."
            displayName: 'Deploy'
```

## 🎯 Bonnes Pratiques

### 1. Sécurité

- ✅ Ne JAMAIS commiter les secrets
- ✅ Utiliser les secrets managers (GitHub Secrets, etc.)
- ✅ Scanner régulièrement les dépendances
- ✅ Minimum 2 approvals pour déploiements prod

### 2. Tests

- ✅ Minimum 60% de couverture de code
- ✅ Tests obligatoires avant merge
- ✅ Tests E2E pour fonctionnalités critiques
- ✅ Tests de performance périodiques

### 3. Build

- ✅ Build optimisé pour production
- ✅ Compression gzip/brotli
- ✅ Tree shaking et code splitting
- ✅ Bundle size < 500KB

### 4. Déploiement

- ✅ Staging automatique sur develop
- ✅ Production manuelle sur main
- ✅ Rollback automatique si échec
- ✅ Zero-downtime deployment

## 📊 Monitoring

### Métriques à Suivre

1. **Build Time**
   - Objectif: < 5 minutes
   - Alerte si > 10 minutes

2. **Test Coverage**
   - Objectif: > 60%
   - Alerte si < 50%

3. **Bundle Size**
   - Objectif: < 500KB gzip
   - Alerte si > 1MB

4. **Vulnérabilités**
   - Objectif: 0 high/critical
   - Alerte immédiate si détectées

### Notifications

Configurer des notifications sur:
- Échecs de build
- Vulnérabilités détectées
- Déploiements en production
- Baisse de couverture de tests

#### Exemple Slack

```yaml
# Ajouter à .github/workflows/ci.yml
- name: Notify Slack
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "❌ Build failed on ${{ github.ref }}",
        "attachments": [{
          "color": "danger",
          "fields": [{
            "title": "Repository",
            "value": "${{ github.repository }}",
            "short": true
          }, {
            "title": "Commit",
            "value": "${{ github.sha }}",
            "short": true
          }]
        }]
      }
```

## 🔧 Troubleshooting

### Build Échoue sur CI mais Passe Localement

```bash
# 1. Vérifier les versions Node
node --version  # Local
# Comparer avec la version dans CI (ex: 18.x)

# 2. Clean install
rm -rf node_modules package-lock.json
npm ci  # Utiliser ci, pas install

# 3. Vérifier les variables d'environnement
env | grep VITE_
```

### Tests Échouent sur CI

```bash
# 1. Lancer en mode CI localement
CI=true npm test -- --run

# 2. Désactiver le cache
npm test -- --run --no-cache

# 3. Mode verbose
npm test -- --run --reporter=verbose
```

### Secrets Non Disponibles

```yaml
# Vérifier la configuration:
# GitHub > Settings > Secrets > Actions

# Test dans le workflow:
- name: Check secrets
  run: |
    if [ -z "${{ secrets.VITE_SUPABASE_URL }}" ]; then
      echo "❌ VITE_SUPABASE_URL not set"
      exit 1
    fi
```

## 📚 Ressources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [GitLab CI Docs](https://docs.gitlab.com/ee/ci/)
- [Azure Pipelines Docs](https://docs.microsoft.com/en-us/azure/devops/pipelines/)
- [Workflow Examples](https://github.com/actions/starter-workflows)

## 📞 Support

Questions sur la CI/CD ?
- Email: devops@collabmarket.com
- Issues: [GitHub Issues](https://github.com/collabmarket/collabmarket/issues)
- Docs: [analysis.md](../analysis.md)

---

**Dernière mise à jour**: 24 Novembre 2025

