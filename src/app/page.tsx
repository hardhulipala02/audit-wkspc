"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { AgentTracePanel } from "@/components/agent-trace-panel";
import { DocumentViewer } from "@/components/document-viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  failedAgentSteps,
  successfulAgentSteps,
  mockRedlines,
  type AgentStep,
  type RedlineStatus,
} from "@/data/mockAudit";
import { cn } from "@/lib/utils";

const STREAM_INTERVAL_MS = 800;

type RunScenario = "failed" | "successful";

const SCENARIO_STEPS: Record<RunScenario, AgentStep[]> = {
  failed: failedAgentSteps,
  successful: successfulAgentSteps,
};

const SCENARIO_OPTIONS: { value: RunScenario; label: string }[] = [
  { value: "failed", label: "Failed Run (Timeout)" },
  { value: "successful", label: "Successful Run" },
];

interface ExecutionStatus {
  label: string;
  className: string;
}

function getExecutionStatus(
  isStreaming: boolean,
  currentStepIndex: number,
  steps: AgentStep[]
): ExecutionStatus {
  if (isStreaming) {
    return { label: "Running", className: "border-border bg-muted text-foreground" };
  }
  if (currentStepIndex < 0) {
    return { label: "Idle", className: "border-border text-muted-foreground" };
  }

  const hasError = steps
    .slice(0, currentStepIndex + 1)
    .some((step) => step.status === "error");

  return hasError
    ? {
        label: "Completed with Errors",
        className:
          "border-red-300 bg-red-100 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
      }
    : {
        label: "Completed Successfully",
        className:
          "border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
      };
}

function ScenarioToggle({
  scenario,
  onChange,
}: {
  scenario: RunScenario;
  onChange: (scenario: RunScenario) => void;
}) {
  return (
    <div className="relative flex items-center gap-0.5 rounded-lg border border-border bg-muted p-0.5 text-xs font-medium">
      {SCENARIO_OPTIONS.map((option) => {
        const isActive = scenario === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={cn(
              "relative z-10 rounded-md px-2.5 py-1.5 whitespace-nowrap transition-colors",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="scenario-toggle-pill"
                className="absolute inset-0 -z-10 rounded-md bg-background shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default function Home() {
  const [scenario, setScenario] = useState<RunScenario>("failed");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [redlineStatuses, setRedlineStatuses] = useState<
    Record<string, RedlineStatus>
  >(() => Object.fromEntries(mockRedlines.map((r) => [r.id, r.status])));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeSteps = SCENARIO_STEPS[scenario];

  const clearStreamInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const runExecutionTrace = useCallback(
    (steps: AgentStep[]) => {
      clearStreamInterval();
      setIsStreaming(true);
      setCurrentStepIndex(-1);

      let step = -1;
      intervalRef.current = setInterval(() => {
        step += 1;
        setCurrentStepIndex(step);

        if (step >= steps.length - 1) {
          clearStreamInterval();
          setIsStreaming(false);
        }
      }, STREAM_INTERVAL_MS);
    },
    [clearStreamInterval]
  );

  const handleScenarioChange = useCallback(
    (next: RunScenario) => {
      setScenario((prev) => {
        if (prev === next) return prev;
        runExecutionTrace(SCENARIO_STEPS[next]);
        return next;
      });
    },
    [runExecutionTrace]
  );

  const handleApproveRedline = useCallback((redlineId: string) => {
    const redline = mockRedlines.find((r) => r.id === redlineId);
    if (!redline) return;

    setRedlineStatuses((prev) => ({ ...prev, [redlineId]: "accepted" }));
    toast.success(`Redline approved — ${redline.clauseSection} ${redline.clauseTitle}`, {
      description: "Suggested language applied in the document viewer.",
    });
  }, []);

  useEffect(() => clearStreamInterval, [clearStreamInterval]);

  const executionStatus = getExecutionStatus(isStreaming, currentStepIndex, activeSteps);
  const hasRun = currentStepIndex >= 0;

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6">
        <h1 className="text-sm font-semibold tracking-tight text-foreground">
          Legal Trace &amp; Audit
        </h1>
        <div className="flex items-center gap-3">
          <ScenarioToggle scenario={scenario} onChange={handleScenarioChange} />
          <Button
            size="sm"
            variant="outline"
            onClick={() => runExecutionTrace(activeSteps)}
            disabled={isStreaming}
          >
            {hasRun ? <RotateCcw /> : <Play />}
            {isStreaming ? "Streaming…" : hasRun ? "Re-run" : "Run Analysis"}
          </Button>
          <AnimatePresence mode="wait">
            <motion.div
              key={executionStatus.label}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
            >
              <Badge variant="outline" className={executionStatus.className}>
                {executionStatus.label}
              </Badge>
            </motion.div>
          </AnimatePresence>
        </div>
      </header>

      <main className="flex min-h-0 flex-1">
        <section className="flex min-w-0 flex-[3] flex-col overflow-hidden border-r border-border">
          <DocumentViewer redlineStatuses={redlineStatuses} />
        </section>
        <aside className="flex min-w-0 flex-[2] flex-col overflow-hidden">
          <AgentTracePanel
            steps={activeSteps}
            currentStepIndex={currentStepIndex}
            isStreaming={isStreaming}
            redlineStatuses={redlineStatuses}
            onApproveRedline={handleApproveRedline}
          />
        </aside>
      </main>
    </div>
  );
}
