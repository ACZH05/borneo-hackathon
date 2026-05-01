"use client";

import { useEffect, useRef, useState } from "react";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { SelectOption } from "./alertPage.utils";

type FilterSelectProps = {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
};

type AlertsFiltersPanelProps = {
  sourceFilter: string;
  statusFilter: string;
  severityFilter: string;
  hazardFilter: string;
  stateFilter: string;
  orderFilter: string;
  sourceOptions: SelectOption[];
  statusOptions: SelectOption[];
  severityOptions: SelectOption[];
  hazardOptions: SelectOption[];
  stateOptions: SelectOption[];
  orderOptions: SelectOption[];
  onSourceChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSeverityChange: (value: string) => void;
  onHazardChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onOrderChange: (value: string) => void;
  onResetFilters: () => void;
};

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (!menuRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative min-w-[210px] flex-1">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between rounded-[1.75rem] border border-foreground/10 bg-linear-to-r from-white to-primary/5 px-4 py-3 text-left shadow-sm transition hover:border-primary/30 hover:shadow-md"
      >
        <span className="flex min-w-0 flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-textGrey">
            {label}
          </span>
          <span className="truncate text-sm font-semibold text-foreground">
            {selectedOption?.label ?? options[0]?.label ?? "Select"}
          </span>
        </span>
        <span
          className={`material-symbols-outlined text-textGrey transition ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-20 overflow-hidden rounded-4xl border border-foreground/10 bg-white shadow-2xl">
          <div className="max-h-72 overflow-y-auto p-2">
            {options.map((option) => {
              const isActive = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-full px-4 py-3 text-left text-sm font-semibold transition ${
                    isActive
                      ? "bg-primary text-surface shadow-sm"
                      : "text-foreground hover:bg-primary/8"
                  }`}
                >
                  <span>{option.label}</span>
                  {isActive && (
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      check
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AlertsFiltersPanel({
  sourceFilter,
  statusFilter,
  severityFilter,
  hazardFilter,
  stateFilter,
  orderFilter,
  sourceOptions,
  statusOptions,
  severityOptions,
  hazardOptions,
  stateOptions,
  orderOptions,
  onSourceChange,
  onStatusChange,
  onSeverityChange,
  onHazardChange,
  onStateChange,
  onOrderChange,
  onResetFilters,
}: AlertsFiltersPanelProps) {
  return (
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

        <button
          type="button"
          onClick={onResetFilters}
          className="rounded-full border border-foreground/10 px-4 py-2 text-sm font-semibold text-textGrey transition hover:border-primary/30 hover:bg-primary/8 hover:text-primary"
        >
          Reset filter
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <FilterSelect
          label="Source"
          value={sourceFilter}
          options={sourceOptions}
          onChange={onSourceChange}
        />
        <FilterSelect
          label="Status"
          value={statusFilter}
          options={statusOptions}
          onChange={onStatusChange}
        />
        <FilterSelect
          label="Severity"
          value={severityFilter}
          options={severityOptions}
          onChange={onSeverityChange}
        />
        <FilterSelect
          label="Hazard Type"
          value={hazardFilter}
          options={hazardOptions}
          onChange={onHazardChange}
        />
        <FilterSelect
          label="State"
          value={stateFilter}
          options={stateOptions}
          onChange={onStateChange}
        />
        <FilterSelect
          label="Date Order"
          value={orderFilter}
          options={orderOptions}
          onChange={onOrderChange}
        />
      </div>
    </div>
  );
}
