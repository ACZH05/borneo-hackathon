"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertApiResponse, AlertItemInfo, AlertStats } from "@/app/api/alert/util/types";

const ALERT_CACHE_TTL_MS = 30_000;

let alertsCache: AlertItemInfo[] | null = null;
let cacheUpdatedAt = 0;
let inflightRequest: Promise<AlertItemInfo[]> | null = null;

function getAlertStats(alerts: AlertItemInfo[]): AlertStats {
  const latestAlert = alerts[0] ?? null;

  return {
    latestAlert,
    alertLevel: latestAlert ? latestAlert.severity.toUpperCase() : "N/A",
    activeIncidents: alerts.length,
    lastUpdate: latestAlert ? `${latestAlert.date} ${latestAlert.time}` : "N/A",
    topTwoAlerts: alerts.slice(0, 2),
  };
}

async function fetchAllAlerts(force = false): Promise<AlertItemInfo[]> {
  const now = Date.now();
  const isCacheValid =
    !force &&
    alertsCache !== null &&
    now - cacheUpdatedAt < ALERT_CACHE_TTL_MS;

  if (isCacheValid) {
    return alertsCache ?? [];
  }

  if (inflightRequest) {
    return inflightRequest;
  }

  inflightRequest = (async () => {
    const response = await fetch("/api/alert?status=published", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to fetch alerts");
    }

    const data: AlertApiResponse = await response.json();
    if (!data.success || !Array.isArray(data.alerts)) {
      throw new Error("Invalid alert response");
    }

    alertsCache = data.alerts.filter((alert) => alert.status === "published");
    cacheUpdatedAt = Date.now();
    return alertsCache;
  })();

  try {
    return await inflightRequest;
  } finally {
    inflightRequest = null;
  }
}

export function useAlertsData() {
  const [alerts, setAlerts] = useState<AlertItemInfo[]>(alertsCache ?? []);
  const [isLoading, setIsLoading] = useState(alertsCache === null);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = useCallback(async (force = false) => {
    if (alertsCache === null || force) {
      setIsLoading(true);
    }

    try {
      const nextAlerts = await fetchAllAlerts(force);
      setAlerts(nextAlerts);
      setError(null);
    } catch (fetchError) {
      console.error("Failed to fetch alerts:", fetchError);
      setError("Failed to load alerts");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAlerts(false);
  }, [loadAlerts]);

  const stats = useMemo(() => getAlertStats(alerts), [alerts]);

  return {
    alerts,
    stats,
    isLoading,
    error,
    refresh: () => loadAlerts(true),
  };
}
