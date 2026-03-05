interface AlertModeProps {
    displayMode: string;
    setDisplayMode: (mode: string) => void;
}

export default function AlertMode({ displayMode, setDisplayMode }: AlertModeProps) {
    return (
        <nav className="flex items-center bg-accent/10 rounded-xl p-1">
            <button 
                onClick={() => setDisplayMode("list")}
                className={`flex items-center gap-2 rounded-xl px-6 py-2 font-semibold transition-all ease-in-out duration-300 ${
                    displayMode === "list"
                    ? "bg-primary text-surface"                // Active Link Style: Green background with white text.
                    : "text-textGrey/60 hover:bg-secondary/20" // Inactive Link Style: Grey text that turns light green on hover.
                }`}
            >
                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>list</span>
                <span>List</span>
            </button>

            <button 
                onClick={() => setDisplayMode("map")}
                className={`flex items-center gap-2 rounded-xl px-6 py-2 font-semibold transition-all ease-in-out duration-300 ${
                    displayMode === "map"
                    ? "bg-primary text-surface"                // Active Link Style: Green background with white text.
                    : "text-textGrey/60 hover:bg-secondary/20" // Inactive Link Style: Grey text that turns light green on hover.
                }`}
            >
                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>map</span>
                <span>Map</span>
            </button>
        </nav>
    );
}