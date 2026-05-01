export const MALAYSIA_STATE_LABELS = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Kuala Lumpur",
  "Labuan",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Perak",
  "Perlis",
  "Pulau Pinang",
  "Putrajaya",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
] as const;

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

export function normalizeMalaysiaStateLabel(value?: string | null) {
  const normalized = REGION_ALIAS_MAP[normalizeRegionKey(value)];
  return normalized ?? null;
}
