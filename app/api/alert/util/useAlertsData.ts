"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertItemInfo, AlertApiResponse, AlertStats } from "@/app/api/alert/util/types";

const ALERT_CACHE_TTL_MS = 30_000;

let alertsCache: AlertItemInfo[] | null = null;
let cacheUpdatedAt = 0;
let inflightRequest: Promise<AlertItemInfo[]> | null = null;

// --- Compute Alert Statistics ---
// This function derives key statistics from the list of alerts, such as the latest alert, overall alert level, number of active incidents, last update time and the top two most recent alerts.
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

// --- Read All Alerts ---
async function fetchAllAlerts(force = false): Promise<AlertItemInfo[]> {
  const now = Date.now();
  const isCacheValid = !force && alertsCache !== null && now - cacheUpdatedAt < ALERT_CACHE_TTL_MS;

  if (isCacheValid) {
    return alertsCache ?? [];
  }

  if (inflightRequest) {
    return inflightRequest;
  }

  inflightRequest = (async () => {
    const response = await fetch("/api/alert");
    if (!response.ok) {
      throw new Error("Failed to fetch alerts");
    }

    const data: AlertApiResponse = await response.json();
    if (!data.success || !Array.isArray(data.alerts)) {
      throw new Error("Invalid alert response");
    }

    alertsCache = data.alerts;
    cacheUpdatedAt = Date.now();
    return alertsCache;
  })();

  try {
    return await inflightRequest;
  } finally {
    inflightRequest = null;
  }
}

// --- Custom Hook to Use Alerts Data ---
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
    alerts,                          // List of all alerts.
    stats,                           // Computed statistics based on current alerts (latest alert, alert level, active incidents, last update, top 2 alerts).
    isLoading,                       // Loading state for initial fetch or forced refresh.
    error,                           // Error message if fetching fails.
    refresh: () => loadAlerts(true), // Function to force refresh alerts data, bypassing cache.
  };
}
