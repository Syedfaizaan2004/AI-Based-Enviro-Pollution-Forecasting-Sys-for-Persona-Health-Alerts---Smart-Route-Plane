import * as React from "react"
import { cn } from "@/lib/utils"

const GlassCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "glass-card inner-border overflow-hidden bg-card/60 backdrop-blur-xl border border-border/40 shadow-glass transition-all duration-300 hover:shadow-glass-hover hover:border-border/60", 
      className
    )} 
    {...props} 
  />
))
GlassCard.displayName = "GlassCard"
export { GlassCard }
