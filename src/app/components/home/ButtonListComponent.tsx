"use client";

import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import RingVolumeIcon from "@mui/icons-material/RingVolume";

export default function ButtonListComponent() {
  return (
    <div className="flex gap-4 text-surface font-bold">
      <button className="flex gap-2 px-8 py-4 bg-primary shadow rounded-full transition hover:-translate-1 cursor-pointer">
        <HealthAndSafetyOutlinedIcon />
        Find Safe Zone
      </button>

      <button className="flex gap-2 px-8 py-4 bg-priority shadow rounded-full transition hover:-translate-1 cursor-pointer">
        <RingVolumeIcon />
        SOS
      </button>
    </div>
  );
}
