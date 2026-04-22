import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { SelectOption } from "./alertPage.utils";

type FilterSelectProps = {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
};

type AlertsFiltersPanelProps = {
  totalAlerts: number;
  visibleAlerts: number;
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
};

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
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

export default function AlertsFiltersPanel({
  totalAlerts,
  visibleAlerts,
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

        <span className="text-sm font-semibold text-textGrey">
          Showing {visibleAlerts} of {totalAlerts} alerts
        </span>
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
