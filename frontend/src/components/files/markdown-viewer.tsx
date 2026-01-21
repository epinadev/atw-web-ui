/**
 * Markdown viewer component with GitHub Flavored Markdown support.
 */

"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  return (
    <div className={cn("prose prose-stone dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom styling for markdown elements
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-700 pb-2 mb-4">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-200 border-b border-stone-100 dark:border-stone-700 pb-1 mb-3 mt-6">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-200 mb-2 mt-4">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-stone-700 dark:text-stone-300 mb-3 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-stone-700 dark:text-stone-300">{children}</li>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-stone-100 dark:bg-stone-700 px-1.5 py-0.5 rounded text-sm font-mono text-stone-800 dark:text-stone-200">
                  {children}
                </code>
              );
            }
            return (
              <code className={className}>{children}</code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-stone-900 text-stone-100 p-4 rounded-lg overflow-x-auto mb-4 text-sm">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-stone-300 dark:border-stone-600 pl-4 italic text-stone-600 dark:text-stone-400 my-4">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 underline"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-stone-200 dark:border-stone-700 rounded">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-stone-100 dark:bg-stone-800 px-4 py-2 text-left text-sm font-semibold text-stone-800 dark:text-stone-200 border-b border-stone-200 dark:border-stone-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-sm text-stone-700 dark:text-stone-300 border-b border-stone-100 dark:border-stone-700">
              {children}
            </td>
          ),
          hr: () => <hr className="my-6 border-stone-200 dark:border-stone-700" />,
          // Task list items (GFM)
          input: ({ type, checked }) => {
            if (type === "checkbox") {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="mr-2 rounded border-stone-300 dark:border-stone-600"
                />
              );
            }
            return <input type={type} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
