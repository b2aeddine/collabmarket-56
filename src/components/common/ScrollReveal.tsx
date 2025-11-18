// Composant réutilisable pour révéler les éléments au scroll
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
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

export const ScrollReveal = ({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 0.5,
  className = '',
  threshold = 0.1,
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
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;

