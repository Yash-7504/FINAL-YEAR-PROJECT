import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-cyber-cyan focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-steel-azure text-white",
        secondary: "border-transparent bg-quantum-cyan text-white",
        success: "border-transparent bg-quantum-green text-white",
        warning: "border-transparent bg-quantum-amber text-white",
        destructive: "border-transparent bg-quantum-red text-white",
        outline: "text-text-primary border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }