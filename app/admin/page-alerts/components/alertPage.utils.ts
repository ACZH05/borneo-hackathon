import { AlertItemInfo, AlertSource, AlertStatus } from "@/app/api/alert/util/types";

export type SelectOption = {
  value: string;
  label: string;
};

export type ItemFeedback = {
  type: "success" | "error";
  message: string;
};

export const SOURCE_OPTIONS: SelectOption[] = [
  { value: "all", label: "All Sources" },
  { value: "third_party_api", label: "Third-Party API" },
  { value: "user_report", label: "User Report" },
];

export const STATUS_OPTIONS: SelectOption[] = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

export const ORDER_OPTIONS: SelectOption[] = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
];

const SEVERITY_ORDER = ["priority", "warning", "monitor"];

export function humanizeToken(value?: string | null) {
  if (!value) {
    return "Unknown";
  }

  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getSourceLabel(source: AlertSource) {
  return source === "third_party_api" ? "Third-Party API" : "User Report";
}

export function getStatusLabel(status: AlertStatus) {
  return status === "published" ? "Published" : "Draft";
}

export function getSeverityTone(severity: string) {
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

export function getSourceTone(source: AlertSource) {
  return source === "third_party_api"
    ? "bg-sky-50 text-sky-700 border border-sky-100"
    : "bg-amber-50 text-amber-700 border border-amber-100";
}

export function getStatusTone(status: AlertStatus) {
  return status === "published"
    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
    : "bg-slate-100 text-slate-700 border border-slate-200";
}

export function hasCoordinates(alert: AlertItemInfo) {
  return Number.isFinite(alert.lat) && Number.isFinite(alert.lng) && (alert.lat !== 0 || alert.lng !== 0);
}

export function getLocationLabel(alert: AlertItemInfo) {
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

export function getRegionFilterValue(alert: AlertItemInfo) {
  return alert.stateName?.trim() || alert.regionCode?.trim() || "";
}

export function formatCreatedLabel(alert: AlertItemInfo) {
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

export function sortSeverityValues(values: string[]) {
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

export function buildOptions(values: string[], fallbackLabel: string) {
  return [
    { value: "all", label: fallbackLabel },
    ...values.map((value) => ({
      value,
      label: humanizeToken(value),
    })),
  ];
}
