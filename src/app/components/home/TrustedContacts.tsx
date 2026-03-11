"use client";

import LocalPoliceOutlinedIcon from "@mui/icons-material/LocalPoliceOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import LocalFireDepartmentOutlinedIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";

type ContactItem = {
  name: string;
  unit: string;
  phone: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
};

const contacts: ContactItem[] = [
  {
    name: "Royal Malaysia Police",
    unit: "PDRM Emergency",
    phone: "999",
    icon: <LocalPoliceOutlinedIcon fontSize="small" />,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    name: "Ministry of Health Ambulance",
    unit: "Hospital Emergency",
    phone: "999",
    icon: <LocalHospitalOutlinedIcon fontSize="small" />,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    name: "Fire and Rescue Department",
    unit: "BOMBA",
    phone: "994",
    icon: <LocalFireDepartmentOutlinedIcon fontSize="small" />,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    name: "Civil Defence Force",
    unit: "APM Malaysia",
    phone: "991",
    icon: <HealthAndSafetyOutlinedIcon fontSize="small" />,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
];

export default function TrustedContacts() {
  return (
    <div className="rounded-2xl border border-black/5 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 border-b border-black/5 px-4 py-4">
        <span className="material-symbols-outlined text-primary">verified_user</span>
        <h3 className="text-md font-bold text-black">Trusted Contacts</h3>
      </div>

      <div className="flex flex-col">
        {contacts.map((contact, index) => (
          <div
            key={contact.name}
            className={`flex items-center gap-3 px-4 py-4 ${index !== contacts.length - 1 ? "border-b border-black/5" : ""}`}
          >
            <div className={`flex p-2 items-center justify-center rounded-full ${contact.iconBg} ${contact.iconColor}`}>
              {contact.icon}
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-bold text-[#1f2937]">{contact.name}</span>
              <span className="truncate text-xs text-foreground">{contact.unit}</span>
              <span className="text-sm font-semibold text-[#111827]">{contact.phone}</span>
            </div>

            <a
              href={`tel:${contact.phone}`}
              aria-label={`Call ${contact.name}`}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-textGrey transition hover:bg-black/5"
            >
              <PhoneOutlinedIcon fontSize="small" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
