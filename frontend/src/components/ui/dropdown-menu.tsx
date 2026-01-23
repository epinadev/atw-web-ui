/**
 * Dropdown menu component.
 * Uses Portal to render menu outside of overflow containers.
 */

"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
}

export function DropdownMenu({ trigger, children, align = "right" }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [coords, setCoords] = React.useState({ top: 0, left: 0, right: 0 });
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Only render portal after mount (client-side only)
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate position when opening
  const handleOpen = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        left: rect.left,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen(true);
  };

  // Close menu
  const handleClose = () => setOpen(false);

  // Handle click outside
  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        handleClose();
      }
    };

    // Delay to prevent immediate close from the opening click
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Close on escape
  React.useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  const menuContent = (
    <div
      ref={menuRef}
      className="fixed z-[9999] min-w-[180px] max-h-[80vh] overflow-y-auto rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-1 shadow-lg"
      style={{
        top: coords.top,
        ...(align === "right" ? { right: coords.right } : { left: coords.left }),
      }}
      onClick={handleClose}
    >
      {children}
    </div>
  );

  return (
    <div className="relative" ref={triggerRef}>
      <div onClick={open ? handleClose : handleOpen}>{trigger}</div>
      {mounted && open && createPortal(menuContent, document.body)}
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
