import ReplayIcon from "@mui/icons-material/Replay";
import FilterChips from "./components/FilterChips";
import RequestTab from "./components/RequestTab";

export default function SOSLayout({ children }: { children: React.ReactNode }) {
  const chips = [
    {
      severity: "Critical",
    },
  ];
  return (
    <div className="grid grid-cols-[1fr_2fr] h-full">
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
        <div className="">
          <div className="flex flex-col">
            <RequestTab />
            <RequestTab />
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
