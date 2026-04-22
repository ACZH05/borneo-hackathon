import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

type AlertsBannerProps = {
  actionNotice: string | null;
  error: string | null;
  onRetry: () => void;
};

export default function AlertsBanner({
  actionNotice,
  error,
  onRetry,
}: AlertsBannerProps) {
  return (
    <>
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
            onClick={onRetry}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2 font-semibold text-red-700 shadow-sm transition hover:bg-red-100"
          >
            <RefreshRoundedIcon fontSize="small" />
            Retry
          </button>
        </div>
      )}
    </>
  );
}
