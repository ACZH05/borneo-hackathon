import React from "react";

export type SeverityLevel =
  | "False Alarm"
  | "Low"
  | "Medium"
  | "High"
  | "Critical";

interface FilterChipsProp {
  severity: SeverityLevel;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

const getChipsStyle = (severity: SeverityLevel, isActive: boolean) => {
  switch (severity) {
    case "Critical":
      return isActive
        ? "border-priority bg-priority text-white"
        : "border-priority/30 bg-priority/15 text-priority";
    case "High":
      return isActive
        ? "border-warning bg-warning text-white"
        : "border-warning/30 bg-warning/15 text-warning";
    case "Medium":
      return isActive
        ? "border-warning bg-warning text-white"
        : "border-warning/20 bg-warning/10 text-warning";
    case "Low":
      return isActive
        ? "border-monitor bg-monitor text-white"
        : "border-monitor/30 bg-monitor/15 text-monitor";
    case "False Alarm":
      return isActive
        ? "border-textGrey bg-textGrey text-white"
        : "border-textGrey/20 bg-textGrey/10 text-textGrey";
    default:
      return isActive
        ? "border-textGrey bg-textGrey text-white"
        : "border-textGrey/20 bg-textGrey/10 text-textGrey";
  }
};

function FilterChips({ severity, count, isActive, onClick }: FilterChipsProp) {
  const style = getChipsStyle(severity, isActive);
  const countStyle = isActive
    ? "bg-white/25 text-white"
    : "bg-white/70 text-current";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition hover:opacity-90 ${style}`}
    >
      <span>{severity}</span>
      <span
        className={`rounded-full px-1.5 py-0.5 text-[11px] leading-none ${countStyle}`}
      >
        {count}
      </span>
    </button>
  );
}

export default FilterChips;
