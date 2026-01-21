/**
 * Workflow logs viewer component.
 */

"use client";

import { useRef, useEffect, useState } from "react";
import { Loader2, Trash2, ArrowDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkflowLogs, useClearLogs } from "@/hooks";

interface LogsViewerProps {
  lines?: number;
}

export function LogsViewer({ lines = 200 }: LogsViewerProps) {
  const { data, isLoading, error, dataUpdatedAt, refetch, isFetching } = useWorkflowLogs(lines);
  const clearLogs = useClearLogs();
  const scrollRef = useRef<HTMLPreElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data?.logs, autoScroll]);

  const handleClearLogs = () => {
    if (confirm("Clear all workflow logs?")) {
      clearLogs.mutate();
    }
  };

  const handleScrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setAutoScroll(true);
    }
  };

  // Detect manual scroll to disable auto-scroll
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setAutoScroll(isAtBottom);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500 dark:text-red-400">
        Error loading logs
      </div>
    );
  }

  const logs = data?.logs || "";
  const hasLogs = logs.trim().length > 0;
  const lastUpdated = new Date(dataUpdatedAt).toLocaleTimeString();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
        <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
          <span>Last updated: {lastUpdated}</span>
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Auto-refreshing every 5s" />
        </div>
        <div className="flex items-center gap-2">
          {!autoScroll && (
            <Button variant="ghost" size="sm" onClick={handleScrollToBottom}>
              <ArrowDown className="h-4 w-4 mr-1" />
              Scroll to bottom
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearLogs}
            disabled={clearLogs.isPending || !hasLogs}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Logs Content */}
      {hasLogs ? (
        <pre
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 overflow-auto p-4 bg-stone-900 text-stone-100 text-sm font-mono whitespace-pre-wrap break-words"
        >
          {logs}
        </pre>
      ) : (
        <div className="flex-1 flex items-center justify-center text-stone-500 dark:text-stone-400">
          No logs available. Start a workflow to see logs here.
        </div>
      )}
    </div>
  );
}
