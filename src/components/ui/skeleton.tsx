import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted relative overflow-hidden",
        className
      )}
      style={{
        background: 'linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--muted) / 0.5) 50%, hsl(var(--muted)) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.8s ease-in-out infinite'
      }}
      {...props}
    />
  )
}

export { Skeleton }
