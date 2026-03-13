import Link from "next/link";
import React from "react";

interface detailsProps {
  uid: string;
  severity: string;
  hazardType: string;
  location: string;
  createdAt: string;
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

const formatCreatedTime = (createdAt: string) => {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return new Intl.DateTimeFormat("en-MY", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

function RequestTab({
  uid,
  severity,
  hazardType,
  location,
  createdAt,
}: detailsProps) {
  const severityClass = getSeverityClass(severity);
  const createdTime = formatCreatedTime(createdAt);

  return (
    <Link
      href={`/admin/page-sos/${uid}`}
      className="flex flex-col gap-1 p-4 cursor-pointer hover:bg-primary/5"
    >
      <div className="flex justify-between text-xs">
        <span className={`${severityClass} font-black`}>{severity}</span>
        <span>{createdTime}</span>
      </div>
      <div className="text-base font-black">{hazardType}</div>
      <div className="text-xs">{location}</div>
    </Link>
  );
}

export default RequestTab;
