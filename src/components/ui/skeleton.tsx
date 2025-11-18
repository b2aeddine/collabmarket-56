import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse-slow rounded-md bg-muted relative overflow-hidden",
        className
      )}
      style={{
        background: 'linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted)) 50%, hsl(var(--muted)) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s linear infinite'
      }}
      {...props}
    />
  )
}

export { Skeleton }
