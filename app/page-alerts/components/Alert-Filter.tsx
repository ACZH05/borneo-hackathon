import { useEffect, useRef, useState } from "react";

// --- Filter Options for Alert Categories ---
export const filterOptions: { label: string; icon: string; color: string; value: string }[] = [
    { label: "All Threats", icon: "category", color: "#95D5B2", value: "all" },
    { label: "Flood", icon: "water_drop", color: "#3B82F6", value: "flood" },
    { label: "Landslide", icon: "landslide", color: "#D97706", value: "landslide" },
    { label: "Tidal", icon: "tsunami", color: "#22D3EE", value: "tidal" },
    { label: "Other", icon: "warning", color: "#EF4444", value: "other" },
];

interface AlertFilterProps {
    activeFilter: string;
    onFilterChange: (value: string) => void;
    activeState: string;
    stateOptions: string[];
    onStateChange: (value: string) => void;
}

export default function AlertFilter({
    activeFilter,
    onFilterChange,
    activeState,
    stateOptions,
    onStateChange,
}: AlertFilterProps) {
    const [isStateMenuOpen, setIsStateMenuOpen] = useState(false);
    const stateMenuRef = useRef<HTMLDivElement | null>(null);
    const activeStateLabel = activeState === "all" ? "All state" : activeState;

    useEffect(() => {
        if (!isStateMenuOpen) {
            return;
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (!stateMenuRef.current?.contains(event.target as Node)) {
                setIsStateMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isStateMenuOpen]);

    return (
        <div className="flex flex-col gap-4">
            <nav className="flex items-center gap-4 overflow-x-auto whitespace-nowrap">
                {filterOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => onFilterChange(option.value)}
                        className={`flex items-center justify-center gap-2 rounded-full px-5 py-2 font-semibold transition-all ease-in-out duration-300 ${
                            activeFilter === option.value
                            ? "bg-primary text-surface"                            // Active Link Style: Green background with white text.
                            : "bg-accent/10 text-textGrey hover:bg-secondary/20" // Inactive Link Style: Grey text that turns light green on hover.
                        }`}
                    > 
                        <span className="material-symbols-outlined" style={{color: option.color}}>{option.icon}</span>
                        <span>{option.label}</span>
                    </button>
                ))}
            </nav>

            <div className="flex flex-wrap items-center gap-3">
                <div ref={stateMenuRef} className="relative min-w-72">
                    <button
                        id="state-filter-trigger"
                        type="button"
                        onClick={() => setIsStateMenuOpen((open) => !open)}
                        className="flex w-full items-center justify-between rounded-[1.75rem] border border-foreground/10 bg-linear-to-r from-white to-primary/5 px-4 py-3 text-left shadow-sm transition hover:border-primary/30 hover:shadow-md"
                    >
                        <span className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary/80">
                                location_city
                            </span>
                            <span className="flex flex-col">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-textGrey">
                                    Filter by State
                                </span>
                                <span className="text-sm font-semibold text-foreground">
                                    {activeStateLabel}
                                </span>
                            </span>
                        </span>
                        <span className={`material-symbols-outlined text-textGrey transition ${isStateMenuOpen ? "rotate-180 text-primary" : ""}`}>
                            expand_more
                        </span>
                    </button>

                    {isStateMenuOpen && (
                        <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-20 overflow-hidden rounded-4xl border border-foreground/10 bg-white shadow-2xl">
                            <div className="max-h-72 overflow-y-auto p-2">
                                {["all", ...stateOptions].map((state) => {
                                    const isActive = activeState === state;
                                    const label = state === "all" ? "All state" : state;

                                    return (
                                        <button
                                            key={state}
                                            type="button"
                                            onClick={() => {
                                                onStateChange(state);
                                                setIsStateMenuOpen(false);
                                            }}
                                            className={`flex w-full items-center justify-between rounded-full px-4 py-3 text-left text-sm font-semibold transition ${
                                                isActive
                                                    ? "bg-primary text-surface shadow-sm"
                                                    : "text-foreground hover:bg-primary/8"
                                            }`}
                                        >
                                            <span>{label}</span>
                                            {isActive && (
                                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                                                    check
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
