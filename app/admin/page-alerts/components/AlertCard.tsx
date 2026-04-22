import AutorenewIcon from "@mui/icons-material/Autorenew";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { formatAlertBody } from "@/app/api/alert/util/formatAlertBody";
import { AlertItemInfo, AlertStatus } from "@/app/api/alert/util/types";
import {
  formatCreatedLabel,
  getLocationLabel,
  getSeverityTone,
  getSourceLabel,
  getSourceTone,
  getStatusLabel,
  getStatusTone,
  humanizeToken,
  ItemFeedback,
} from "./alertPage.utils";

type AlertCardProps = {
  alert: AlertItemInfo;
  feedback?: ItemFeedback | null;
  isProcessing: boolean;
  onStatusChange: (
    alert: AlertItemInfo,
    nextStatus: AlertStatus,
  ) => void | Promise<void>;
};

export default function AlertCard({
  alert,
  feedback,
  isProcessing,
  onStatusChange,
}: AlertCardProps) {
  const severityTone = getSeverityTone(alert.severity);
  const nextStatus: AlertStatus =
    alert.status === "draft" ? "published" : "draft";

  return (
    <div
      className={`rounded-[1.75rem] border border-foreground/10 border-l-10 bg-white p-6 shadow-sm ${severityTone.border}`}
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

        <div className="flex min-w-60 flex-col items-stretch gap-3 lg:max-w-65">
          <button
            type="button"
            onClick={() => void onStatusChange(alert, nextStatus)}
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
}
