// Composant réutilisable pour révéler les éléments au scroll - Optimisé pour performance
import { motion } from 'framer-motion';
import { ReactNode, memo } from 'react';
import { useScrollAnimation, AnimationVariant } from '@/hooks/useScrollAnimation';

interface ScrollRevealProps {
  children: ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
  once?: boolean;
}

export const ScrollReveal = memo(({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 0.4,
  className = '',
  threshold = 0.15,
  once = true
}: ScrollRevealProps) => {
  const animation = useScrollAnimation({ variant, delay, duration, threshold, once });

  return (
    <motion.div
      ref={animation.ref}
      initial={animation.initial}
      animate={animation.animate}
      transition={animation.transition}
      className={className}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
});

ScrollReveal.displayName = 'ScrollReveal';

export default ScrollReveal;

