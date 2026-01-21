/**
 * Sync output display component.
 */

"use client";

import { CheckCircle, XCircle, Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SyncOutputProps {
  output: string | null;
  isSuccess: boolean | null;
  title?: string;
}

export function SyncOutput({ output, isSuccess, title = "Output" }: SyncOutputProps) {
  if (!output) {
    return null;
  }

  return (
    <Card className={isSuccess === false ? "border-red-200" : isSuccess === true ? "border-green-200" : ""}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {isSuccess === true && <CheckCircle className="h-5 w-5 text-green-600" />}
          {isSuccess === false && <XCircle className="h-5 w-5 text-red-600" />}
          {isSuccess === null && <Terminal className="h-5 w-5 text-stone-500" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-stone-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap">
          {output}
        </pre>
      </CardContent>
    </Card>
  );
}
