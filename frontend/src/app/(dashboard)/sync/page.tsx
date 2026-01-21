/**
 * Sync page - data synchronization controls.
 */

"use client";

import { useState } from "react";
import { useSyncData, useSyncTasks } from "@/hooks";
import { SyncControls, SyncOutput } from "@/components/sync";

export default function SyncPage() {
  const [dataOutput, setDataOutput] = useState<string | null>(null);
  const [dataSuccess, setDataSuccess] = useState<boolean | null>(null);
  const [tasksOutput, setTasksOutput] = useState<string | null>(null);
  const [tasksSuccess, setTasksSuccess] = useState<boolean | null>(null);

  const syncData = useSyncData();
  const syncTasks = useSyncTasks();

  const handleSyncData = (options: { dry_run?: boolean; to_remote?: boolean; from_remote?: boolean }) => {
    setDataOutput(null);
    setDataSuccess(null);

    syncData.mutate(options, {
      onSuccess: (data: any) => {
        setDataOutput(data.output || "Sync completed successfully.");
        setDataSuccess(true);
      },
      onError: (error: any) => {
        setDataOutput(error.message || "Sync failed.");
        setDataSuccess(false);
      },
    });
  };

  const handleSyncTasks = () => {
    setTasksOutput(null);
    setTasksSuccess(null);

    syncTasks.mutate(undefined, {
      onSuccess: (data: any) => {
        setTasksOutput(data.output || "Tasks synced successfully.");
        setTasksSuccess(true);
      },
      onError: (error: any) => {
        setTasksOutput(error.message || "Task sync failed.");
        setTasksSuccess(false);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Sync</h1>
        <p className="text-sm text-stone-500">
          Synchronize data and tasks with remote systems
        </p>
      </div>

      {/* Controls */}
      <SyncControls
        onSyncData={handleSyncData}
        onSyncTasks={handleSyncTasks}
        isSyncingData={syncData.isPending}
        isSyncingTasks={syncTasks.isPending}
      />

      {/* Output */}
      <div className="space-y-4">
        {dataOutput && (
          <SyncOutput
            output={dataOutput}
            isSuccess={dataSuccess}
            title="Data Sync Output"
          />
        )}

        {tasksOutput && (
          <SyncOutput
            output={tasksOutput}
            isSuccess={tasksSuccess}
            title="Tasks Sync Output"
          />
        )}
      </div>
    </div>
  );
}
