// --- Filter Options for Alert Categories ---
export const filterOptions: { label: string; icon: string; color: string; value: string }[] = [
    { label: "All Threats", icon: "category", color: "#95D5B2", value: "all" },
    { label: "Flood", icon: "water_drop", color: "#3B82F6", value: "flood" },
    { label: "Landslide", icon: "landslide", color: "#D97706", value: "landslide" },
    { label: "Tidal", icon: "tsunami", color: "#22D3EE", value: "tidal" },
];

interface AlertFilterProps {
    activeFilter: string;
    onFilterChange: (value: string) => void;
}

export default function AlertFilter({ activeFilter, onFilterChange }: AlertFilterProps) {
    return (
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
    );
}