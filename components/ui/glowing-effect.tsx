import React from "react"
import { cn } from "@/lib/utils"

export interface GlowingCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean
}

const GlowingCard = React.forwardRef<HTMLDivElement, GlowingCardProps>(
  ({ className, glow = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-6 shadow-md transition-all duration-300",
        glow && "hover:shadow-lg hover:shadow-blue-500/20",
        className
      )}
      {...props}
    />
  )
)
GlowingCard.displayName = "GlowingCard"

export { GlowingCard }
