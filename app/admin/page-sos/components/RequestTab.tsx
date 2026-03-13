import Link from "next/link";
import React from "react";

interface detailsProps {
  uid: string;
  severity: string;
  hazardType: string;
  location: string;
}

const getSeverityClass = (severity: string) => {
  switch (severity.toLowerCase()) {
    case "critical":
      return "text-priority";
    case "high":
    case "medium":
      return "text-warning";
    case "low":
      return "text-monitor";
    case "false alarm":
      return "text-textGrey";
    default:
      return "text-textGrey";
  }
};

function RequestTab({ uid, severity, hazardType, location }: detailsProps) {
  const severityClass = getSeverityClass(severity);

  return (
    <Link
      href={`/admin/page-sos/${uid}`}
      className="flex flex-col gap-1 p-4 cursor-pointer hover:bg-primary/5"
    >
      <div className="flex justify-between text-xs">
        <span className={`${severityClass} font-black`}>{severity}</span>
        <span className="">2m ago</span>
      </div>
      <div className="text-base font-black">{hazardType}</div>
      <div className="text-xs">{location}</div>
    </Link>
  );
}

export default RequestTab;
