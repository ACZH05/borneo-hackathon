const REGION_ALIAS_MAP: Record<string, string> = {
  johor: "Johor",
  kedah: "Kedah",
  kelantan: "Kelantan",
  "kuala lumpur": "Kuala Lumpur",
  labuan: "Labuan",
  melaka: "Melaka",
  malacca: "Melaka",
  "negeri sembilan": "Negeri Sembilan",
  pahang: "Pahang",
  perak: "Perak",
  perlis: "Perlis",
  "pulau pinang": "Pulau Pinang",
  penang: "Pulau Pinang",
  putrajaya: "Putrajaya",
  sabah: "Sabah",
  sarawak: "Sarawak",
  selangor: "Selangor",
  terengganu: "Terengganu",
  "my-01": "Johor",
  "my-02": "Kedah",
  "my-03": "Kelantan",
  "my-04": "Melaka",
  "my-05": "Negeri Sembilan",
  "my-06": "Pahang",
  "my-07": "Pulau Pinang",
  "my-08": "Perak",
  "my-09": "Perlis",
  "my-10": "Selangor",
  "my-11": "Terengganu",
  "my-12": "Sabah",
  "my-13": "Sarawak",
  "my-14": "Kuala Lumpur",
  "my-15": "Labuan",
  "my-16": "Putrajaya",
};

function normalizeRegionKey(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

export function normalizeMalaysiaState(value?: string | null) {
  const normalized = REGION_ALIAS_MAP[normalizeRegionKey(value)];
  return normalized ?? null;
}

export async function inferMalaysiaStateFromCoordinates(lat?: number | null, lng?: number | null) {
  if (
    typeof lat !== "number" ||
    !Number.isFinite(lat) ||
    typeof lng !== "number" ||
    !Number.isFinite(lng) ||
    !process.env.GOOGLE_MAPS_API_KEY
  ) {
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const results = Array.isArray(data?.results) ? data.results : [];

    for (const result of results) {
      const components = Array.isArray(result?.address_components)
        ? result.address_components
        : [];

      for (const component of components) {
        const longName =
          typeof component?.long_name === "string" ? component.long_name : null;
        const shortName =
          typeof component?.short_name === "string" ? component.short_name : null;

        const normalized = normalizeMalaysiaState(longName) ?? normalizeMalaysiaState(shortName);
        if (normalized) {
          return normalized;
        }
      }
    }
  } catch (error) {
    console.error("Failed to infer Malaysia state from coordinates:", error);
  }

  return null;
}
