import SOSRequestPanel, { ReportSummary } from "./components/SOSRequestPanel";

type Report = {
  id: string;
  address: string | null;
  hazardType: string | null;
  createdAt: string;
  aiTriage: { severity?: string | null } | null;
};

export default async function SOSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const response = await fetch(`${process.env.URL}/api/reports`, {
    method: "GET",
    cache: "no-store",
  });

  const data = await response.json();
  const reports: Report[] = data?.reports ?? [];
  const reportSummaries: ReportSummary[] = reports.map((report) => ({
    id: report.id,
    severity: report?.aiTriage?.severity ?? null,
    hazardType: report.hazardType ?? "Unknown hazard",
    location: report.address ?? "Unknown location",
    createdAt: report.createdAt,
  }));

  return (
    <div className="grid h-[calc(100vh-160px)] min-h-0 grid-cols-[1fr_2fr] overflow-hidden">
      <div className="flex min-h-0 flex-col overflow-hidden">
        <SOSRequestPanel reports={reportSummaries} />
      </div>
      <div className="min-h-0 overflow-hidden">
        <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
