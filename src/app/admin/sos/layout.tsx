import ReplayIcon from "@mui/icons-material/Replay";
import FilterChips from "./components/FilterChips";
import RequestTab from "./components/RequestTab";

type Report = {
  id: string;
  userId: string;
  lat: number;
  lng: number;
  address: string;
  hazardType: string;
  description: string;
  status: string;
  aiTriage: any;
  createdAt: string | Date;
};

export default async function SOSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const chips = [
    {
      severity: "Critical",
    },
  ];

  const response = await fetch(`${process.env.URL}/api/reports`, {
    method: "GET",
  });

  const data = await response.json();
  const reports: Report[] = data?.reports;

  return (
    <div className="grid h-full min-h-0 grid-cols-[1fr_2fr] overflow-hidden">
      <div className="flex min-h-0 flex-col">
        <div className="flex shrink-0 flex-col gap-4 p-6">
          <div className="flex justify-between">
            <span className="text-xl font-bold">Active SOS Requests</span>
            <ReplayIcon />
          </div>
          <div className="flex gap-2">
            <FilterChips severity={chips[0].severity} />
            <FilterChips severity={chips[0].severity} />
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {reports.map((report) => (
            <RequestTab
              key={report.id}
              uid={report.id}
              severity={report?.aiTriage?.severity}
              hazardType={report?.hazardType}
              location={report?.address}
            />
          ))}
        </div>
      </div>
      <div className="min-h-0 overflow-y-auto">{children}</div>
    </div>
  );
}
