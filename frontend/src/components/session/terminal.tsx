/**
 * Interactive terminal component using xterm.js.
 */

"use client";

import { useEffect, useRef, useCallback } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

interface TerminalProps {
  onInput?: (data: string) => void;
  onResize?: (rows: number, cols: number) => void;
  terminalRef?: React.MutableRefObject<Terminal | null>;
}

export function XTerminal({ onInput, onResize, terminalRef }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalTermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const callbacksRef = useRef({ onInput, onResize });

  // Update callbacks ref to avoid stale closures
  useEffect(() => {
    callbacksRef.current = { onInput, onResize };
  }, [onInput, onResize]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create terminal instance
    const terminal = new Terminal({
      cursorBlink: true,
      cursorStyle: "block",
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: "#1c1917", // stone-900
        foreground: "#fafaf9", // stone-50
        cursor: "#22c55e", // green-500
        cursorAccent: "#1c1917",
        selectionBackground: "#44403c", // stone-700
        black: "#1c1917",
        red: "#ef4444",
        green: "#22c55e",
        yellow: "#eab308",
        blue: "#3b82f6",
        magenta: "#a855f7",
        cyan: "#06b6d4",
        white: "#fafaf9",
        brightBlack: "#57534e",
        brightRed: "#f87171",
        brightGreen: "#4ade80",
        brightYellow: "#facc15",
        brightBlue: "#60a5fa",
        brightMagenta: "#c084fc",
        brightCyan: "#22d3ee",
        brightWhite: "#ffffff",
      },
      allowProposedApi: true,
    });

    // Create fit addon
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    // Open terminal in container
    terminal.open(containerRef.current);

    // Small delay to ensure container is properly rendered before fitting
    requestAnimationFrame(() => {
      fitAddon.fit();
      callbacksRef.current.onResize?.(terminal.rows, terminal.cols);
    });

    // Store references
    internalTermRef.current = terminal;
    fitAddonRef.current = fitAddon;
    if (terminalRef) {
      terminalRef.current = terminal;
    }

    // Handle input
    const inputDisposable = terminal.onData((data) => {
      callbacksRef.current.onInput?.(data);
    });

    // Handle resize
    const handleResize = () => {
      if (fitAddonRef.current && containerRef.current) {
        fitAddonRef.current.fit();
        if (internalTermRef.current) {
          callbacksRef.current.onResize?.(
            internalTermRef.current.rows,
            internalTermRef.current.cols
          );
        }
      }
    };

    // Listen for window resize
    window.addEventListener("resize", handleResize);

    // Create ResizeObserver for container resize
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      inputDisposable.dispose();
      terminal.dispose();
    };
  }, [terminalRef]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-stone-900"
      style={{ minHeight: "400px", padding: "8px" }}
    />
  );
}

/**
 * Hook to get terminal control methods.
 */
export function useTerminalWriter() {
  const terminalRef = useRef<Terminal | null>(null);

  const write = useCallback((data: string) => {
    terminalRef.current?.write(data);
  }, []);

  const writeln = useCallback((data: string) => {
    terminalRef.current?.writeln(data);
  }, []);

  const clear = useCallback(() => {
    terminalRef.current?.clear();
  }, []);

  const focus = useCallback(() => {
    terminalRef.current?.focus();
  }, []);

  return { terminalRef, write, writeln, clear, focus };
}
