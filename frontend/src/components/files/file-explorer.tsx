/**
 * File explorer component for browsing task files.
 */

"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Folder,
  File,
  FileText,
  FileJson,
  FileImage,
  ChevronRight,
  ChevronLeft,
  Loader2,
  X,
} from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { tasksApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { MarkdownViewer } from "./markdown-viewer";
import type { FileInfo, FileContentResponse } from "@/types";

interface FileExplorerProps {
  taskId: string;
  initialFile?: string;
  onClose?: () => void;
}

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".bmp", ".ico"]);

function isImageFile(extension: string): boolean {
  return IMAGE_EXTENSIONS.has(extension.toLowerCase());
}

function getFileIcon(file: FileInfo) {
  if (file.type === "directory") {
    return <Folder className="h-5 w-5 text-amber-500" />;
  }

  if (isImageFile(file.extension)) {
    return <FileImage className="h-5 w-5 text-purple-500" />;
  }

  switch (file.extension) {
    case ".md":
      return <FileText className="h-5 w-5 text-blue-500" />;
    case ".json":
      return <FileJson className="h-5 w-5 text-green-500" />;
    default:
      return <File className="h-5 w-5 text-stone-400" />;
  }
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FileExplorer({ taskId, initialFile, onClose }: FileExplorerProps) {
  const [currentPath, setCurrentPath] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(initialFile || null);

  // Update selectedFile when initialFile changes
  useEffect(() => {
    if (initialFile) {
      setSelectedFile(initialFile);
    }
  }, [initialFile]);

  // Fetch file list
  const {
    data: filesData,
    isLoading: filesLoading,
    error: filesError,
  } = useQuery({
    queryKey: ["task-files", taskId, currentPath],
    queryFn: () => tasksApi.listFiles(taskId, currentPath || undefined),
  });

  const selectedIsImage = selectedFile ? isImageFile(selectedFile.split(".").pop() ? `.${selectedFile.split(".").pop()}` : "") : false;

  // Fetch file content when a non-image file is selected
  const {
    data: fileContent,
    isLoading: contentLoading,
    error: contentError,
  } = useQuery({
    queryKey: ["task-file-content", taskId, selectedFile],
    queryFn: () => tasksApi.readFile(taskId, selectedFile!),
    enabled: !!selectedFile && !selectedIsImage,
  });

  const handleFileClick = (file: FileInfo) => {
    if (file.type === "directory") {
      setCurrentPath(file.path);
      setSelectedFile(null);
    } else {
      setSelectedFile(file.path);
    }
  };

  const handleBack = () => {
    if (selectedFile) {
      setSelectedFile(null);
    } else if (currentPath) {
      const parts = currentPath.split("/");
      parts.pop();
      setCurrentPath(parts.join("/"));
    }
  };

  const pathParts = currentPath ? currentPath.split("/") : [];

  // Render image viewer
  if (selectedFile && selectedIsImage) {
    const fileName = selectedFile.split("/").pop() || selectedFile;
    const imageUrl = tasksApi.rawFileUrl(taskId, selectedFile);

    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium text-stone-900 dark:text-stone-100">{fileName}</span>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Image */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-stone-100 dark:bg-stone-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={fileName}
            className="max-w-full max-h-full object-contain rounded"
          />
        </div>
      </div>
    );
  }

  // Render file content viewer
  if (selectedFile && fileContent) {
    const content = fileContent as FileContentResponse;
    const isMarkdown = content.extension === ".md";
    const isJson = content.extension === ".json";

    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium text-stone-900 dark:text-stone-100">{content.name}</span>
            <span className="text-sm text-stone-500 dark:text-stone-400">
              ({formatBytes(content.size)})
            </span>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {contentLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-stone-400 dark:text-stone-500" />
            </div>
          ) : isMarkdown ? (
            <MarkdownViewer content={content.content} />
          ) : isJson ? (
            <pre className="bg-stone-900 text-stone-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
              {JSON.stringify(JSON.parse(content.content), null, 2)}
            </pre>
          ) : (
            <pre className="bg-stone-50 dark:bg-stone-800 p-4 rounded-lg overflow-x-auto text-sm font-mono text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700">
              {content.content}
            </pre>
          )}
        </div>
      </div>
    );
  }

  // Render file list
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
        <div className="flex items-center gap-2">
          {currentPath && (
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <nav className="flex items-center gap-1 text-sm">
            <button
              onClick={() => {
                setCurrentPath("");
                setSelectedFile(null);
              }}
              className="text-amber-700 dark:text-amber-400 hover:underline"
            >
              root
            </button>
            {pathParts.map((part, i) => (
              <span key={i} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3 text-stone-400 dark:text-stone-500" />
                <button
                  onClick={() => {
                    setCurrentPath(pathParts.slice(0, i + 1).join("/"));
                    setSelectedFile(null);
                  }}
                  className="text-amber-700 dark:text-amber-400 hover:underline"
                >
                  {part}
                </button>
              </span>
            ))}
          </nav>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* File list */}
      <div className="flex-1 overflow-auto">
        {filesLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-stone-400 dark:text-stone-500" />
          </div>
        ) : filesError ? (
          <div className="p-4 text-center text-red-600 dark:text-red-400">
            Error loading files
          </div>
        ) : !filesData?.files?.length ? (
          <div className="p-8 text-center text-stone-500 dark:text-stone-400">
            No files in this directory
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-700">
            {filesData.files.map((file: FileInfo) => (
              <button
                key={file.path}
                onClick={() => handleFileClick(file)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left",
                  file.type === "directory" && "font-medium"
                )}
              >
                {getFileIcon(file)}
                <div className="flex-1 min-w-0">
                  <div className="truncate text-stone-900 dark:text-stone-100">{file.name}</div>
                  {file.type === "file" && (
                    <div className="text-xs text-stone-500 dark:text-stone-400">
                      {formatBytes(file.size)} - {formatDate(file.modified)}
                    </div>
                  )}
                </div>
                {file.type === "directory" && (
                  <ChevronRight className="h-4 w-4 text-stone-400 dark:text-stone-500" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
