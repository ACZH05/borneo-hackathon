/* --- Structure for Each Alert Item Info (DEMO) --- */
export interface AlertItemInfo {
    severity: "priority" | "warning" | "monitor";
    hazardType: string; // e.g., "flood", "landslide", "tidal"
    title: string;
    body: string;       // Description of Alert
    date: string;
    time: string; 
    regionCode: string; // Location Name
    lat: number;        // Latitude for Map Display
    lng: number;        // Longitude for Map Display
}

/* --- Alert Item Info List (DEMO) --- */
export const AlertItemList: AlertItemInfo[] = [
    {
        severity: "priority",
        hazardType: "flood",
        title: "Flood Advisory: Mahakam Basin",
        body: "Water levels are rising in the Mahakam river basin. Community Shelter 4 (Sector 4) and Shelter 7 are open with food and medical supplies. Please move to higher ground calmly.",
        date: "2026-03-05",
        time: "10:42 AM",
        regionCode: "Samarinda Area",
        lat: 0.5025,
        lng: 117.1539
    },
    {
        severity: "warning",
        hazardType: "landslide",
        title: "Landslide Caution: Highlands",
        body: "Soil stability is currently low due to rain. Avoid steep slopes.",
        date: "2026-03-04",
        time: "10:42 AM",
        regionCode: "Ranau District, Sabah",
        lat: 5.9833,
        lng: 116.0667
    },
    {
        severity: "monitor",
        hazardType: "tidal",
        title: "Tidal Surge: Tarakan Coast",
        body: "Elevated tides expected between 02:00 and 05:00. Small craft should avoid coastal areas. Coastal defense systems are on standby.",
        date: "2026-02-02",
        time: "10:42 AM",
        regionCode: "Tarakan City, North Kalimantan",
        lat: 3.3000,
        lng: 117.3000
    }
];