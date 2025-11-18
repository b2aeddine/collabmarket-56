// AnimatedList component for staggered fade-in animations
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedListProps {
  children: ReactNode[];
  className?: string;
  delay?: number;
}

export const AnimatedList = ({ children, className = "", delay = 0.05 }: AnimatedListProps) => {
  return (
    <>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: index * delay,
            ease: "easeOut"
          }}
          className={className}
        >
          {child}
        </motion.div>
      ))}
    </>
  );
};

