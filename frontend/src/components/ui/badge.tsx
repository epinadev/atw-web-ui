/**
 * Badge component.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "success" | "warning" | "error";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200": variant === "default",
          "border border-stone-300 dark:border-stone-600 text-stone-600 dark:text-stone-300": variant === "outline",
          "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300": variant === "success",
          "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300": variant === "warning",
          "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300": variant === "error",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
