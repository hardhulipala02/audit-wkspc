import { AlertTriangle, CheckCircle2, FileUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  mockContractMeta,
  mockContractParagraphs,
  mockRedlines,
  type RedlineSeverity,
  type RedlineStatus,
} from "@/data/mockAudit";
import { cn } from "@/lib/utils";

const severityStyles: Record<
  RedlineSeverity,
  { highlight: string; badge: string; label: string }
> = {
  critical: {
    highlight: "border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/30",
    badge:
      "border-red-300 bg-red-100 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
    label: "Critical risk",
  },
  high: {
    highlight: "border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950/30",
    badge:
      "border-orange-300 bg-orange-100 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300",
    label: "High risk",
  },
  medium: {
    highlight: "border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950/30",
    badge:
      "border-amber-300 bg-amber-100 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
    label: "Medium risk",
  },
  low: {
    highlight: "border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/30",
    badge:
      "border-blue-300 bg-blue-100 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
    label: "Low risk",
  },
};

const approvedHighlight =
  "border-l-4 border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950/30";
const approvedBadge =
  "border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300";

interface DocumentViewerProps {
  redlineStatuses: Record<string, RedlineStatus>;
  uploadedFileName?: string;
}

export function DocumentViewer({
  redlineStatuses,
  uploadedFileName,
}: DocumentViewerProps) {
  return (
    <Card className="h-full gap-0 rounded-none border-0 py-0 ring-0">
      <CardHeader className="border-b border-border py-4">
        <CardTitle>{mockContractMeta.title}</CardTitle>
        <CardDescription>
          {mockContractMeta.counterparty} · Effective{" "}
          {mockContractMeta.effectiveDate}
        </CardDescription>
        {uploadedFileName && (
          <Badge variant="outline" className="mt-2 w-fit gap-1">
            <FileUp className="size-3" />
            Source: {uploadedFileName}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="min-h-0 flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="flex flex-col gap-5 px-6 py-5">
            {mockContractParagraphs.map((paragraph) => {
              const severity = paragraph.severity
                ? severityStyles[paragraph.severity]
                : null;
              const redline = paragraph.redlineId
                ? mockRedlines.find((r) => r.id === paragraph.redlineId)
                : undefined;
              const isApproved =
                !!paragraph.redlineId &&
                redlineStatuses[paragraph.redlineId] === "accepted";
              const displayText =
                isApproved && redline ? redline.suggestedText : paragraph.text;

              return (
                <div
                  key={paragraph.id}
                  className={cn(
                    "rounded-md px-4 py-3 transition-colors duration-700 ease-out",
                    isApproved
                      ? approvedHighlight
                      : severity && severity.highlight
                  )}
                >
                  {paragraph.section && (
                    <div className="mb-1 flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold text-foreground">
                        {paragraph.section} {paragraph.heading}
                      </h3>
                      {isApproved ? (
                        <Badge
                          variant="outline"
                          className={cn("shrink-0 gap-1", approvedBadge)}
                        >
                          <CheckCircle2 className="size-3" />
                          Approved
                        </Badge>
                      ) : (
                        severity && (
                          <Badge
                            variant="outline"
                            className={cn("shrink-0 gap-1", severity.badge)}
                          >
                            <AlertTriangle className="size-3" />
                            {severity.label}
                          </Badge>
                        )
                      )}
                    </div>
                  )}
                  <p className="text-sm leading-relaxed text-foreground/80 transition-colors duration-700">
                    {displayText}
                  </p>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
