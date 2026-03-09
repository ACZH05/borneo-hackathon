import React from "react";

function RequestTab() {
  return (
    <div className="flex flex-col gap-1 p-4 border-t-2 border-b-2 border-textGrey/10 cursor-pointer hover:bg-primary/5 hover:border-hidden">
      <div className="flex justify-between text-xs">
        <span className="text-priority font-black">CRITICAL URGENCY</span>
        <span className="">2m ago</span>
      </div>
      <div className="text-base font-black">Flood</div>
      <div className="text-xs">Location: xxx</div>
    </div>
  );
}

export default RequestTab;
