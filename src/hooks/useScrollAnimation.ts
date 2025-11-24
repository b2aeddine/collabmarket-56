// Hook pour animer les éléments au scroll
import { useRef } from 'react';
import { useInView } from 'framer-motion';

export type AnimationVariant = 
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'scale-in'
  | 'slide-up'
  | 'slide-down'
  | 'zoom-in';

interface UseScrollAnimationOptions {
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean; // Animer une seule fois
}

export const useScrollAnimation = ({
  variant = 'fade-up',
  delay = 0,
  duration = 0.4,
  threshold = 0.15,
  once = true
}: UseScrollAnimationOptions = {}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once,
    amount: threshold,
    margin: '0px 0px -50px 0px' // Optimisé pour performance
  });

  const getInitialStyles = () => {
    switch (variant) {
      case 'fade-up':
        return { opacity: 0, y: 20 };
      case 'fade-down':
        return { opacity: 0, y: -20 };
      case 'fade-left':
        return { opacity: 0, x: 20 };
      case 'fade-right':
        return { opacity: 0, x: -20 };
      case 'scale-in':
        return { opacity: 0, scale: 0.95 };
      case 'slide-up':
        return { opacity: 0, y: 30 };
      case 'slide-down':
        return { opacity: 0, y: -30 };
      case 'zoom-in':
        return { opacity: 0, scale: 0.9 };
      default:
        return { opacity: 0, y: 15 };
    }
  };

  const getAnimateStyles = () => {
    return { opacity: 1, x: 0, y: 0, scale: 1 };
  };

  return {
    ref,
    initial: getInitialStyles(),
    animate: isInView ? getAnimateStyles() : getInitialStyles(),
    transition: {
      duration,
      delay,
      ease: [0.4, 0, 0.2, 1] // Optimisé pour performance
    }
  };
};

