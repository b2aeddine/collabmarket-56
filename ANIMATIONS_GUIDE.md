# 🎨 Guide des Animations - CollabMarket

## 📋 Vue d'ensemble

Ce guide documente toutes les micro-interactions et animations optimisées du projet CollabMarket pour une expérience utilisateur fluide et performante.

---

## 🎯 Principes d'optimisation

### Performance
- **GPU-friendly** : Toutes les animations utilisent `transform` et `opacity`
- **Durées harmonisées** : Entre 150ms et 220ms pour la cohérence
- **Easing optimisé** : `cubic-bezier(0.4, 0, 0.2, 1)` pour la fluidité
- **will-change** : Utilisé sur les composants interactifs pour optimiser le rendu

### Cohérence
- Échelles réduites (1.01-1.02) pour des animations subtiles et professionnelles
- Délais courts pour éviter les latences perçues
- Transitions uniformes sur tous les composants

---

## 🎯 Types d'animations implémentées

### 1. **Boutons** (`src/components/ui/button.tsx`)

**Animations:**
- **Hover:** `scale(1.02)`, `translate-y(-1px)`, `shadow-lg`
- **Active:** `scale(0.97)` pour le feedback de clic
- **Focus:** Ring avec transition fluide
- **Durée:** 180ms avec `cubic-bezier(0.4, 0, 0.2, 1)`
- **Performance:** `will-change-transform` pour optimisation GPU

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
- **Hover:** `scale(1.01)`, `translate-y(-0.5)`, `shadow-lg`
- **Mount:** `animate-fade-in` (fade-in au chargement)
- **Durée:** 200ms avec `ease-out`
- **Performance:** `will-change-transform`

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

### 3. **Accordéons et Animations d'ouverture**

**Animation:**
- Utilise des animations optimisées avec `opacity` + `height`
- Durée : 180ms
- Easing : `cubic-bezier(0.4, 0, 0.2, 1)`

**Keyframes:**
```typescript
'accordion-down': {
  from: { height: '0', opacity: '0' },
  to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
}
```

---

### 4. **Loaders et Skeletons**

#### Skeleton (`src/components/ui/skeleton.tsx`)
- **Animation:** `shimmer` avec gradient optimisé
- **Durée:** 1.8s (infinite)
- Effet de brillance fluide avec `ease-in-out`

#### LoadingSpinner (`src/components/common/LoadingSpinner.tsx`)
- **Animation:** `spin-slow` (1.8s par rotation)
- Tailles: `sm`, `md`, `lg`

**Utilisation:**
```tsx
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

<LoadingSpinner size="md" />
```

---

### 5. **Notifications et Alertes**

#### Toasts (`src/components/ui/sonner.tsx`)
- **Apparition:** `slide-in-top` (12px de translation)
- **Position:** `top-right`
- **Boutons:** Scale 1.02 au hover, 0.97 au click
- **Durée:** 180ms avec `ease-out`

#### Alertes (`src/components/ui/alert.tsx`)
- **Apparition:** `slide-in-top`
- **Hover:** `shadow-md`
- **Durée:** 200ms

---

### 6. **Formulaires** (`src/components/ui/input.tsx`, `textarea.tsx`)

**Animations:**
- **Focus:** `shadow-md`, bordure renforcée (sans scale pour éviter les déplacements)
- **Durée:** 180ms avec `ease-out`
- Transition douce pour le feedback visuel

**Exemple:**
```tsx
<Input placeholder="Votre email" />
// Animation automatique au focus
```

---

### 7. **Onglets** (`src/components/ui/tabs.tsx`)

**Animations:**
- **TabsTrigger:** Hover avec `bg-muted/50`, transition 180ms
- **TabsContent:** Apparition avec `animate-fade-in`
- Transitions fluides entre les onglets

---

### 8. **Sheets/Drawers** (`src/components/ui/sheet.tsx`)

**Animations:**
- **Ouverture/Fermeture:** 200ms avec `ease-out`
- **Overlay:** Fade optimisé
- Transitions cohérentes pour tous les côtés (top, bottom, left, right)

---

## 🎨 Animations Tailwind personnalisées

Toutes les animations sont définies dans `tailwind.config.ts`:

```typescript
keyframes: {
  'fade-in': {
    '0%': { opacity: '0', transform: 'translateY(8px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' }
  },
  'scale-in': {
    '0%': { transform: 'scale(0.96)', opacity: '0' },
    '100%': { transform: 'scale(1)', opacity: '1' }
  },
  'slide-in-top': {
    '0%': { opacity: '0', transform: 'translateY(-12px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' }
  },
  'shimmer': {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' }
  }
}

animation: {
  'fade-in': 'fade-in 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  'scale-in': 'scale-in 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
  'slide-in-top': 'slide-in-top 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  'shimmer': 'shimmer 1.8s ease-in-out infinite'
}
```

**Classes disponibles:**
- `animate-fade-in` (200ms)
- `animate-fade-in-up` (200ms)
- `animate-slide-in-top` (200ms)
- `animate-slide-in-bottom` (200ms)
- `animate-scale-in` (180ms)
- `animate-spin-slow` (1.8s)
- `animate-pulse-slow` (2.2s)
- `animate-shimmer` (1.8s)

---

## 📦 Dépendances

- **framer-motion:** `^11.0.0` - Pour les animations complexes (scroll reveals)
- **tailwindcss-animate:** `^1.0.7` - Animations de base Tailwind

---

## 🚀 Utilisation rapide

### Pour ajouter une animation à un nouveau composant:

**1. Animation simple (Tailwind):**
```tsx
<div className="animate-fade-in hover-scale">
  Contenu
</div>
```

**2. Animation de carte:**
```tsx
<Card className="animate-fade-in">
  {/* Le hover est automatique via le composant Card */}
</Card>
```

**3. Animation au scroll:**
```tsx
import ScrollReveal from "@/components/common/ScrollReveal";

<ScrollReveal variant="fade-up" delay={0.1}>
  <div>Contenu</div>
</ScrollReveal>
```

---

## ⚡ Performance

- Toutes les animations utilisent `transform` et `opacity` (GPU-accelerated)
- Durées courtes (150-220ms) pour rester réactives
- `will-change-transform` sur les composants interactifs
- Pas d'animations lourdes ou distrayantes
- Optimisé pour mobile avec des animations légères

---

## 🎯 Bonnes pratiques

1. **Durées:** 150-220ms pour les micro-interactions
2. **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` pour la fluidité
3. **Délais:** 50-100ms entre items pour les listes
4. **Scale:** Maximum 1.02 pour le hover (subtile et professionnelle)
5. **Translation:** Maximum 1px vertical pour éviter les "sauts"
6. **Accessibilité:** Respecte `prefers-reduced-motion`

---

## 📝 Notes techniques

- Les animations sont **non-blocking** et n'affectent pas les performances
- Compatible avec tous les navigateurs modernes
- `will-change` géré intelligemment pour éviter la surconsommation de ressources
- Les animations peuvent être désactivées via CSS si nécessaire

---

**Dernière mise à jour:** 20 janvier 2025 - Optimisation complète des animations

