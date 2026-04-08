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
    stateOptions: { label: string; flag: string }[];
    onStateChange: (value: string) => void;
}

export default function AlertFilter({
    activeFilter,
    onFilterChange,
    activeState,
    stateOptions,
    onStateChange,
}: AlertFilterProps) {
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
    const [isStateMenuOpen, setIsStateMenuOpen] = useState(false);
    const categoryMenuRef = useRef<HTMLDivElement | null>(null);
    const stateMenuRef = useRef<HTMLDivElement | null>(null);
    const activeCategory = filterOptions.find((option) => option.value === activeFilter) ?? filterOptions[0];
    const activeStateLabel = activeState === "all" ? "All State" : activeState;
    const activeStateFlag = activeState === "all" ? "/assets/flag-malaysia.svg" : stateOptions.find((state) => state.label === activeState)?.flag ?? "/assets/flag-malaysia.svg";

    useEffect(() => {
        if (!isCategoryMenuOpen && !isStateMenuOpen) {
            return;
        }

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (!categoryMenuRef.current?.contains(target)) {
                setIsCategoryMenuOpen(false);
            }

            if (!stateMenuRef.current?.contains(target)) {
                setIsStateMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isCategoryMenuOpen, isStateMenuOpen]);

    return (
        <div className="flex flex-row flex-wrap gap-4">
            {/* --- Alert Categories --- */}
            <div className="flex flex-wrap items-center gap-3">
                <div ref={categoryMenuRef} className="relative min-w-72">
                    <button
                        id="category-filter-trigger"
                        type="button"
                        onClick={() => setIsCategoryMenuOpen((open) => !open)}
                        className="flex w-full items-center justify-between rounded-[1.75rem] border border-foreground/10 bg-linear-to-r from-white to-primary/5 px-4 py-3 text-left shadow-sm transition hover:border-primary/30 hover:shadow-md"
                    >
                        <span className="flex items-center gap-3">
                            <span className="material-symbols-outlined" style={{ color: activeCategory.color, fontSize: 22 }}>
                                {activeCategory.icon}
                            </span>
                            <span className="flex flex-col">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-textGrey">
                                    Alert Category
                                </span>
                                <span className="text-sm font-semibold text-foreground">
                                    {activeCategory.label}
                                </span>
                            </span>
                        </span>
                        <span className={`material-symbols-outlined text-textGrey transition ${isCategoryMenuOpen ? "rotate-180 text-primary" : ""}`}>
                            expand_more
                        </span>
                    </button>

                    {isCategoryMenuOpen && (
                        <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-20 overflow-hidden rounded-4xl border border-foreground/10 bg-white shadow-2xl">
                            <div className="max-h-72 overflow-y-auto p-2">
                                {filterOptions.map((option) => {
                                    const isActive = activeFilter === option.value;

                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => {
                                                onFilterChange(option.value);
                                                setIsCategoryMenuOpen(false);
                                            }}
                                            className={`flex w-full items-center justify-between rounded-full px-4 py-3 text-left text-sm font-semibold transition ${
                                                isActive
                                                    ? "bg-primary text-surface shadow-sm"
                                                    : "text-foreground hover:bg-primary/8"
                                            }`}
                                        >
                                            <span className="flex items-center gap-3">
                                                <span className="material-symbols-outlined" style={{ color: option.color, fontSize: 18 }}>
                                                    {option.icon}
                                                </span>
                                                <span>{option.label}</span>
                                            </span>
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

            {/* --- State Filter Dropdown --- */}
            <div className="flex flex-wrap items-center gap-3">
                <div ref={stateMenuRef} className="relative min-w-72">
                    <button
                        id="state-filter-trigger"
                        type="button"
                        onClick={() => setIsStateMenuOpen((open) => !open)}
                        className="flex w-full items-center justify-between rounded-[1.75rem] border border-foreground/10 bg-linear-to-r from-white to-primary/5 px-4 py-3 text-left shadow-sm transition hover:border-primary/30 hover:shadow-md"
                    >
                        <span className="flex items-center gap-3">
                            <img src={activeStateFlag} className="w-5" />
                            <span className="flex flex-col">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-textGrey">
                                    Filter by State
                                </span>
                                <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <span>{activeStateLabel}</span>
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
                                    const isActive = activeState === (typeof state === "string" ? state : state.label);
                                    const label = typeof state === "string" ? "All State" : state.label;
                                    const flag = typeof state === "string" ? "/assets/flag-malaysia.svg" : state.flag;

                                    return (
                                        <button
                                            key={typeof state === "string" ? state : state.label}
                                            type="button"
                                            onClick={() => {
                                                onStateChange(typeof state === "string" ? state : state.label);
                                                setIsStateMenuOpen(false);
                                            }}
                                            className={`flex w-full items-center justify-between rounded-full px-4 py-3 text-left text-sm font-semibold transition ${
                                                isActive
                                                    ? "bg-primary text-surface shadow-sm"
                                                    : "text-foreground hover:bg-primary/8"
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <img src={flag} className="w-5" />
                                                <span>{label}</span>
                                            </span>
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
