"use client";

import TouchAppOutlinedIcon from "@mui/icons-material/TouchAppOutlined";

export default function Page() {
  return (
    <div className="flex justify-center items-center bg-primary/5 h-full">
      <div className="flex flex-col items-center gap-4">
        <div className="flex justify-center items-center w-48 h-48 bg-textGrey/10 text-textGrey rounded-full">
          <TouchAppOutlinedIcon fontSize="large" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl font-black">Waiting for selection</span>
          <span className="w-96 text-center text-textGrey">
            Select an SOS request from the left panel to begin the triage
            process, view technical details, and coordinate emergency response.
          </span>
        </div>
      </div>
    </div>
  );
}
