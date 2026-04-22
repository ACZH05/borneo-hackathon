import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import FilterAltOffRoundedIcon from "@mui/icons-material/FilterAltOffRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

type AlertsEmptyStateVariant = "loadError" | "empty" | "noResults";

type AlertsEmptyStateProps = {
  variant: AlertsEmptyStateVariant;
  onRetry?: () => void;
};

export default function AlertsEmptyState({
  variant,
  onRetry,
}: AlertsEmptyStateProps) {
  if (variant === "loadError") {
    return (
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
          onClick={onRetry}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-red-700 shadow-sm transition hover:bg-red-100"
        >
          <RefreshRoundedIcon fontSize="small" />
          Retry Loading Alerts
        </button>
      </div>
    );
  }

  if (variant === "empty") {
    return (
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
    );
  }

  return (
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
  );
}
