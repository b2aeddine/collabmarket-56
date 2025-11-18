# 🎨 Guide des Animations - CollabMarket

## 📋 Vue d'ensemble

Ce guide documente toutes les micro-interactions et animations ajoutées au projet CollabMarket pour améliorer l'expérience utilisateur.

---

## 🎯 Types d'animations implémentées

### 1. **Boutons** (`src/components/ui/button.tsx`)

**Animations:**
- **Hover:** `scale(1.05)`, `translate-y(-0.5)`, `shadow-lg`
- **Active:** `scale(0.95)` pour le feedback de clic
- **Focus:** Ring amélioré avec transition
- **Durée:** 200ms

**Variantes:**
- Chaque variant a sa propre couleur d'ombre au hover
- `default`: `shadow-primary/50`
- `destructive`: `shadow-destructive/50`
- `secondary`: `shadow-secondary/50`

**Exemple d'utilisation:**
```tsx
<Button>Cliquez-moi</Button>
// Animation automatique au hover et clic
```

---

### 2. **Cartes** (`src/components/ui/card.tsx`)

**Animations:**
- **Hover:** `scale(1.02)`, `translate-y(-1)`, `shadow-lg`
- **Mount:** `animate-fade-in` (fade-in au chargement)
- **Durée:** 300ms

**Composants affectés:**
- `InfluencerCard`
- `OfferCard`
- `SocialNetworkCard`
- `StatsCard`

**Exemple:**
```tsx
<Card>
  <CardContent>Contenu</CardContent>
</Card>
// Animation automatique au hover
```

---

### 3. **Listes avec Staggered Animation** (`src/pages/InfluencerCatalog.tsx`)

**Animation:**
- Utilise **Framer Motion** pour les animations staggered
- Chaque item apparaît avec un délai de 50ms
- Effet: `fade-in` + `slide-up`

**Composant réutilisable:**
```tsx
import { AnimatedList } from "@/components/common/AnimatedList";

<AnimatedList delay={0.05}>
  {items.map(item => <Item key={item.id} />)}
</AnimatedList>
```

**Implémentation actuelle:**
```tsx
{filteredInfluencers.map((influencer, index) => (
  <motion.div
    key={influencer.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      duration: 0.3,
      delay: index * 0.05,
      ease: "easeOut"
    }}
  >
    <InfluencerCard influencer={influencer} />
  </motion.div>
))}
```

---

### 4. **Loaders et Skeletons**

#### Skeleton (`src/components/ui/skeleton.tsx`)
- **Animation:** `shimmer` avec gradient
- **Durée:** 2s (infinite)
- Effet de brillance qui traverse le skeleton

#### LoadingSpinner (`src/components/common/LoadingSpinner.tsx`)
- **Animation:** `spin-slow` (2s par rotation)
- Tailles: `sm`, `md`, `lg`

**Utilisation:**
```tsx
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

<LoadingSpinner size="md" />
```

#### CatalogSkeleton
- **Animation:** `pulse-slow` pour les cartes de chargement

---

### 5. **Notifications et Alertes**

#### Toasts (`src/components/ui/sonner.tsx`)
- **Apparition:** `slide-in-top` depuis le haut
- **Position:** `top-right`
- **Boutons:** Scale au hover/active

#### Alertes (`src/components/ui/alert.tsx`)
- **Apparition:** `slide-in-top`
- **Hover:** `shadow-md`

---

### 6. **Formulaires** (`src/components/ui/input.tsx`, `textarea.tsx`)

**Animations:**
- **Focus:** `scale(1.01)`, `shadow-md`, bordure renforcée
- **Durée:** 200ms
- Transition douce pour le feedback visuel

**Exemple:**
```tsx
<Input placeholder="Votre email" />
// Animation automatique au focus
```

---

### 7. **Header et Navigation** (`src/components/Header.tsx`)

**Animations:**
- **Logo:** `scale(1.05)` au hover, `scale(0.95)` au clic
- **Icône logo:** `rotate(12deg)` au hover
- **Liens:** Héritent des animations des boutons

---

## 🎨 Animations Tailwind personnalisées

Toutes les animations sont définies dans `tailwind.config.ts`:

```typescript
keyframes: {
  'fade-in': { /* ... */ },
  'fade-in-up': { /* ... */ },
  'slide-in-top': { /* ... */ },
  'slide-in-bottom': { /* ... */ },
  'scale-in': { /* ... */ },
  'spin-slow': { /* ... */ },
  'pulse-slow': { /* ... */ },
  'shimmer': { /* ... */ }
}
```

**Classes disponibles:**
- `animate-fade-in`
- `animate-fade-in-up`
- `animate-slide-in-top`
- `animate-slide-in-bottom`
- `animate-scale-in`
- `animate-spin-slow`
- `animate-pulse-slow`
- `animate-shimmer`

---

## 📦 Dépendances

- **framer-motion:** `^11.0.0` - Pour les animations complexes (listes staggered)
- **tailwindcss-animate:** `^1.0.7` - Animations de base Tailwind

---

## 🚀 Utilisation rapide

### Pour ajouter une animation à un nouveau composant:

**1. Animation simple (Tailwind):**
```tsx
<div className="animate-fade-in hover:scale-105 transition-all duration-300">
  Contenu
</div>
```

**2. Animation staggered (Framer Motion):**
```tsx
import { motion } from "framer-motion";

{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      duration: 0.3,
      delay: index * 0.05,
      ease: "easeOut"
    }}
  >
    {item.content}
  </motion.div>
))}
```

**3. Animation de carte:**
```tsx
<Card className="animate-fade-in">
  {/* Le hover est automatique via le composant Card */}
</Card>
```

---

## ⚡ Performance

- Toutes les animations utilisent `transform` et `opacity` (GPU-accelerated)
- Durées courtes (200-300ms) pour rester réactives
- Pas d'animations lourdes ou distrayantes
- `will-change` géré automatiquement par le navigateur

---

## 🎯 Bonnes pratiques

1. **Durées:** 200-300ms pour les micro-interactions
2. **Easing:** `ease-out` pour les entrées, `ease-in` pour les sorties
3. **Délais:** 50ms entre items pour les listes staggered
4. **Scale:** Maximum 1.05 pour le hover (subtile)
5. **Accessibilité:** Respecte `prefers-reduced-motion` (à implémenter)

---

## 📝 Notes

- Les animations sont **non-blocking** et n'affectent pas les performances
- Compatible avec tous les navigateurs modernes
- Les animations peuvent être désactivées via CSS si nécessaire

---

**Dernière mise à jour:** 20 janvier 2025

