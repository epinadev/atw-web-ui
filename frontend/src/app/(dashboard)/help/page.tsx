/**
 * Help page - Documents all actions and their ATW CLI commands.
 */

"use client";

import {
  Check,
  RotateCcw,
  Flag,
  Play,
  Square,
  CheckCircle2,
  Unlock,
  Sparkles,
  Gauge,
  Tag,
  Trash2,
  RefreshCw,
  Cpu,
  Database,
  Terminal,
  ArrowRight,
  Circle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CommandRowProps {
  icon: React.ReactNode;
  action: string;
  command: string;
  description: string;
  available?: string;
}

function CommandRow({ icon, action, command, description, available }: CommandRowProps) {
  return (
    <tr className="border-b border-stone-100 dark:border-stone-700">
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2">
          <span className="text-stone-500 dark:text-stone-400">{icon}</span>
          <span className="font-medium text-stone-900 dark:text-stone-100">{action}</span>
        </div>
      </td>
      <td className="py-3 pr-4">
        <code className="px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded text-sm font-mono text-amber-700 dark:text-amber-400">
          {command}
        </code>
      </td>
      <td className="py-3 pr-4 text-sm text-stone-600 dark:text-stone-400">{description}</td>
      {available && (
        <td className="py-3 text-xs text-stone-500 dark:text-stone-500">{available}</td>
      )}
    </tr>
  );
}

interface StatusBadgeProps {
  status: string;
  icon: string;
  color: string;
}

function StatusBadge({ status, icon, color }: StatusBadgeProps) {
  const colorClasses: Record<string, string> = {
    gray: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
    cyan: "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300",
    blue: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
    purple: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300",
    red: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300",
    yellow: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300",
    amber: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
    teal: "bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300",
    green: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300",
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colorClasses[color]}`}>
      <span>{icon}</span>
      {status}
    </span>
  );
}

export default function HelpPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Help & Reference</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          UI actions and their corresponding ATW CLI commands
        </p>
      </div>

      {/* Task State Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Terminal className="h-5 w-5" />
            Task State Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-700 text-left text-sm text-stone-500 dark:text-stone-400">
                  <th className="pb-2 font-medium">Action</th>
                  <th className="pb-2 font-medium">ATW Command</th>
                  <th className="pb-2 font-medium">Description</th>
                  <th className="pb-2 font-medium">Available When</th>
                </tr>
              </thead>
              <tbody>
                <CommandRow
                  icon={<Check className="h-4 w-4" />}
                  action="Approve"
                  command="atw tasks approve {task_id}"
                  description="Sets task from APPROVE → READY. Task moves to queue."
                  available="status = approve | blocked"
                />
                <CommandRow
                  icon={<Unlock className="h-4 w-4" />}
                  action="Unblock"
                  command="atw workflow unblock {task_id}"
                  description="Removes blockers and sets task to READY."
                  available="status = blocked"
                />
                <CommandRow
                  icon={<Flag className="h-4 w-4" />}
                  action="Finish (to Conclude)"
                  command="atw tasks finish {task_id}"
                  description="Sets task to CONCLUDE. Executor will run cleanup workflow."
                  available="status = review"
                />
                <CommandRow
                  icon={<RotateCcw className="h-4 w-4" />}
                  action="Reset (to Redo)"
                  command="atw tasks reset {task_id}"
                  description="Sets task to REDO. Returns to planning for rework."
                  available="Always"
                />
                <CommandRow
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  action="Mark Done"
                  command="atw workflow done {task_id}"
                  description="Immediately marks task as DONE. Skips cleanup workflow."
                  available="Always"
                />
                <CommandRow
                  icon={<Square className="h-4 w-4" />}
                  action="Stop"
                  command="atw workflow executor stop-task {task_id}"
                  description="Stops a running task execution."
                  available="status = running"
                />
                <CommandRow
                  icon={<Trash2 className="h-4 w-4 text-red-500" />}
                  action="Delete Task"
                  command="atw task {task_id} --delete --skip-deletion-confirmation"
                  description="Permanently deletes the task and its data."
                  available="Always"
                />
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Play className="h-5 w-5" />
            Workflow Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-700 text-left text-sm text-stone-500 dark:text-stone-400">
                  <th className="pb-2 font-medium">Action</th>
                  <th className="pb-2 font-medium">ATW Command</th>
                  <th className="pb-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                <CommandRow
                  icon={<Play className="h-4 w-4" />}
                  action="Run Workflow"
                  command="atw workflow run {task_id}"
                  description="Queues task for workflow execution by the executor."
                />
                <CommandRow
                  icon={<Play className="h-4 w-4" />}
                  action="Run Workflow (Restart)"
                  command="atw workflow run {task_id} --restart"
                  description="Restarts workflow from the beginning, clearing progress."
                />
                <CommandRow
                  icon={<Sparkles className="h-4 w-4" />}
                  action="AI Categorize"
                  command="atw categorize {task_id}"
                  description="Uses AI to analyze task and set type, priority, and tags."
                />
                <CommandRow
                  icon={<Square className="h-4 w-4" />}
                  action="Stop Workflow"
                  command="atw workflow stop {task_id}"
                  description="Stops workflow execution for a task."
                />
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Settings Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gauge className="h-5 w-5" />
            Settings Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-700 text-left text-sm text-stone-500 dark:text-stone-400">
                  <th className="pb-2 font-medium">Action</th>
                  <th className="pb-2 font-medium">ATW Command</th>
                  <th className="pb-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                <CommandRow
                  icon={<Gauge className="h-4 w-4" />}
                  action="Set Priority"
                  command="atw tasks priority {task_id} {priority}"
                  description="Sets task priority (10=Urgent, 50=High, 100=Normal, 120=Low, 150=Backlog)."
                />
                <CommandRow
                  icon={<Tag className="h-4 w-4" />}
                  action="Set Type"
                  command="atw tasks set-type {task_id} {type}"
                  description="Sets workflow type (estimation, feature-fix, investigation, code-review, etc.)."
                />
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Executor Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Cpu className="h-5 w-5" />
            Executor Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-700 text-left text-sm text-stone-500 dark:text-stone-400">
                  <th className="pb-2 font-medium">Action</th>
                  <th className="pb-2 font-medium">ATW Command</th>
                  <th className="pb-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                <CommandRow
                  icon={<Play className="h-4 w-4" />}
                  action="Start Executor"
                  command="atw workflow executor start"
                  description="Starts the background executor that processes queued tasks."
                />
                <CommandRow
                  icon={<RefreshCw className="h-4 w-4" />}
                  action="Executor Status"
                  command="atw workflow executor status --json"
                  description="Gets current executor status, running tasks, and statistics."
                />
                <CommandRow
                  icon={<Database className="h-4 w-4" />}
                  action="View Queue"
                  command="atw workflow queue --json"
                  description="Lists all tasks in the workflow queue (READY and CONCLUDE)."
                />
                <CommandRow
                  icon={<Trash2 className="h-4 w-4" />}
                  action="Clear Queue"
                  command="atw workflow queue clear"
                  description="Removes all tasks from the workflow queue."
                />
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Sync Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <RefreshCw className="h-5 w-5" />
            Sync Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-700 text-left text-sm text-stone-500 dark:text-stone-400">
                  <th className="pb-2 font-medium">Action</th>
                  <th className="pb-2 font-medium">ATW Command</th>
                  <th className="pb-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                <CommandRow
                  icon={<Database className="h-4 w-4" />}
                  action="Sync Tasks"
                  command="atw sync tasks"
                  description="Fetches latest tasks from Odoo and updates local database."
                />
                <CommandRow
                  icon={<RefreshCw className="h-4 w-4" />}
                  action="Sync Data (Dry Run)"
                  command="atw sync data --dry-run"
                  description="Shows what would be synced without making changes."
                />
                <CommandRow
                  icon={<RefreshCw className="h-4 w-4" />}
                  action="Sync Data (To Remote)"
                  command="atw sync data --to-remote"
                  description="Pushes local data folder changes to remote storage."
                />
                <CommandRow
                  icon={<RefreshCw className="h-4 w-4" />}
                  action="Sync Data (From Remote)"
                  command="atw sync data --from-remote"
                  description="Pulls remote data folder changes to local."
                />
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Task Status Lifecycle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Circle className="h-5 w-5" />
            Task Status Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status badges */}
          <div>
            <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">All Statuses</h3>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="new" icon="○" color="gray" />
              <StatusBadge status="ready" icon="◎" color="cyan" />
              <StatusBadge status="running" icon="▶" color="blue" />
              <StatusBadge status="approve" icon="?" color="purple" />
              <StatusBadge status="blocked" icon="!" color="red" />
              <StatusBadge status="redo" icon="↻" color="yellow" />
              <StatusBadge status="review" icon="R" color="amber" />
              <StatusBadge status="conclude" icon="C" color="teal" />
              <StatusBadge status="done" icon="✓" color="green" />
            </div>
          </div>

          {/* Workflow States */}
          <div>
            <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">Workflow States (Kanban Columns)</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="font-medium text-purple-700 dark:text-purple-300 mb-2">Planning</h4>
                <div className="flex flex-wrap gap-1">
                  <StatusBadge status="new" icon="○" color="gray" />
                  <StatusBadge status="blocked" icon="!" color="red" />
                  <StatusBadge status="redo" icon="↻" color="yellow" />
                  <StatusBadge status="approve" icon="?" color="purple" />
                </div>
              </div>
              <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                <h4 className="font-medium text-cyan-700 dark:text-cyan-300 mb-2">Queued</h4>
                <div className="flex flex-wrap gap-1">
                  <StatusBadge status="ready" icon="◎" color="cyan" />
                  <StatusBadge status="conclude" icon="C" color="teal" />
                </div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">Running</h4>
                <div className="flex flex-wrap gap-1">
                  <StatusBadge status="running" icon="▶" color="blue" />
                </div>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <h4 className="font-medium text-amber-700 dark:text-amber-300 mb-2">Review</h4>
                <div className="flex flex-wrap gap-1">
                  <StatusBadge status="review" icon="R" color="amber" />
                </div>
              </div>
            </div>
          </div>

          {/* Flow diagram */}
          <div>
            <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">Common Transitions</h3>
            <div className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status="new" icon="○" color="gray" />
                <ArrowRight className="h-4 w-4 text-stone-400" />
                <span className="text-xs">(AI Categorize)</span>
                <ArrowRight className="h-4 w-4 text-stone-400" />
                <StatusBadge status="approve" icon="?" color="purple" />
                <ArrowRight className="h-4 w-4 text-stone-400" />
                <span className="text-xs">(Approve)</span>
                <ArrowRight className="h-4 w-4 text-stone-400" />
                <StatusBadge status="ready" icon="◎" color="cyan" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status="ready" icon="◎" color="cyan" />
                <ArrowRight className="h-4 w-4 text-stone-400" />
                <span className="text-xs">(Executor picks up)</span>
                <ArrowRight className="h-4 w-4 text-stone-400" />
                <StatusBadge status="running" icon="▶" color="blue" />
                <ArrowRight className="h-4 w-4 text-stone-400" />
                <span className="text-xs">(Workflow completes)</span>
                <ArrowRight className="h-4 w-4 text-stone-400" />
                <StatusBadge status="review" icon="R" color="amber" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status="review" icon="R" color="amber" />
                <ArrowRight className="h-4 w-4 text-stone-400" />
                <span className="text-xs">(Finish)</span>
                <ArrowRight className="h-4 w-4 text-stone-400" />
                <StatusBadge status="conclude" icon="C" color="teal" />
                <ArrowRight className="h-4 w-4 text-stone-400" />
                <span className="text-xs">(Cleanup workflow)</span>
                <ArrowRight className="h-4 w-4 text-stone-400" />
                <StatusBadge status="done" icon="✓" color="green" />
              </div>
              <div className="flex items-center gap-2 flex-wrap mt-4 pt-2 border-t border-stone-200 dark:border-stone-700">
                <span className="text-xs text-stone-500 dark:text-stone-500">Shortcut:</span>
                <span className="text-xs">(Mark Done)</span>
                <ArrowRight className="h-4 w-4 text-stone-400" />
                <StatusBadge status="done" icon="✓" color="green" />
                <span className="text-xs text-stone-500 dark:text-stone-500 ml-2">— skips cleanup workflow</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gauge className="h-5 w-5" />
            Priority Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">10</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Urgent</div>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">30</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Critical</div>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">50</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">High</div>
            </div>
            <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg text-center">
              <div className="text-2xl font-bold text-stone-600 dark:text-stone-400">100</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Normal</div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">120</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Low</div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-500 dark:text-gray-500">150</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Backlog</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="h-5 w-5" />
            Task Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="font-medium text-blue-700 dark:text-blue-300">estimation</div>
              <div className="text-xs text-stone-600 dark:text-stone-400 mt-1">Time/effort estimation</div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="font-medium text-green-700 dark:text-green-300">feature-fix</div>
              <div className="text-xs text-stone-600 dark:text-stone-400 mt-1">New feature or bug fix</div>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="font-medium text-orange-700 dark:text-orange-300">investigation</div>
              <div className="text-xs text-stone-600 dark:text-stone-400 mt-1">Research or debugging</div>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="font-medium text-purple-700 dark:text-purple-300">installation</div>
              <div className="text-xs text-stone-600 dark:text-stone-400 mt-1">Deploy or setup</div>
            </div>
            <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
              <div className="font-medium text-pink-700 dark:text-pink-300">code-review</div>
              <div className="text-xs text-stone-600 dark:text-stone-400 mt-1">PR review</div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="font-medium text-gray-700 dark:text-gray-300">triage</div>
              <div className="text-xs text-stone-600 dark:text-stone-400 mt-1">Quick assessment</div>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="font-medium text-red-700 dark:text-red-300">unclassified</div>
              <div className="text-xs text-stone-600 dark:text-stone-400 mt-1">Needs categorization</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
