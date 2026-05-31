import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-[#0052FF] bg-[#0052FF] text-white shadow-brand hover:-translate-y-0.5 hover:bg-[#0047db] hover:shadow-[0_14px_34px_-14px_rgba(0,82,255,0.45)] active:translate-y-0",
        destructive:
          "border border-rose-500 bg-rose-500 text-white shadow-[0_10px_24px_-14px_rgba(225,29,72,0.6)] hover:-translate-y-0.5 hover:bg-rose-600 hover:shadow-[0_14px_30px_-16px_rgba(225,29,72,0.7)] active:translate-y-0",
        outline:
          "border border-slate-200 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary-soft hover:text-primary active:translate-y-0",
        secondary:
          "border border-white/80 bg-white text-slate-800 shadow-sm hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0",
        ghost: "text-slate-600 hover:bg-primary-soft hover:text-primary hover:-translate-y-0.5",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-xl px-3.5 text-xs",
        lg: "h-12 rounded-2xl px-8 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
