import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";

type AlertsPageHeaderProps = {
  totalAlerts: number;
  visibleAlerts: number;
};

export default function AlertsPageHeader({
  totalAlerts,
  visibleAlerts,
}: AlertsPageHeaderProps) {
  return (
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
            {visibleAlerts} / {totalAlerts}
          </span>
        </div>
      </div>
    </div>
  );
}
