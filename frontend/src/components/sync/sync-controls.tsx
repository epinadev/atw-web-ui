/**
 * Sync controls component.
 */

"use client";

import { useState } from "react";
import { RefreshCw, Upload, Download, Eye, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SyncControlsProps {
  onSyncData: (options: { dry_run?: boolean; to_remote?: boolean; from_remote?: boolean }) => void;
  onSyncTasks: () => void;
  isSyncingData: boolean;
  isSyncingTasks: boolean;
}

export function SyncControls({
  onSyncData,
  onSyncTasks,
  isSyncingData,
  isSyncingTasks,
}: SyncControlsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Data Sync */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Data Sync
          </CardTitle>
          <CardDescription>
            Synchronize local data folder with remote storage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => onSyncData({ dry_run: true })}
            disabled={isSyncingData}
          >
            <Eye className="h-4 w-4 mr-2" />
            Dry Run (Preview)
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => onSyncData({})}
            disabled={isSyncingData}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncingData ? "animate-spin" : ""}`} />
            {isSyncingData ? "Syncing..." : "Sync All (Bidirectional)"}
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onSyncData({ to_remote: true })}
              disabled={isSyncingData}
            >
              <Upload className="h-4 w-4 mr-2" />
              Push Only
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onSyncData({ from_remote: true })}
              disabled={isSyncingData}
            >
              <Download className="h-4 w-4 mr-2" />
              Pull Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Sync */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5" />
            Tasks Sync
          </CardTitle>
          <CardDescription>
            Import tasks from Odoo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            onClick={onSyncTasks}
            disabled={isSyncingTasks}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncingTasks ? "animate-spin" : ""}`} />
            {isSyncingTasks ? "Syncing Tasks..." : "Sync Tasks from Odoo"}
          </Button>

          <p className="text-xs text-stone-500 mt-3">
            This will fetch new tasks from Odoo and update existing ones.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
