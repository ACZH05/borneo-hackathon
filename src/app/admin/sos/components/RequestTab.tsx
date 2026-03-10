import Link from "next/link";
import React from "react";

interface detailsProps {
  uid: string;
  severity: string;
  hazardType: string;
  location: string;
}

function RequestTab({ uid, severity, hazardType, location }: detailsProps) {
  return (
    <Link
      href={`/admin/sos/${uid}`}
      className="flex flex-col gap-1 p-4 cursor-pointer hover:bg-primary/5"
    >
      <div className="flex justify-between text-xs">
        <span className="text-priority font-black">{severity}</span>
        <span className="">2m ago</span>
      </div>
      <div className="text-base font-black">{hazardType}</div>
      <div className="text-xs">{location}</div>
    </Link>
  );
}

export default RequestTab;
