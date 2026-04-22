import type { Alert } from "@prisma/client";
import { inferMalaysiaStateFromCoordinates, normalizeMalaysiaState } from "@/app/api/alert/util/malaysiaState";
import { AlertItemInfo, AlertSource, isAlertSource } from "@/app/api/alert/util/types";

function normalizeAlertSource(source?: string | null, notes?: string | null): AlertSource {
  if (isAlertSource(source)) {
    return source;
  }

  if (notes?.trim() === "Generated via Aegis System") {
    return "user_report";
  }

  return "third_party_api";
}

function normalizeCoordinate(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export async function serializeAlert(alert: Alert): Promise<AlertItemInfo> {
  const createdAt = new Date(alert.createdAt);
  const normalizedState =
    normalizeMalaysiaState(alert.regionCode) ??
    (await inferMalaysiaStateFromCoordinates(alert.lat, alert.lng));

  return {
    id: alert.id,
    severity: alert.severity,
    hazardType: alert.hazardType,
    title: alert.title,
    body: alert.body,
    date: createdAt.toISOString().split("T")[0],
    time: createdAt.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
    createdAt: createdAt.toISOString(),
    regionCode: alert.regionCode,
    stateName: normalizedState,
    lat: normalizeCoordinate(alert.lat),
    lng: normalizeCoordinate(alert.lng),
    source: normalizeAlertSource(alert.source, alert.notes),
    status: alert.status === "draft" ? "draft" : "published",
  };
}
