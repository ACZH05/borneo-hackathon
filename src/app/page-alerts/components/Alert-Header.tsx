"use client";

import { useState } from "react";
import AlertMode from "./Alert-Mode";
import AlertFilter from "./Alert-Filter";
import AlertItem from "./Alert-Item-List";
import AlertItemMap from "./Alert-Item-Map";
import { AlertItemList } from "./Alert-Item-Info";

export default function AlertHeader() {
    const [activeFilter, setActiveFilter] = useState("all"); // Active Filter State (Default to "All Threats")
    const [displayMode, setDisplayMode] = useState("list"); // "List" or "Map" Mode State (Default to "List")

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
                        {AlertItemList.filter((item) => activeFilter === "all" || item.category === activeFilter).map((item) => (
                            <AlertItem key={item.topic} {...item} />
                        ))}
                    </div>
                ) 

                /* --- Alert Map --- */
                : <AlertItemMap />
            }
        </div>
    );
}