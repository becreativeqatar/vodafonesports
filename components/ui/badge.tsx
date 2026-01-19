import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-vodafone-red text-white shadow hover:bg-vodafone-red/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        registered:
          "border-transparent bg-secondary-aqua-blue text-white",
        checkedIn:
          "border-transparent bg-secondary-spring-green text-white",
        cancelled:
          "border-transparent bg-vodafone-grey text-white",
        kids:
          "border-transparent bg-secondary-lemon-yellow text-black",
        youth:
          "border-transparent bg-secondary-aqua-blue text-white",
        adult:
          "border-transparent bg-vodafone-red text-white",
        senior:
          "border-transparent bg-secondary-turquoise text-white",
        admin:
          "border-transparent bg-vodafone-red text-white",
        manager:
          "border-transparent bg-secondary-aubergine text-white",
        validator:
          "border-transparent bg-secondary-turquoise text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
