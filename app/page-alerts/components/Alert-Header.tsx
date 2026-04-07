"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import AlertMode from "./Alert-Mode";
import AlertFilter from "./Alert-Filter";
import AlertItem from "./Alert-Item-List";
import AlertItemMap from "./Alert-Item-Map";
import { AlertItemInfo } from "@/app/api/alert/util/types";
import { useAlertsData } from "@/app/api/alert/util/useAlertsData";
import Skeleton from "@/app/components/Skeleton";

const ALERTS_PER_PAGE = 5;

export default function AlertHeader() {
    const searchParams = useSearchParams();
    const [activeFilter, setActiveFilter] = useState("all"); // Active Filter State (Default to "All Threats")
    const [displayMode, setDisplayMode] = useState("list"); // "List" or "Map" Mode State (Default to "List")
    const [focusedAlert, setFocusedAlert] = useState<AlertItemInfo | null>(null); // Alert to zoom into on map.
    const [currentPage, setCurrentPage] = useState(1);
    const alertRefs = useRef<Map<string, HTMLDivElement>>(new Map()); // Refs for scrolling to alert cards.
    
    const { alerts, isLoading } = useAlertsData();
    const skeletonCards = Array.from({ length: 4 });
    const filteredAlerts = useMemo(
        () =>
            alerts.filter((item) =>
                activeFilter === "all" ||
                (activeFilter === "other"
                    ? !["flood", "landslide", "tidal"].includes(item.hazardType)
                    : item.hazardType === activeFilter)
            ),
        [activeFilter, alerts]
    );
    const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / ALERTS_PER_PAGE));
    const paginatedAlerts = useMemo(() => {
        const startIndex = (currentPage - 1) * ALERTS_PER_PAGE;
        return filteredAlerts.slice(startIndex, startIndex + ALERTS_PER_PAGE);
    }, [currentPage, filteredAlerts]);
    const visiblePages = useMemo(() => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, index) => index + 1);
        }

        const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
        return Array.from({ length: 5 }, (_, index) => startPage + index);
    }, [currentPage, totalPages]);

    useEffect(() => {
        const alertId = searchParams.get("alert");
        if (!alertId || isLoading || alerts.length === 0) return;

        setDisplayMode("list");
        setActiveFilter("all");

        const alertIndex = alerts.findIndex((item, index) => (item.id || `${item.lat}-${item.lng}-${index}`) === alertId);
        if (alertIndex >= 0) {
            setCurrentPage(Math.floor(alertIndex / ALERTS_PER_PAGE) + 1);
        }

        const scrollToAlert = () => {
            const el = alertRefs.current.get(alertId);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        };

        const timer = window.setTimeout(scrollToAlert, 100);
        return () => window.clearTimeout(timer);
    }, [alerts, isLoading, searchParams]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

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
                        ) : filteredAlerts.length === 0 ? (
                            <div className="text-center font-bold text-textGrey py-10">No alerts found for this category.</div>
                        ) : (
                            <>
                                {paginatedAlerts.map((item, index) => {
                                const absoluteIndex = (currentPage - 1) * ALERTS_PER_PAGE + index;
                                const key = item.id || `${item.lat}-${item.lng}-${absoluteIndex}`;
                                return (
                                    <div key={key} ref={(el) => { if (el) alertRefs.current.set(key, el); }}>
                                        <AlertItem {...item} onMapClick={() => {
                                            setFocusedAlert(item);
                                            setDisplayMode("map");
                                        }} />
                                    </div>
                                );
                                })}

                                <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-foreground/10 bg-white px-4 py-4 shadow-sm">
                                    <span className="text-sm font-semibold text-textGrey">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                            disabled={currentPage === 1}
                                            className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-foreground/10 px-3 text-sm font-bold text-foreground transition hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            {"<"}
                                        </button>
                                        {visiblePages.map((pageNumber) => (
                                            <button
                                                key={pageNumber}
                                                type="button"
                                                onClick={() => setCurrentPage(pageNumber)}
                                                className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-bold transition ${
                                                    pageNumber === currentPage
                                                        ? "bg-primary text-white"
                                                        : "border border-foreground/10 text-foreground hover:bg-foreground/5"
                                                }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                            disabled={currentPage === totalPages}
                                            className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-foreground/10 px-3 text-sm font-bold text-foreground transition hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            {">"}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
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
