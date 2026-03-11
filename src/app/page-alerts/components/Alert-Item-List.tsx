"use client";

import { filterOptions } from "@/app/page-alerts/components/Alert-Filter";
import { AlertItemInfo } from "@/app/api/alert/util/types";
import { formatAlertBody } from "@/app/api/alert/util/formatAlertBody";
import MapDisplay from "@/app/api/map/route";

export default function AlertItem(item: AlertItemInfo & { onMapClick?: () => void }) {
    // --- Color Scheme Based on Priority ---
    let cardColor: string;
    let textColor: string;
    let priorityBackground: string;
    switch (item.severity) {
        case "priority": cardColor = "border-priority"; textColor = "text-priority"; priorityBackground = "bg-priority/10"; break;
        case "warning":  cardColor = "border-warning";  textColor = "text-warning";  priorityBackground = "bg-warning/10";  break;
        case "monitor":  cardColor = "border-monitor";  textColor = "text-monitor";  priorityBackground = "bg-monitor/10";  break;
        default:         cardColor = "border-gray-300"; textColor = "text-gray-300"; priorityBackground = "bg-gray-300/10"; break;
    }

    // --- Date Time Formatting ---
    const dataToday: Date = new Date();
    const dateYesterday = new Date();
    dateYesterday.setDate(dataToday.getDate() - 1);
    let displayDate: string = item.date + ", " + item.time; // Default to original date and time.
    if (item.date === `${dataToday.getFullYear()}-${String(dataToday.getMonth() + 1).padStart(2, '0')}-${String(dataToday.getDate()).padStart(2, '0')}`) // Check if the alert is from today.
        displayDate = `Today, ${item.time}`;
    if (item.date === `${dateYesterday.getFullYear()}-${String(dateYesterday.getMonth() + 1).padStart(2, '0')}-${String(dateYesterday.getDate()).padStart(2, '0')}`) // Check if the alert is from yesterday.
        displayDate = `Yesterday, ${item.time}`;

    // --- Category Matching ---
    const category = filterOptions.find(opt => opt.value === item.hazardType);

    return (
        <div className={`flex flex-wrap items-stretch justify-center gap-6 rounded-lg border-l-10 ${cardColor} p-6 shadow`}>
            {/* --- Left Map --- */}
            <div
                onClick={() => item.onMapClick?.()}
                className="flex items-center justify-center relative rounded-lg bg-foreground/10 min-h-42 w-80 cursor-pointer"
            >
                {/* Expand Icon */}
                <div className="flex items-center justify-center absolute top-2 right-2 bg-black/50 rounded-md p-0.5 z-10">
                    <span className="material-symbols-outlined text-surface" style={{ fontSize: 14 }}>zoom_out_map</span>
                </div>
                
                {/* Map Content */}
                <div className="pointer-events-none w-full h-full">
                    <MapDisplay latitude={item.lat} longitude={item.lng} />
                </div>
            </div>

            {/* --- Right Alert Info --- */}
            <div className="flex flex-col flex-1 gap-5 justify-between">
                {/* --- Right Top --- */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        {/* --- Priority --- */}
                        <span className={`inline-flex items-center gap-1 rounded-full ${priorityBackground} px-3 py-1 text-xs font-extrabold ${textColor}`}>
                            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>warning</span>
                            <span className="uppercase">{item.severity}</span>
                        </span>

                        {/* --- Date Time --- */}
                        <span className="text-xs text-textGrey/60">{displayDate ?? `${item.date}, ${item.time}`}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* --- Category (Icon) --- */}
                        <span className="material-symbols-outlined" style={{ color: category?.color }}>{category?.icon ?? "warning"}</span>
                        
                        {/* --- Topic --- */}
                        <span className="text-2xl font-semibold text-textBlack">{item.title}</span>
                    </div>

                    {/* --- Description --- */}
                    <p className="text-justify text-xs text-textGrey whitespace-pre-line">{formatAlertBody(item.body)}</p>
                </div>

                {/* --- Right Bottom --- */}
                <div>
                    {/* --- Horizontal Divider --- */}
                    <hr className="border-textGrey/10"/>

                    {/* --- Location --- */}
                    <div className="flex items-center gap-6 mt-2">
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>place</span>
                            <span className="text-xs text-textGrey/80">{item.regionCode}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>gps_fixed</span>
                            <span className="text-xs text-textGrey/80">{item.lat}, {item.lng}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}