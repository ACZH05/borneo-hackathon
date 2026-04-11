"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ReplayIcon from "@mui/icons-material/Replay";
import FilterChips, { SeverityLevel } from "./FilterChips";
import RequestTab from "./RequestTab";

export type ReportSummary = {
  id: string;
  severity: string | null;
  hazardType: string;
  location: string;
  createdAt: string;
};

const SEVERITY_LEVELS: SeverityLevel[] = [
  "False Alarm",
  "Low",
  "Medium",
  "High",
  "Critical",
];

type CountBySeverity = Record<SeverityLevel, number>;

const emptyCounts = (): CountBySeverity => ({
  "False Alarm": 0,
  Low: 0,
  Medium: 0,
  High: 0,
  Critical: 0,
});

const normalizeSeverity = (severity: string | null): SeverityLevel | null => {
  if (!severity) {
    return null;
  }

  const normalized = severity.trim().toLowerCase();

  switch (normalized) {
    case "false alarm":
    case "false_alarm":
    case "falsealarm":
      return "False Alarm";
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    case "critical":
      return "Critical";
    default:
      return null;
  }
};

function SOSRequestPanel({ reports }: { reports: ReportSummary[] }) {
  const router = useRouter();
  const [isRefreshing, startRefreshTransition] = useTransition();
  const [activeSeverity, setActiveSeverity] = useState<SeverityLevel | null>(
    null,
  );

  const normalizedReports = useMemo(
    () =>
      reports.map((report) => ({
        ...report,
        normalizedSeverity: normalizeSeverity(report.severity),
      })),
    [reports],
  );

  const counts = useMemo(() => {
    const next = emptyCounts();
    for (const report of normalizedReports) {
      if (report.normalizedSeverity) {
        next[report.normalizedSeverity] += 1;
      }
    }
    return next;
  }, [normalizedReports]);

  const filteredReports = useMemo(() => {
    if (!activeSeverity) {
      return normalizedReports;
    }

    return normalizedReports.filter(
      (report) => report.normalizedSeverity === activeSeverity,
    );
  }, [activeSeverity, normalizedReports]);

  const handleSeverityClick = (severity: SeverityLevel) => {
    setActiveSeverity((previousSeverity) =>
      previousSeverity === severity ? null : severity,
    );
  };

  const handleRefresh = () => {
    startRefreshTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-col gap-4 p-6">
        <div className="flex justify-between">
          <span className="text-xl font-bold">Active SOS Requests</span>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Refresh SOS requests"
            className="rounded-full p-1 text-textGrey transition hover:bg-primary/10 hover:text-primary disabled:cursor-wait disabled:opacity-70"
          >
            <ReplayIcon className={isRefreshing ? "animate-spin" : ""} />
          </button>
        </div>
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1">
          {SEVERITY_LEVELS.map((severity) => (
            <FilterChips
              key={severity}
              severity={severity}
              count={counts[severity]}
              isActive={activeSeverity === severity}
              onClick={() => handleSeverityClick(severity)}
            />
          ))}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <RequestTab
              key={report.id}
              uid={report.id}
              severity={report.normalizedSeverity ?? "Unknown"}
              hazardType={report.hazardType}
              location={report.location}
              createdAt={report.createdAt}
            />
          ))
        ) : (
          <div className="px-6 py-4 text-sm text-textGrey">
            No reports found for this severity.
          </div>
        )}
      </div>
    </div>
  );
}

export default SOSRequestPanel;
