"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import FilterAltOffRoundedIcon from "@mui/icons-material/FilterAltOffRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import Skeleton from "@/app/components/Skeleton";
import { formatAlertBody } from "@/app/api/alert/util/formatAlertBody";
import { AlertItemInfo, AlertSource, AlertStatus } from "@/app/api/alert/util/types";
import { useUserContext } from "@/app/provider/UserIdProvider";

type SelectOption = {
  value: string;
  label: string;
};

type ItemFeedback = {
  type: "success" | "error";
  message: string;
};

const SOURCE_OPTIONS: SelectOption[] = [
  { value: "all", label: "All Sources" },
  { value: "third_party_api", label: "Third-Party API" },
  { value: "user_report", label: "User Report" },
];

const STATUS_OPTIONS: SelectOption[] = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

const ORDER_OPTIONS: SelectOption[] = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
];

const SEVERITY_ORDER = ["priority", "warning", "monitor"];

function humanizeToken(value?: string | null) {
  if (!value) {
    return "Unknown";
  }

  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getSourceLabel(source: AlertSource) {
  return source === "third_party_api" ? "Third-Party API" : "User Report";
}

function getStatusLabel(status: AlertStatus) {
  return status === "published" ? "Published" : "Draft";
}

function getSeverityTone(severity: string) {
  switch (severity.toLowerCase()) {
    case "priority":
      return {
        border: "border-priority",
        chip: "bg-priority/10 text-priority",
      };
    case "warning":
      return {
        border: "border-warning",
        chip: "bg-warning/10 text-warning",
      };
    case "monitor":
      return {
        border: "border-monitor",
        chip: "bg-monitor/10 text-monitor",
      };
    default:
      return {
        border: "border-foreground/15",
        chip: "bg-foreground/8 text-textGrey",
      };
  }
}

function getSourceTone(source: AlertSource) {
  return source === "third_party_api"
    ? "bg-sky-50 text-sky-700 border border-sky-100"
    : "bg-amber-50 text-amber-700 border border-amber-100";
}

function getStatusTone(status: AlertStatus) {
  return status === "published"
    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
    : "bg-slate-100 text-slate-700 border border-slate-200";
}

function hasCoordinates(alert: AlertItemInfo) {
  return Number.isFinite(alert.lat) && Number.isFinite(alert.lng) && (alert.lat !== 0 || alert.lng !== 0);
}

function getLocationLabel(alert: AlertItemInfo) {
  if (alert.stateName?.trim()) {
    return alert.stateName;
  }

  if (alert.regionCode?.trim()) {
    return alert.regionCode;
  }

  if (hasCoordinates(alert)) {
    return `${alert.lat.toFixed(3)}, ${alert.lng.toFixed(3)}`;
  }

  return "Unknown location";
}

function getRegionFilterValue(alert: AlertItemInfo) {
  return alert.stateName?.trim() || alert.regionCode?.trim() || "";
}

function formatCreatedLabel(alert: AlertItemInfo) {
  if (alert.createdAt) {
    const createdAt = new Date(alert.createdAt);
    if (!Number.isNaN(createdAt.getTime())) {
      return createdAt.toLocaleString("en-MY", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    }
  }

  if (alert.date || alert.time) {
    return [alert.date || "Unknown date", alert.time || "Unknown time"].join(" | ");
  }

  return "Unknown time";
}

function sortSeverityValues(values: string[]) {
  return [...values].sort((left, right) => {
    const leftIndex = SEVERITY_ORDER.indexOf(left.toLowerCase());
    const rightIndex = SEVERITY_ORDER.indexOf(right.toLowerCase());

    if (leftIndex >= 0 && rightIndex >= 0) {
      return leftIndex - rightIndex;
    }

    if (leftIndex >= 0) {
      return -1;
    }

    if (rightIndex >= 0) {
      return 1;
    }

    return left.localeCompare(right);
  });
}

function buildOptions(values: string[], fallbackLabel: string) {
  return [
    { value: "all", label: fallbackLabel },
    ...values.map((value) => ({
      value,
      label: humanizeToken(value),
    })),
  ];
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-[210px] flex-1 flex-col gap-2 rounded-[1.75rem] border border-foreground/10 bg-linear-to-r from-white to-primary/5 px-4 py-3 shadow-sm">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-textGrey">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="bg-transparent text-sm font-semibold text-foreground outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function AdminAlertsPage() {
  const { userId } = useUserContext();
  const [alerts, setAlerts] = useState<AlertItemInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [processingById, setProcessingById] = useState<Record<string, boolean>>({});
  const [feedbackById, setFeedbackById] = useState<Record<string, ItemFeedback>>({});

  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [hazardFilter, setHazardFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [orderFilter, setOrderFilter] = useState("newest");

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/alert", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok || !data?.success || !Array.isArray(data.alerts)) {
        throw new Error(data?.error || "Failed to load alerts.");
      }

      setAlerts(data.alerts);
    } catch (fetchError) {
      console.error("Failed to fetch admin alerts:", fetchError);
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load alerts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAlerts();
  }, [loadAlerts]);

  useEffect(() => {
    if (!actionNotice) {
      return;
    }

    const timeoutId = window.setTimeout(() => setActionNotice(null), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [actionNotice]);

  const severityOptions = useMemo(() => {
    const unique = Array.from(
      new Set(
        alerts
          .map((alert) => alert.severity?.trim())
          .filter((value): value is string => Boolean(value))
      )
    );

    return buildOptions(sortSeverityValues(unique), "All Severities");
  }, [alerts]);

  const hazardOptions = useMemo(() => {
    const unique = Array.from(
      new Set(
        alerts
          .map((alert) => alert.hazardType?.trim())
          .filter((value): value is string => Boolean(value))
      )
    ).sort((left, right) => left.localeCompare(right));

    return buildOptions(unique, "All Hazard Types");
  }, [alerts]);

  const stateOptions = useMemo(() => {
    const unique = Array.from(
      new Set(
        alerts
          .map((alert) => getRegionFilterValue(alert))
          .filter((value): value is string => Boolean(value))
      )
    ).sort((left, right) => left.localeCompare(right));

    return buildOptions(unique, "All States");
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    const nextAlerts = alerts.filter((alert) => {
      const matchesSource = sourceFilter === "all" || alert.source === sourceFilter;
      const matchesStatus = statusFilter === "all" || alert.status === statusFilter;
      const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter;
      const matchesHazard = hazardFilter === "all" || alert.hazardType === hazardFilter;
      const matchesState =
        stateFilter === "all" || getRegionFilterValue(alert) === stateFilter;

      return matchesSource && matchesStatus && matchesSeverity && matchesHazard && matchesState;
    });

    nextAlerts.sort((left, right) => {
      const leftTime = new Date(left.createdAt).getTime();
      const rightTime = new Date(right.createdAt).getTime();
      const safeLeftTime = Number.isNaN(leftTime) ? 0 : leftTime;
      const safeRightTime = Number.isNaN(rightTime) ? 0 : rightTime;

      return orderFilter === "oldest"
        ? safeLeftTime - safeRightTime
        : safeRightTime - safeLeftTime;
    });

    return nextAlerts;
  }, [
    alerts,
    hazardFilter,
    orderFilter,
    severityFilter,
    sourceFilter,
    stateFilter,
    statusFilter,
  ]);

  async function handleStatusChange(alert: AlertItemInfo, nextStatus: AlertStatus) {
    if (!alert.id) {
      setFeedbackById((current) => ({
        ...current,
        unknown: {
          type: "error",
          message: "This alert is missing an ID and cannot be updated.",
        },
      }));
      return;
    }

    if (!userId) {
      setFeedbackById((current) => ({
        ...current,
        [alert.id!]: {
          type: "error",
          message: "Admin session is not ready yet. Please try again in a moment.",
        },
      }));
      return;
    }

    setProcessingById((current) => ({ ...current, [alert.id!]: true }));
    setFeedbackById((current) => {
      const nextFeedback = { ...current };
      delete nextFeedback[alert.id!];
      return nextFeedback;
    });

    try {
      const response = await fetch(`/api/alert/${alert.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          status: nextStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success || !data.alert) {
        throw new Error(data?.error || "Failed to update alert status.");
      }

      setAlerts((current) =>
        current.map((item) => (item.id === alert.id ? data.alert : item))
      );
      setFeedbackById((current) => ({
        ...current,
        [alert.id!]: {
          type: "success",
          message: `Alert moved to ${getStatusLabel(nextStatus)}.`,
        },
      }));
      setActionNotice(
        `${alert.title || "Untitled alert"} moved to ${getStatusLabel(nextStatus)}.`
      );
    } catch (updateError) {
      setFeedbackById((current) => ({
        ...current,
        [alert.id!]: {
          type: "error",
          message:
            updateError instanceof Error
              ? updateError.message
              : "Failed to update alert status.",
        },
      }));
    } finally {
      setProcessingById((current) => ({
        ...current,
        [alert.id!]: false,
      }));
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-10 p-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-16 w-72" />
            <Skeleton className="h-6 w-96 max-w-full" />
          </div>
          <Skeleton className="h-14 w-52 rounded-[1.75rem]" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-[1.75rem]" />
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`alert-skeleton-${index}`}
              className="rounded-[1.75rem] border border-foreground/10 bg-white p-6 shadow-sm"
            >
              <Skeleton className="h-5 w-56" />
              <Skeleton className="mt-4 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-5/6" />
              <Skeleton className="mt-6 h-10 w-40 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasAlerts = alerts.length > 0;
  const hasFilteredAlerts = filteredAlerts.length > 0;

  return (
    <div className="flex flex-col gap-8 p-10">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex max-w-3xl flex-col gap-4">
          <h1 className="text-5xl font-bold leading-tight md:text-6xl">
            <span>Admin </span>
            <span className="text-primary">Alerts</span>
          </h1>
          <p className="text-lg text-textGrey">
            Review third-party and SOS-generated alerts in one queue, then move each
            record between draft and published without leaving the page.
          </p>
        </div>

        <div className="flex min-w-56 items-center gap-3 rounded-[1.75rem] border border-foreground/10 bg-white px-5 py-4 shadow-sm">
          <CampaignRoundedIcon className="text-primary" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-textGrey">
              Visible Results
            </span>
            <span className="text-xl font-black text-foreground">
              {filteredAlerts.length} / {alerts.length}
            </span>
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-sm">
          <CheckCircleOutlineIcon className="text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {error && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 shadow-sm">
          <div className="flex items-center gap-3 font-medium">
            <ErrorOutlineIcon className="text-red-500" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => void loadAlerts()}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2 font-semibold text-red-700 shadow-sm transition hover:bg-red-100"
          >
            <RefreshRoundedIcon fontSize="small" />
            Retry
          </button>
        </div>
      )}

      <div className="rounded-[2rem] border border-foreground/10 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <TuneRoundedIcon />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-foreground">Filter Alerts</span>
              <span className="text-sm text-textGrey">
                Narrow by source, status, severity, hazard, state, and sort order.
              </span>
            </div>
          </div>

          <span className="text-sm font-semibold text-textGrey">
            Showing {filteredAlerts.length} of {alerts.length} alerts
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <FilterSelect
            label="Source"
            value={sourceFilter}
            options={SOURCE_OPTIONS}
            onChange={setSourceFilter}
          />
          <FilterSelect
            label="Status"
            value={statusFilter}
            options={STATUS_OPTIONS}
            onChange={setStatusFilter}
          />
          <FilterSelect
            label="Severity"
            value={severityFilter}
            options={severityOptions}
            onChange={setSeverityFilter}
          />
          <FilterSelect
            label="Hazard Type"
            value={hazardFilter}
            options={hazardOptions}
            onChange={setHazardFilter}
          />
          <FilterSelect
            label="State"
            value={stateFilter}
            options={stateOptions}
            onChange={setStateFilter}
          />
          <FilterSelect
            label="Date Order"
            value={orderFilter}
            options={ORDER_OPTIONS}
            onChange={setOrderFilter}
          />
        </div>
      </div>

      {error && !hasAlerts ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center gap-5 rounded-[2rem] border border-dashed border-red-200 bg-red-50 px-8 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-red-500 shadow-sm">
            <ErrorOutlineIcon fontSize="large" />
          </div>
          <div className="flex max-w-lg flex-col gap-2">
            <span className="text-2xl font-black text-foreground">Unable To Load Alerts</span>
            <span className="text-base text-textGrey">
              The admin alert list could not be loaded yet. Retry to fetch the latest
              records from both alert sources.
            </span>
          </div>
          <button
            type="button"
            onClick={() => void loadAlerts()}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-red-700 shadow-sm transition hover:bg-red-100"
          >
            <RefreshRoundedIcon fontSize="small" />
            Retry Loading Alerts
          </button>
        </div>
      ) : !hasAlerts ? (
        <div className="flex min-h-[420px] flex-col items-center justify-center gap-5 rounded-[2rem] border border-dashed border-foreground/15 bg-primary/5 px-8 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-primary shadow-sm">
            <PublicRoundedIcon fontSize="large" />
          </div>
          <div className="flex max-w-xl flex-col gap-2">
            <span className="text-3xl font-black text-foreground">No Alerts Yet</span>
            <span className="text-base text-textGrey">
              The admin alert queue is empty. Third-party and SOS-generated alerts will
              appear here as soon as records exist upstream.
            </span>
          </div>
        </div>
      ) : !hasFilteredAlerts ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-5 rounded-[2rem] border border-dashed border-foreground/15 bg-white px-8 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FilterAltOffRoundedIcon fontSize="large" />
          </div>
          <div className="flex max-w-lg flex-col gap-2">
            <span className="text-2xl font-black text-foreground">No Matching Alerts</span>
            <span className="text-base text-textGrey">
              Alerts exist, but the current filter combination does not match any
              records. Adjust one or more filters to expand the results.
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredAlerts.map((alert) => {
            const severityTone = getSeverityTone(alert.severity);
            const feedback = alert.id ? feedbackById[alert.id] : null;
            const isProcessing = Boolean(alert.id && processingById[alert.id]);
            const nextStatus: AlertStatus =
              alert.status === "draft" ? "published" : "draft";

            return (
              <div
                key={alert.id ?? `${alert.createdAt}-${alert.title}`}
                className={`rounded-[1.75rem] border border-foreground/10 border-l-[10px] bg-white p-6 shadow-sm ${severityTone.border}`}
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex flex-1 flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold uppercase ${severityTone.chip}`}
                      >
                        {humanizeToken(alert.severity)}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${getSourceTone(alert.source)}`}
                      >
                        {getSourceLabel(alert.source)}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${getStatusTone(alert.status)}`}
                      >
                        {getStatusLabel(alert.status)}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <WarningAmberOutlinedIcon className="text-primary" />
                        <h2 className="text-2xl font-black text-foreground">
                          {alert.title?.trim() || "Untitled Alert"}
                        </h2>
                      </div>
                      <p className="whitespace-pre-line text-sm leading-7 text-textGrey">
                        {formatAlertBody(alert.body || "No alert body available.")}
                      </p>
                    </div>

                    <div className="grid gap-3 text-sm text-textGrey md:grid-cols-3">
                      <div className="rounded-2xl bg-primary/5 px-4 py-3">
                        <span className="block text-[11px] font-semibold uppercase tracking-wide text-textGrey/80">
                          Created
                        </span>
                        <span className="mt-1 block font-semibold text-foreground">
                          {formatCreatedLabel(alert)}
                        </span>
                      </div>
                      <div className="rounded-2xl bg-primary/5 px-4 py-3">
                        <span className="block text-[11px] font-semibold uppercase tracking-wide text-textGrey/80">
                          Location
                        </span>
                        <span className="mt-1 block font-semibold text-foreground">
                          {getLocationLabel(alert)}
                        </span>
                      </div>
                      <div className="rounded-2xl bg-primary/5 px-4 py-3">
                        <span className="block text-[11px] font-semibold uppercase tracking-wide text-textGrey/80">
                          Hazard Type
                        </span>
                        <span className="mt-1 block font-semibold text-foreground">
                          {humanizeToken(alert.hazardType)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex min-w-[240px] flex-col items-stretch gap-3 lg:max-w-[260px]">
                    <button
                      type="button"
                      onClick={() => void handleStatusChange(alert, nextStatus)}
                      disabled={isProcessing || !alert.id}
                      className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black text-white shadow-sm transition ${
                        isProcessing || !alert.id
                          ? "cursor-not-allowed bg-slate-400"
                          : alert.status === "draft"
                            ? "cursor-pointer bg-black hover:bg-gray-800"
                            : "cursor-pointer bg-primary hover:opacity-90"
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <AutorenewIcon fontSize="small" className="animate-spin" />
                          Updating...
                        </>
                      ) : alert.status === "draft" ? (
                        <>
                          <CheckCircleOutlineIcon fontSize="small" />
                          Publish
                        </>
                      ) : (
                        <>
                          <RefreshRoundedIcon fontSize="small" />
                          Move to Draft
                        </>
                      )}
                    </button>

                    <div className="rounded-2xl border border-foreground/10 bg-slate-50 px-4 py-3 text-sm text-textGrey">
                      <span className="block text-[11px] font-semibold uppercase tracking-wide text-textGrey/80">
                        Next Action
                      </span>
                      <span className="mt-1 block font-semibold text-foreground">
                        {alert.status === "draft"
                          ? "Publish this alert to the resident feed."
                          : "Return this alert to draft review."}
                      </span>
                    </div>

                    {feedback && (
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                          feedback.type === "success"
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border border-red-200 bg-red-50 text-red-700"
                        }`}
                      >
                        {feedback.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
