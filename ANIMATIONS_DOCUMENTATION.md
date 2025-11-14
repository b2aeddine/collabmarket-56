# 🎨 Documentation des Animations - CollabMarket

## 📋 Vue d'ensemble

Ce document décrit toutes les animations et micro-interactions ajoutées au projet CollabMarket pour améliorer l'expérience utilisateur.

---

## 🎯 Animations Configurées dans Tailwind

### Keyframes ajoutés

1. **slide-in-top** - Slide depuis le haut avec fade-in
2. **slide-in-bottom** - Slide depuis le bas avec fade-in
3. **slide-out-top** - Slide vers le haut avec fade-out
4. **slide-out-bottom** - Slide vers le bas avec fade-out
5. **pulse-subtle** - Pulse léger pour les états de chargement
6. **spin-slow** - Rotation lente pour les spinners
7. **shimmer** - Effet shimmer pour les skeletons

### Classes d'animation disponibles

```css
animate-fade-in          /* Fade-in avec translation Y */
animate-scale-in         /* Scale-in avec fade */
animate-slide-in-top     /* Slide depuis le haut */
animate-slide-in-bottom  /* Slide depuis le bas */
animate-slide-out-top    /* Slide vers le haut */
animate-slide-out-bottom /* Slide vers le bas */
animate-pulse-subtle     /* Pulse léger */
animate-spin-slow        /* Rotation lente */
animate-shimmer          /* Effet shimmer */
```

---

## 🔘 Animations sur les Boutons

### Comportement
- **Hover** : `scale-105` + `shadow-lg`
- **Active/Click** : `scale-95`
- **Transition** : `duration-200 ease-in-out`

### Fichiers modifiés
- `src/components/ui/button.tsx`

### Exemple d'utilisation
```tsx
<Button>Cliquez-moi</Button>
// Les animations sont automatiquement appliquées
```

---

## 🃏 Animations sur les Cartes

### Comportement
- **Mount** : `animate-fade-in` (apparition progressive)
- **Hover** : `scale-[1.02]` + `shadow-lg` → `shadow-xl`
- **Transition** : `duration-300 ease-in-out`

### Fichiers modifiés
- `src/components/ui/card.tsx` (composant de base)
- `src/components/catalog/InfluencerCard.tsx`
- `src/components/OfferCard.tsx`
- `src/components/SocialNetworkCard.tsx`
- `src/components/merchant/ProfileCard.tsx`
- `src/components/common/StatsCard.tsx`

### Exemple d'utilisation
```tsx
<Card>
  {/* Contenu de la carte */}
</Card>
// Les animations sont automatiquement appliquées
```

---

## 📋 Animations Staggered sur les Listes

### Comportement
- Chaque élément apparaît avec un délai de **50ms** après le précédent
- Animation `fade-in` avec `animationDelay` progressif
- Crée un effet de cascade visuelle

### Fichiers modifiés
- `src/pages/InfluencerCatalog.tsx` (grille d'influenceurs)
- `src/components/merchant/RecentOrdersCard.tsx`
- `src/components/merchant/FavoriteInfluencersCard.tsx`
- `src/components/common/StaggeredList.tsx` (composant utilitaire)

### Exemple d'utilisation
```tsx
// Méthode 1: Directe avec style inline
{items.map((item, index) => (
  <div
    key={item.id}
    className="animate-fade-in"
    style={{
      animationDelay: `${index * 50}ms`,
      animationFillMode: 'both'
    }}
  >
    <ItemComponent item={item} />
  </div>
))}

// Méthode 2: Avec le composant StaggeredList
<StaggeredList staggerDelay={50}>
  {items.map(item => (
    <ItemComponent key={item.id} item={item} />
  ))}
</StaggeredList>
```

---

## 🔔 Animations sur les Alertes

### Comportement
- **Apparition** : `animate-slide-in-top` (slide depuis le haut)
- **Transition** : `duration-300`
- Améliore la visibilité des notifications

### Fichiers modifiés
- `src/components/ui/alert.tsx` (composant de base)
- `src/components/PaymentStatusAlert.tsx`

### Exemple d'utilisation
```tsx
<Alert className="animate-slide-in-top">
  <AlertDescription>Message d'alerte</AlertDescription>
</Alert>
```

---

## ⏳ Composants de Chargement Animés

### 1. Skeleton avec Shimmer

**Comportement** :
- Animation `pulse` pour le fond
- Effet `shimmer` (gradient animé) pour l'effet de chargement
- Crée un effet de "skeleton loading" moderne

**Fichier modifié** :
- `src/components/ui/skeleton.tsx`

**Exemple** :
```tsx
<Skeleton className="h-10 w-full" />
// Shimmer automatique appliqué
```

### 2. AnimatedLoader

**Comportement** :
- Spinner avec `animate-spin-slow`
- Texte optionnel avec `animate-pulse-subtle`
- Tailles disponibles : `sm`, `md`, `lg`

**Fichier créé** :
- `src/components/common/AnimatedLoader.tsx`

**Exemple** :
```tsx
<AnimatedLoader size="md" text="Chargement..." />
```

### 3. CatalogSkeleton avec Staggered

**Comportement** :
- Skeleton cards avec animation `pulse-subtle` staggered
- Délai de 100ms entre chaque carte
- Effet visuel de chargement progressif

**Fichier modifié** :
- `src/components/common/CatalogSkeleton.tsx`

---

## 🎨 Guide de Réutilisation

### Ajouter une animation à un nouveau composant

#### Pour les boutons
```tsx
// Les animations sont déjà dans le composant Button de base
<Button>Mon bouton</Button>
```

#### Pour les cartes
```tsx
// Utiliser le composant Card de base
<Card className="hover:shadow-xl">
  {/* Contenu */}
</Card>
```

#### Pour les listes
```tsx
// Utiliser StaggeredList ou appliquer manuellement
<StaggeredList staggerDelay={50}>
  {items.map(item => <Item key={item.id} />)}
</StaggeredList>
```

#### Pour les alertes
```tsx
<Alert className="animate-slide-in-top">
  {/* Contenu */}
</Alert>
```

---

## ⚡ Performance

### Optimisations appliquées
- ✅ Utilisation de `transform` et `opacity` (GPU-accelerated)
- ✅ Animations CSS pures (pas de JavaScript)
- ✅ Durées courtes (200-300ms)
- ✅ `will-change` implicite via Tailwind
- ✅ Pas d'animations sur les éléments hors écran

### Bonnes pratiques
- Les animations sont désactivées sur `prefers-reduced-motion`
- Durées courtes pour ne pas ralentir l'interface
- Effets subtils pour ne pas distraire

---

## 📝 Checklist d'Application

### ✅ Composants animés

- [x] Boutons (Button)
- [x] Cartes (Card, InfluencerCard, OfferCard, etc.)
- [x] Listes (InfluencerCatalog, RecentOrdersCard, etc.)
- [x] Alertes (Alert, PaymentStatusAlert)
- [x] Skeletons (Skeleton, CatalogSkeleton)
- [x] Loaders (AnimatedLoader)

### 🔄 À étendre (optionnel)

- [ ] Formulaires (inputs, selects)
- [ ] Modals (dialog, sheet)
- [ ] Navigation (links, menu items)
- [ ] Badges et tags
- [ ] Tooltips

---

## 🚀 Commandes de Validation

```bash
# Vérifier que les animations fonctionnent
npm run dev

# Tester les animations dans le navigateur
# - Ouvrir DevTools
# - Vérifier les transitions CSS
# - Tester hover, click, focus sur les composants
```

---

## 📚 Références

- **Tailwind CSS Animations** : https://tailwindcss.com/docs/animation
- **CSS Animations Best Practices** : https://web.dev/animations/
- **Framer Motion** (si besoin de plus de complexité) : https://www.framer.com/motion/

---

**Dernière mise à jour** : 20 janvier 2025  
**Commits** : 6 commits séparés par type d'animation

