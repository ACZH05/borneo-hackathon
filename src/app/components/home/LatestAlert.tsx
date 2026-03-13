"use client";

import { useRouter } from "next/navigation";
import CampaignIcon from "@mui/icons-material/Campaign";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";
import { AlertItemInfo } from "@/api/alert/util/types";
import { formatAlertBody } from "@/api/alert/util/formatAlertBody";
import { filterOptions } from "@/app/page-alerts/components/Alert-Filter";
import MapDisplay from "@/api/map/route";
import { useAlertsData } from "@/api/alert/util/useAlertsData";

// --- Severity border colour for featured card ---
const borderColor: Record<string, string> = {
  priority: "border-priority",
  warning:  "border-warning",
  monitor:  "border-monitor",
};

// --- Severity badge colour ---
const badgeColor: Record<string, string> = {
  priority: "bg-priority/10 text-priority",
  warning:  "bg-warning/10 text-warning",
  monitor:  "bg-monitor/10 text-monitor",
};

export default function LatestAlert() {
  const router = useRouter();
  const { stats, isLoading } = useAlertsData();

  const openAlert = (alert: AlertItemInfo) => {
    if (!alert.id) {
      router.push("/page-alerts");
      return;
    }

    router.push(`/page-alerts?alert=${encodeURIComponent(alert.id)}`);
  };

  const [featured, second] = stats.topTwoAlerts;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex gap-3 items-center">
          <div className="p-2 bg-primary/10 rounded-xl">
            <CampaignIcon fontSize="small" className="text-primary" />
          </div>
          <span className="text-2xl font-bold">Latest Alerts</span>
        </div>
        <div className="text-center font-bold text-textGrey py-10">Loading latest alerts...</div>
      </div>
    );
  }

  if (!featured) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex justify-between">
          <div className="flex gap-3 items-center">
            <div className="p-2 bg-primary/10 rounded-xl">
              <CampaignIcon fontSize="small" className="text-primary" />
            </div>
            <span className="text-2xl font-bold">Latest Alerts</span>
          </div>
          <div className=""></div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white p-8 text-center shadow">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <span className="material-symbols-outlined text-primary">campaign</span>
          </div>
          <span className="text-2xl font-bold text-textGrey">No active alerts right now.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between">
        <div className="flex gap-3 items-center">
          <div className="p-1 bg-primary/10 rounded-xl">
            <CampaignIcon fontSize="small" className="text-primary" />
          </div>
          <span className="text-2xl font-bold">Latest Alerts</span>
        </div>
        {/* For archieve link */}
        <div className=""></div>
      </div>

      {/* --- First Card --- */}
      {featured && (() => {
        const featuredCategory = filterOptions.find(opt => opt.value === featured.hazardType);
        return (
          <div
            onClick={() => openAlert(featured)}
            className={`flex flex-wrap cursor-pointer p-6 gap-8 bg-white border-l-10 ${borderColor[featured.severity] ?? "border-gray-300"} rounded-2xl shadow`}
          >
            {/* --- Map Display --- */}
            <div className="flex items-center justify-center w-full min-h-42 bg-primary/10">
              <MapDisplay latitude={featured.lat} longitude={featured.lng} />
            </div>
            <div className="flex flex-col gap-4 w-full">
              <div className="flex gap-3 items-center">
                {/* --- Severity Badge --- */}
                <div className={`flex gap-1 items-center ${badgeColor[featured.severity] ?? "bg-gray-300/10 text-gray-300"} rounded-full px-4 py-1`}>
                  <WarningAmberOutlinedIcon fontSize="small" />
                  <span className="text-xs font-black uppercase">{featured.severity}</span>
                </div>

                {/* --- Date & Time --- */}
                <div className="text-xs text-textGrey/60">{featured.date}, {featured.time}</div>
              </div>

              {/* --- Title --- */}
              <div className="flex gap-2 items-center">
                <span className="material-symbols-outlined" style={{ color: featuredCategory?.color }}>
                  {featuredCategory?.icon ?? "warning"}
                </span>
                <span className="text-2xl font-bold">{featured.title}</span>
              </div>

              {/* --- Body --- */}
              <div className="text-textGrey whitespace-pre-line">{formatAlertBody(featured.body)}</div>

              {/* --- Location --- */}
              <div className="flex gap-6">
                <div className="flex gap-2">
                  <FmdGoodOutlinedIcon className="text-primary" />
                  <span className="text-textGrey/60">{featured.regionCode}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* --- Second Card --- */}
      {second && (() => {
        const secondCategory = filterOptions.find(opt => opt.value === second.hazardType);
        return (
          <div
            onClick={() => openAlert(second)}
            className={`flex cursor-pointer flex-col gap-5 border-l-10 ${borderColor[second.severity] ?? "border-gray-300"} bg-white rounded-2xl p-6 shadow`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-center gap-2">
                {/* --- Icon --- */}
                <span className="material-symbols-outlined" style={{ color: secondCategory?.color, fontSize: 24 }}>
                  {secondCategory?.icon ?? "warning"}
                </span>

                {/* --- Title --- */}
                <span className="text-2xl font-bold">{second.title}</span>
              </div>

              {/* --- Severity Badge --- */}
              <div className={`${badgeColor[second.severity] ?? "bg-gray-300/10 text-gray-300"} text-xs font-bold px-2 py-1 rounded-md uppercase`}>
                {second.severity}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
