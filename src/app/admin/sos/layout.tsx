import ReplayIcon from "@mui/icons-material/Replay";
import FilterChips from "./components/FilterChips";
import RequestTab from "./components/RequestTab";

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
  const reports = data?.reports;

  return (
    <div className="grid grid-cols-[1fr_2fr] h-auto overflow-hidden">
      <div className="">
        <div className="flex flex-col gap-4 p-6">
          <div className="flex justify-between">
            <span className="text-xl font-bold">Active SOS Requests</span>
            <ReplayIcon />
          </div>
          <div className="flex gap-2">
            <FilterChips severity={chips[0].severity} />
            <FilterChips severity={chips[0].severity} />
          </div>
        </div>
        <div className="flex flex-col overflow-y-scroll">
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
      {children}
    </div>
  );
}
