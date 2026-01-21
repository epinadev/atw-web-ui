/**
 * Button component with variants.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-900",
          "disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 hover:bg-stone-700 dark:hover:bg-stone-300":
              variant === "default",
            "border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-700":
              variant === "outline",
            "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-900 dark:text-stone-100": variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600": variant === "destructive",
          },
          {
            "h-10 px-4 py-2": size === "default",
            "h-8 px-3 text-xs": size === "sm",
            "h-12 px-6": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
