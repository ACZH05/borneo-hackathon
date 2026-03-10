import React from "react";

function RescueCard() {
  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-4">
      <div className="flex items-center col-span-3">Ahmad Yusof</div>
      <div className="flex flex-col text-xs gap-1 row-start-2">
        <span>BLOOD TYPE</span>
        <span>O Positive (O+)</span>
      </div>
      <div className="flex flex-col text-xs gap-1 row-start-2">
        <span>MEDICAL CONDITION</span>
        <span>Hypertension, Type 2 Diabetes</span>
      </div>
      <div className="flex flex-col text-xs gap-1">
        <span>HOME ADRRESS</span>
        <span>Villa 12, Lake View</span>
      </div>
      <div className="flex flex-col text-xs gap-1 row-start-3">
        <span>CONTACT PHONE</span>
        <span>+60 12-345 6789</span>
      </div>
      <div className="flex flex-col text-xs gap-1 col-span-2 row-start-3">
        <span>EMERGENCY CONTACT</span>
        <span>Sarah (sister) +60 12-345 6789</span>
      </div>
    </div>
  );
}

export default RescueCard;
