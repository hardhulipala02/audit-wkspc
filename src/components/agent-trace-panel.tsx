"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  ClipboardList,
  FileEdit,
  Loader2,
  Wrench,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  mockContractMeta,
  mockRedlines,
  type AgentStep,
  type AgentStepStatus,
  type AgentStepType,
  type RedlineSeverity,
  type RedlineStatus,
} from "@/data/mockAudit";
import { cn } from "@/lib/utils";

const statusIcon: Record<AgentStepStatus, LucideIcon> = {
  success: CheckCircle2,
  completed: CheckCircle2,
  error: XCircle,
  running: Loader2,
  pending: Circle,
};

const statusDotClass: Record<AgentStepStatus, string> = {
  success: "border-emerald-500 bg-emerald-500 text-white",
  completed: "border-emerald-500 bg-emerald-500 text-white",
  error: "border-red-500 bg-red-500 text-white",
  running: "border-blue-500 bg-blue-500 text-white",
  pending: "border-border bg-background text-muted-foreground",
};

const statusPingClass: Record<AgentStepStatus, string> = {
  success: "bg-emerald-500",
  completed: "bg-emerald-500",
  error: "bg-red-500",
  running: "bg-blue-500",
  pending: "bg-border",
};

const typeMeta: Record<AgentStepType, { icon: LucideIcon; label: string }> = {
  tool_call: { icon: Wrench, label: "Tool call" },
  reasoning: { icon: Brain, label: "Reasoning" },
  redline_proposal: { icon: FileEdit, label: "Redline" },
  summary: { icon: ClipboardList, label: "Summary" },
};

function confidenceToneClass(confidence: number) {
  if (confidence >= 0.85) {
    return "border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300";
  }
  if (confidence >= 0.6) {
    return "border-amber-300 bg-amber-100 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300";
  }
  return "border-red-300 bg-red-100 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300";
}

function confidenceBarClass(confidence: number) {
  if (confidence >= 0.85) return "bg-emerald-500";
  if (confidence >= 0.6) return "bg-amber-500";
  return "bg-red-500";
}

const severityBadgeClass: Record<RedlineSeverity, string> = {
  critical:
    "border-red-300 bg-red-100 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
  high: "border-orange-300 bg-orange-100 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300",
  medium:
    "border-amber-300 bg-amber-100 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  low: "border-blue-300 bg-blue-100 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
};

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function ParamRow({ name, value }: { name: string; value: unknown }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1 text-xs">
      <span className="shrink-0 font-mono text-muted-foreground">{name}</span>
      <span className="break-all text-right font-mono text-foreground/80">
        {typeof value === "string" ? value : JSON.stringify(value)}
      </span>
    </div>
  );
}

function ToolCallDetail({ toolCall }: { toolCall: NonNullable<AgentStep["toolCall"]> }) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-muted/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <code className="text-xs font-semibold text-foreground">
          {toolCall.toolName}
        </code>
        <Badge
          variant="outline"
          className={cn(
            "gap-1",
            toolCall.status === "success"
              ? "border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
              : "border-red-300 bg-red-100 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          )}
        >
          {toolCall.status}
        </Badge>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {toolCall.description}
      </p>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>
          Server <span className="font-mono text-foreground/80">{toolCall.server}</span>
        </span>
        <span>
          Latency{" "}
          <span className="font-mono text-foreground/80">{toolCall.latencyMs}ms</span>
        </span>
        <span>
          {formatTimestamp(toolCall.startedAt)} → {formatTimestamp(toolCall.completedAt)}
        </span>
      </div>

      <div>
        <div className="mb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          Parameters
        </div>
        <div className="divide-y divide-border rounded-sm border border-border bg-background px-2">
          {Object.entries(toolCall.arguments).map(([name, value]) => (
            <ParamRow key={name} name={name} value={value} />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          Result
        </div>
        <pre className="max-h-40 overflow-auto rounded-sm border border-border bg-background p-2 text-[11px] leading-relaxed text-foreground/80">
          {JSON.stringify(toolCall.result, null, 2)}
        </pre>
      </div>
    </div>
  );
}

function RedlineActionCard({
  redlineId,
  status,
  onApprove,
  onReject,
}: {
  redlineId: string;
  status: RedlineStatus;
  onApprove: (redlineId: string) => void;
  onReject: (redlineId: string) => void;
}) {
  const redline = mockRedlines.find((r) => r.id === redlineId);
  if (!redline) return null;

  const isApproved = status === "accepted";
  const isRejected = status === "rejected";
  const isResolved = isApproved || isRejected;

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-foreground">
          {redline.clauseSection} {redline.clauseTitle}
        </span>
        <Badge
          variant="outline"
          className={cn("shrink-0", severityBadgeClass[redline.severity])}
        >
          {redline.severity}
        </Badge>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {redline.rationale}
      </p>
      <div className="flex justify-end gap-2">
        <Button
          size="xs"
          variant={isRejected ? "secondary" : "outline"}
          disabled={isResolved}
          onClick={() => onReject(redline.id)}
        >
          {isRejected ? (
            <>
              <X className="size-3" />
              Rejected
            </>
          ) : (
            "Reject"
          )}
        </Button>
        <Button
          size="xs"
          variant={isApproved ? "secondary" : "outline"}
          disabled={isResolved}
          onClick={() => onApprove(redline.id)}
        >
          {isApproved ? (
            <>
              <Check className="size-3" />
              Approved
            </>
          ) : (
            "Approve Redline"
          )}
        </Button>
      </div>
    </div>
  );
}

function AgentStepCard({
  step,
  isLast,
  isActive,
  redlineStatuses,
  onApproveRedline,
  onRejectRedline,
}: {
  step: AgentStep;
  isLast: boolean;
  isActive: boolean;
  redlineStatuses: Record<string, RedlineStatus>;
  onApproveRedline: (redlineId: string) => void;
  onRejectRedline: (redlineId: string) => void;
}) {
  const StatusIcon = statusIcon[step.status];
  const TypeIcon = typeMeta[step.type].icon;

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "relative flex size-6 shrink-0 items-center justify-center rounded-full border-2",
            statusDotClass[step.status]
          )}
        >
          {isActive && (
            <span
              className={cn(
                "absolute inset-0 animate-ping rounded-full opacity-60",
                statusPingClass[step.status]
              )}
            />
          )}
          <StatusIcon
            className={cn(
              "relative size-3.5",
              step.status === "running" && "animate-spin"
            )}
          />
        </span>
        {!isLast && <span className="w-px flex-1 bg-border" />}
      </div>

      <Collapsible
        defaultOpen={step.status === "error"}
        className="min-w-0 flex-1 pb-5"
      >
        <CollapsibleTrigger className="group flex w-full items-start justify-between gap-2 rounded-md text-left">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <TypeIcon className="size-3" />
              {typeMeta[step.type].label}
              <span className="text-border">·</span>
              <span>{formatTimestamp(step.timestamp)}</span>
            </div>
            <span className="truncate text-sm font-medium text-foreground">
              {step.index}. {step.title}
            </span>
          </div>
          <ChevronDown className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-data-[panel-open]:rotate-180" />
        </CollapsibleTrigger>

        <CollapsibleContent className="flex flex-col gap-3 overflow-hidden pt-2">
          {step.thought && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {step.thought}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn("gap-1", confidenceToneClass(step.confidence))}
            >
              Confidence {Math.round(step.confidence * 100)}%
            </Badge>
            <Badge variant="outline">{step.durationMs}ms</Badge>
            {step.redlineIds && (
              <Badge variant="outline">
                {step.redlineIds.length} redline
                {step.redlineIds.length === 1 ? "" : "s"}
              </Badge>
            )}
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full",
                confidenceBarClass(step.confidence)
              )}
              style={{ width: `${Math.round(step.confidence * 100)}%` }}
            />
          </div>

          {step.toolCall && <ToolCallDetail toolCall={step.toolCall} />}

          {step.type === "redline_proposal" && step.redlineIds && (
            <div className="flex flex-col gap-2">
              {step.redlineIds.map((redlineId) => (
                <RedlineActionCard
                  key={redlineId}
                  redlineId={redlineId}
                  status={redlineStatuses[redlineId]}
                  onApprove={onApproveRedline}
                  onReject={onRejectRedline}
                />
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

interface AgentTracePanelProps {
  steps: AgentStep[];
  currentStepIndex: number;
  isStreaming: boolean;
  redlineStatuses: Record<string, RedlineStatus>;
  onApproveRedline: (redlineId: string) => void;
  onRejectRedline: (redlineId: string) => void;
}

export function AgentTracePanel({
  steps,
  currentStepIndex,
  isStreaming,
  redlineStatuses,
  onApproveRedline,
  onRejectRedline,
}: AgentTracePanelProps) {
  const visibleSteps = steps.slice(0, currentStepIndex + 1);

  return (
    <Card className="h-full gap-0 rounded-none border-0 py-0 ring-0">
      <CardHeader className="border-b border-border py-4">
        <CardTitle>Agent Execution Trace</CardTitle>
        <CardDescription>
          {mockContractMeta.reviewer} · {visibleSteps.length}/{steps.length}{" "}
          steps
          {isStreaming && <span className="ml-1">· streaming…</span>}
        </CardDescription>
      </CardHeader>
      <div className="min-h-0 flex-1">
        <ScrollArea className="h-full">
          <div className="px-6 py-5">
            {visibleSteps.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Run the execution trace to see agent activity.
              </p>
            )}
            <AnimatePresence initial={false}>
              {visibleSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  <AgentStepCard
                    step={step}
                    isLast={index === visibleSteps.length - 1}
                    isActive={isStreaming && index === visibleSteps.length - 1}
                    redlineStatuses={redlineStatuses}
                    onApproveRedline={onApproveRedline}
                    onRejectRedline={onRejectRedline}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
}
