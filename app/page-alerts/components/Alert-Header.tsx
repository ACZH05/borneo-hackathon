"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import AlertMode from "./Alert-Mode";
import AlertFilter from "./Alert-Filter";
import AlertItem from "./Alert-Item-List";
import AlertItemMap from "./Alert-Item-Map";
import { AlertItemInfo } from "@/app/api/alert/util/types";
import { useAlertsData } from "@/app/api/alert/util/useAlertsData";
import Skeleton from "@/app/components/Skeleton";

export default function AlertHeader() {
    const searchParams = useSearchParams();
    const [activeFilter, setActiveFilter] = useState("all"); // Active Filter State (Default to "All Threats")
    const [displayMode, setDisplayMode] = useState("list"); // "List" or "Map" Mode State (Default to "List")
    const [focusedAlert, setFocusedAlert] = useState<AlertItemInfo | null>(null); // Alert to zoom into on map.
    const alertRefs = useRef<Map<string, HTMLDivElement>>(new Map()); // Refs for scrolling to alert cards.
    
    const { alerts, isLoading } = useAlertsData();
    const skeletonCards = Array.from({ length: 4 });

    useEffect(() => {
        const alertId = searchParams.get("alert");
        if (!alertId || isLoading || alerts.length === 0) return;

        setDisplayMode("list");
        setActiveFilter("all");

        const scrollToAlert = () => {
            const el = alertRefs.current.get(alertId);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        };

        const timer = window.setTimeout(scrollToAlert, 100);
        return () => window.clearTimeout(timer);
    }, [alerts, isLoading, searchParams]);

    return (
        <div className="flex flex-col gap-10 p-10">
            <div className="flex flex-wrap gap-10 items-start justify-between">
                <div className="flex flex-col gap-10">
                    {/* --- Title --- */}
                    <h1 className="text-6xl font-bold">
                        <span>Active </span>
                        <span className=" text-primary">Alerts</span>
                    </h1>

                    {/* --- Description --- */}
                    <p className="text-xl text-textGrey">
                        Real-time threat monitoring and prioritization for Borneo territories.
                    </p>
                </div>

                {/* --- Display Mode Toggle (List / Map) --- */}
                <AlertMode displayMode={displayMode} setDisplayMode={setDisplayMode} />
            </div>
            
            {/* --- Filter --- */}
            <AlertFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />

            {/* --- Alert List or Map --- */}
            {
                displayMode === "list" 

                /* --- Alert List --- */
                ? ( 
                    <div className="flex flex-col gap-4">
                        {isLoading ? (
                            skeletonCards.map((_, index) => (
                                <div
                                  key={`alert-skeleton-${index}`}
                                  className="rounded-xl border border-foreground/10 bg-white p-5"
                                >
                                  <Skeleton className="h-5 w-40" />
                                  <Skeleton className="mt-4 h-4 w-64" />
                                  <Skeleton className="mt-2 h-4 w-48" />
                                  <div className="mt-4 flex justify-between">
                                    <Skeleton className="h-9 w-28 rounded-lg" />
                                    <Skeleton className="h-9 w-36 rounded-lg" />
                                  </div>
                                </div>
                              ))
                        ) : alerts.length === 0 ? (
                            <div className="text-center font-bold text-textGrey py-10">No active alerts at this time.</div>
                        ) : (() => {
                            const filtered = alerts.filter((item) => activeFilter === "all" || (activeFilter === "other" ? !["flood", "landslide", "tidal"].includes(item.hazardType) : item.hazardType === activeFilter));
                            return filtered.length === 0 
                                ? <div className="text-center font-bold text-textGrey py-10">No alerts found for this category.</div>
                                : filtered.map((item, index) => {
                                const key = item.id || `${item.lat}-${item.lng}-${index}`;
                                return (
                                    <div key={key} ref={(el) => { if (el) alertRefs.current.set(key, el); }}>
                                        <AlertItem {...item} onMapClick={() => {
                                            setFocusedAlert(item);
                                            setDisplayMode("map");
                                        }} />
                                    </div>
                                );
                            });
                        })()}
                    </div>
                ) 

                /* --- Alert Map --- */
                : <AlertItemMap alerts={alerts} activeFilter={activeFilter} focusedAlert={focusedAlert} onPinClick={(alert) => {
                    const key = alert.id || `${alert.lat}-${alert.lng}-${alerts.indexOf(alert)}`;
                    setDisplayMode("list");
                    setFocusedAlert(null); // Scroll to the alert card after switching to list mode
                    setTimeout(() => {
                        const el = alertRefs.current.get(key);
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                    }, 100);
                }} />
            }
        </div>
    );
}
