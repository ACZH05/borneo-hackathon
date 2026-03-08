"use client";

import { useState, useEffect } from "react";
import AlertMode from "./Alert-Mode";
import AlertFilter from "./Alert-Filter";
import AlertItem from "./Alert-Item-List";
import AlertItemMap from "./Alert-Item-Map";
import { AlertItemInfo } from "./Alert-Item-Info"; // Import the type, not the dummy data

export default function AlertHeader() {
    const [activeFilter, setActiveFilter] = useState("all"); // Active Filter State (Default to "All Threats")
    const [displayMode, setDisplayMode] = useState("list"); // "List" or "Map" Mode State (Default to "List")
    
    // --- NEW: Live Database States ---
    const [alerts, setAlerts] = useState<AlertItemInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- NEW: Fetch from API on Load ---
    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const response = await fetch('/api/alert');
                const data = await response.json();
                
                if (data.success) {
                    setAlerts(data.alerts); // Load real data into state!
                }
            } catch (error) {
                console.error("Failed to fetch alerts:", error);
            } finally {
                setIsLoading(false); // Turn off loading spinner.
            }
        };

        fetchAlerts();
    }, []);

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
                            <div className="text-center font-bold text-textGrey py-10">Loading active alerts...</div>
                        ) : alerts.length === 0 ? (
                            <div className="text-center font-bold text-textGrey py-10">No active alerts at this time.</div>
                        ) : (
                            alerts.filter((item) => activeFilter === "all" || item.hazardType === activeFilter).map((item, index) => (
                                // Added fallback to index for the key just in case ID is missing
                                <AlertItem key={(item as any).id || index} {...item} />
                            ))
                        )}
                    </div>
                ) 

                /* --- Alert Map --- */
                : <AlertItemMap />
            }
        </div>
    );
}