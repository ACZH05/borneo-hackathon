"use client";

import React from "react";
import { useAlertsData } from "@/api/alert/util/useAlertsData";

export default function PlatformStatus() {
    const { stats } = useAlertsData();

    return (
        <div className="flex flex-col gap-5 rounded-2xl bg-linear-to-br from-primary/95 to-primary p-4">
            <h2 className="text-xs text-[#DCFCE7] tracking-wider font-light">PLATFORM STATUS</h2>
            
            <div className="flex items-between justify-between gap-2">
                <span className="text-sm text-[#F0FDF4] font-extralight">Alert Level</span>
                <span className="text-sm text-white font-semibold rounded-2xl bg-white/20 px-2">{stats.alertLevel}</span>
            </div>

            <div className="flex items-between justify-between gap-2">
                <span className="text-sm text-[#F0FDF4] font-extralight">Active Incidents</span>
                <span className="text-sm text-white font-semibold">{stats.activeIncidents}</span>
            </div>

            <hr className="border-white/10"/>
            
            <div className="flex items-between justify-between gap-2">
                <span className="text-xs text-[#DCFCE7] font-extralight">Last Update</span>
                <span className="text-right text-xs text-[#DCFCE7] font-extralight wrap-break-word">{stats.lastUpdate}</span>
            </div>
        </div>
    );
}