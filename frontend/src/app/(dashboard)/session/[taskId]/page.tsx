/**
 * Interactive terminal session page for a task.
 */

"use client";

import { use, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Square, Loader2, Terminal, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { XTerminal, useTerminalWriter } from "@/components/session";
import { useTerminalSession, useTaskDetail } from "@/hooks";

interface PageProps {
  params: Promise<{ taskId: string }>;
}

export default function SessionPage({ params }: PageProps) {
  const { taskId } = use(params);
  const { data: task, isLoading: taskLoading } = useTaskDetail(taskId);
  const { terminalRef, write, focus } = useTerminalWriter();
  const connectedRef = useRef(false);

  const handleOutput = useCallback(
    (data: string) => {
      write(data);
    },
    [write]
  );

  const handleReady = useCallback(() => {
    write("\r\n\x1b[32mSession started. Interact with Claude below.\x1b[0m\r\n\r\n");
    focus();
  }, [write, focus]);

  const handleExit = useCallback(
    (code: number) => {
      write(`\r\n\x1b[33mSession ended with code ${code}\x1b[0m\r\n`);
    },
    [write]
  );

  const handleError = useCallback(
    (message: string) => {
      write(`\r\n\x1b[31mError: ${message}\x1b[0m\r\n`);
    },
    [write]
  );

  const { status, connect, disconnect, sendInput, sendResize, stop } =
    useTerminalSession({
      taskId,
      onOutput: handleOutput,
      onReady: handleReady,
      onExit: handleExit,
      onError: handleError,
    });

  // Start session when component mounts - use ref to avoid cleanup race condition
  useEffect(() => {
    if (!connectedRef.current) {
      connectedRef.current = true;
      connect();
    }

    // Cleanup only on actual unmount
    return () => {
      if (connectedRef.current) {
        disconnect();
        connectedRef.current = false;
      }
    };
  }, [connect, disconnect]);

  const handleStop = () => {
    stop();
  };

  const handleInput = useCallback(
    (data: string) => {
      sendInput(data);
    },
    [sendInput]
  );

  const handleResize = useCallback(
    (rows: number, cols: number) => {
      sendResize(rows, cols);
    },
    [sendResize]
  );

  const getStatusVariant = () => {
    switch (status) {
      case "connected":
        return "success";
      case "connecting":
        return "warning";
      case "error":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "error":
        return "Error";
      default:
        return "Disconnected";
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/kanban"
            className="inline-flex items-center justify-center h-8 px-3 text-xs rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-900 dark:text-stone-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-green-600" />
              <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                Interactive Session
              </h1>
            </div>
            {task && (
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                {task.name}
                {task.source_url && (
                  <a
                    href={task.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Ticket
                  </a>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Connection status */}
          <Badge variant={getStatusVariant()}>
            {status === "connecting" && (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            )}
            {getStatusLabel()}
          </Badge>

          {/* Stop button */}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleStop}
            disabled={status !== "connected"}
          >
            <Square className="h-4 w-4 mr-2" />
            Stop Session
          </Button>
        </div>
      </div>

      {/* Terminal Card - fills remaining space */}
      <Card className="flex flex-col flex-1 min-h-0">
        <CardHeader className="py-2 px-4 shrink-0 border-b border-stone-200 dark:border-stone-700">
          <CardTitle className="text-sm font-medium flex items-center gap-2 font-mono">
            <span className="text-green-600">$</span>
            <span className="text-stone-500 dark:text-stone-400">
              claude --dangerously-skip-permissions /atw:load {taskId}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden min-h-0">
          {taskLoading ? (
            <div className="flex items-center justify-center h-full bg-stone-900">
              <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
            </div>
          ) : (
            <XTerminal
              terminalRef={terminalRef}
              onInput={handleInput}
              onResize={handleResize}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
