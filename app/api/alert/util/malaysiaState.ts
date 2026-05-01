import { normalizeMalaysiaStateLabel } from "@/app/api/alert/util/malaysiaStateList";

export function normalizeMalaysiaState(value?: string | null) {
  return normalizeMalaysiaStateLabel(value);
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
