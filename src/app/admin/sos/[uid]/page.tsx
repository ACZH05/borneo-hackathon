import React from "react";

import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";
import RescueCard from "./components/RescueCard";

function Page() {
  return (
    <div className="flex flex-col gap-6 h-10/12 p-6">
      <div className="h-full grid grid-cols-2 grid-rows-2 gap-6">
        <div className="h-full row-span-2 bg-primary/30">Map</div>
        <RescueCard />
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 text-primary">
            <TipsAndUpdatesOutlinedIcon />
            <span className="font-bold">AI SIGNAL INTELLIGENCE</span>
          </div>
          <span>
            Dispatch Fire and EMS to reported flood with medical casualty.
          </span>
        </div>
      </div>
      <div className="flex justify-between border-2 border-textGrey/20 text-textGrey/50 rounded-xl p-3">
        <div className="flex gap-2 items-center">
          <FiberManualRecordIcon fontSize="small" className="text-primary" />
          <span className="font-bold text-xs">System Secure</span>
        </div>
      </div>
    </div>
  );
}

export default Page;
