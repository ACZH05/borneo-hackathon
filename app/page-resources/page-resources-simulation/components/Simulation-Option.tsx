"use client";

import { useState } from "react";

export const simulationOptions: { label: string; icon: string; color: string; value: string; description: string }[] = [
    { 
        label: "Flood", icon: "water_drop", color: "#3B82F6", value: "flood",
        description: "Flood is a natural disaster that occurs when water overflows onto land that is usually dry."
    },
    { 
        label: "Landslide", icon: "landslide", color: "#D97706", value: "landslide", 
        description: "A landslide is the movement of a large mass of rock, earth, or debris down a slope. It can be triggered by heavy rainfall, earthquakes, or human activities." 
    },
    { 
        label: "Tidal", icon: "tsunami", color: "#22D3EE", value: "tidal", 
        description: "Tidal waves are large ocean waves caused by the gravitational pull of the moon and sun. They can cause significant damage when they reach the shore." 
    }
];

interface SimulationOptionProps {
    setIsSimulating: (value: boolean) => void;
    setSelectedHazard: (value: string) => void;
}

export default function SimulationOption({ setIsSimulating, setSelectedHazard }: SimulationOptionProps) {
    const [target, setTarget] = useState<string>("");
    const selectedOption = simulationOptions.find(opt => opt.value === target);

    return (
        <div>
            {/* --- Simulation Options --- */}
            <div className="flex flex-wrap gap-5 p-10">
                {simulationOptions.map((option) => (
                    <div
                        key={option.value}
                        onClick={() => setTarget(option.value)}
                        className={`flex flex-col flex-1 items-center justify-center gap-6 rounded-xl shadow-2xl p-8 min-w-40 transition-transform duration-200 ${
                            target === option.value 
                                ? "bg-primary scale-[0.94]" 
                                : "bg-white active:scale-[0.96] hover:scale-[0.98]"
                        }`}
                    >
                        {/* --- Icon --- */}
                        <div className="flex items-center gap-2 p-4 rounded-full" style={{ backgroundColor: `${target === option.value ? "transparent" : option.color + "20"}` }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 100, color: `${target === option.value ? "white" : option.color}` }}>{option.icon}</span>
                        </div>

                        {/* --- Title --- */}
                        <span className={`text-xl font-bold ${target === option.value ? "text-white" : "text-gray-800"}`}>{option.label}</span>
                    </div>
                ))}
            </div>

            {/* --- Description & Simulation Button --- */}
            <div className="flex flex-col items-center justify-center gap-6"> 
                {/* --- Description or Warning Message --- */}
                {selectedOption 
                    ? (
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 px-4 py-2 rounded-lg animate-fade-in">
                            <span className="material-symbols-outlined text-base">{selectedOption.icon}</span>
                            <span className="text-sm font-semibold text-justify">{selectedOption.description}</span>
                        </div>
                    ) 
                    : (
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 px-4 py-2 rounded-lg animate-fade-in">
                            <span className="material-symbols-outlined text-base">info</span>
                            <span className="text-sm font-semibold text-justify">Please select an emergency scenario above to proceed.</span>
                        </div>
                    )}

                {/* --- Button --- */}
                <button 
                    onClick={() => {
                        setSelectedHazard(target);
                        setIsSimulating(true);
                    }}
                    disabled={!target}
                    className={`py-3 px-8 rounded-full font-bold transition-all duration-300 ${
                        target 
                            ? "bg-primary text-white active:scale-[0.98]" 
                            : "bg-primary/70 text-white/90 cursor-not-allowed"
                    }`}
                >
                    Start Simulation
                </button>
            </div>
        </div>
    );
}