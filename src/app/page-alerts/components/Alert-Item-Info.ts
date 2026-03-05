/* --- Structure for Each Alert Item Info (DEMO) --- */
export interface AlertItemInfo {
    priority: "priority" | "warning" | "monitor";
    category: string;
    topic: string;
    description: string;
    date: string;
    time: string;
    location: string;
}

/* --- Alert Item Info List (DEMO) --- */
export const AlertItemList: AlertItemInfo[] = [
    {
        priority: "priority",
        category: "flood",
        topic: "Flood Advisory: Mahakam Basin",
        description: "Water levels are rising in the Mahakam river basin. Community Shelter 4 (Sector 4) and Shelter 7 are open with food and medical supplies. Please move to higher ground calmly.",
        date: "2026-03-05",
        time: "10:42 AM",
        location: "Samarinda Area"
    },
    {
        priority: "warning",
        category: "landslide",
        topic: "Landslide Caution: Highlands",
        description: "Soil stability is currently low due to rain. Avoid steep slopes.",
        date: "2026-03-04",
        time: "10:42 AM",
        location: "Ranau District, Sabah"
    },
    {
        priority: "monitor",
        category: "tidal",
        topic: "Tidal Surge: Tarakan Coast",
        description: "Elevated tides expected between 02:00 and 05:00. Small craft should avoid coastal areas. Coastal defense systems are on standby.",
        date: "2026-02-02",
        time: "10:42 AM",
        location: "Tarakan City, North Kalimantan"
    }
];