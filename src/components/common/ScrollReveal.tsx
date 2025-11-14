import { ReactNode } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  animation?: 'fade-in' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale-in';
  delay?: number;
  duration?: number;
  threshold?: number;
  triggerOnce?: boolean;
}

/**
 * Composant qui révèle son contenu avec une animation au scroll
 * 
 * @example
 * <ScrollReveal animation="fade-in" delay={100}>
 *   <h1>Mon titre</h1>
 * </ScrollReveal>
 */
export const ScrollReveal = ({
  children,
  className,
  animation = 'fade-in',
  delay = 0,
  duration = 600,
  threshold = 0.1,
  triggerOnce = true,
}: ScrollRevealProps) => {
  const { elementRef, isVisible } = useScrollAnimation({
    threshold,
    triggerOnce,
  });

  const animationClasses = {
    'fade-in': 'opacity-0 translate-y-4',
    'slide-up': 'opacity-0 translate-y-8',
    'slide-down': 'opacity-0 -translate-y-8',
    'slide-left': 'opacity-0 translate-x-8',
    'slide-right': 'opacity-0 -translate-x-8',
    'scale-in': 'opacity-0 scale-95',
  };

  const visibleClasses = {
    'fade-in': 'opacity-100 translate-y-0',
    'slide-up': 'opacity-100 translate-y-0',
    'slide-down': 'opacity-100 translate-y-0',
    'slide-left': 'opacity-100 translate-x-0',
    'slide-right': 'opacity-100 translate-x-0',
    'scale-in': 'opacity-100 scale-100',
  };

  return (
    <div
      ref={elementRef}
      className={cn(
        'transition-all ease-out',
        animationClasses[animation],
        isVisible && visibleClasses[animation],
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        cursor: 'default',
      }}
    >
      {children}
    </div>
  );
};

