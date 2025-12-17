import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-light tracking-wide uppercase transition-all duration-300 cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/30 overflow-hidden",
  {
    variants: {
      variant: {
        default: "px-8 py-3 hover:scale-101 rounded-xl",
        destructive: "px-8 py-3 hover:scale-101 rounded-xl",
        outline: "px-8 py-3 hover:scale-101 rounded-xl",
        secondary: "px-8 py-3 hover:scale-101 rounded-xl",
        ghost: "hover:bg-foreground/5 rounded-xl",
        link: "text-foreground/70 hover:text-foreground underline-offset-4 hover:underline",
      },
      size: {
        default: "px-8 py-3 rounded-xl",
        sm: "px-6 py-2 text-xs rounded-xl",
        lg: "px-10 py-4 text-base rounded-xl",
        icon: "size-10 rounded-full",
        "icon-sm": "size-8 rounded-full",
        "icon-lg": "size-12 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  if (asChild) {
    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </Comp>
    );
  }

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2 text-foreground/90 group-hover:text-white transition-colors duration-300">
        {children}
      </span>
      <div className="absolute inset-0 border group-hover:border-transparent transition-all duration-300 rounded-xl" />
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--gradient-purple)] via-[var(--gradient-magenta)] to-[var(--gradient-pink)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl" />
    </Comp>
  );
}

export { Button, buttonVariants };

