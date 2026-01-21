/**
 * Dropdown menu component.
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
}

export function DropdownMenu({ trigger, children, align = "right" }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1 min-w-[180px] rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-1 shadow-lg",
            align === "right" ? "right-0" : "left-0"
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  icon?: React.ReactNode;
}

export function DropdownMenuItem({
  children,
  onClick,
  disabled,
  destructive,
  icon,
}: DropdownMenuItemProps) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-sm text-left",
        disabled
          ? "text-stone-400 dark:text-stone-500 cursor-not-allowed"
          : destructive
          ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
          : "text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700"
      )}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-stone-200 dark:bg-stone-700" />;
}

export function DropdownMenuLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 py-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400">
      {children}
    </div>
  );
}
