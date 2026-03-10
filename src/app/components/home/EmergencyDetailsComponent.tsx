"use client";

import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CallIcon from "@mui/icons-material/Call";

export default function EmergencyDetailsComponent({
  name,
  emergencyContactName,
  emergencyContactPhone,
}: {
  name: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}) {
  return (
    <div className="flex flex-col bg-primary text-surface rounded-2xl p-4 gap-4 transition hover:-translate-1 cursor-pointer">
      <div className="flex justify-between font-bold">
        EMERGENCY DETAILS
        <ArrowForwardIosIcon />
      </div>
      <div className="flex gap-4">
        <div className="">
          <span className="text-xs">NAME</span>
          <br />
          <span className="font-bold">{name || "-"}</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs">EMERGENCY CONTACT</span>
          <span className="font-bold">{emergencyContactName}</span>
          <div className="items-center text-xs">
            <CallIcon fontSize="small" />
            {emergencyContactPhone}
          </div>
        </div>
      </div>
    </div>
  );
}
