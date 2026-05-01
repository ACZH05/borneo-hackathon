"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertItemInfo, AlertStatus } from "@/app/api/alert/util/types";
import { useUserContext } from "@/app/provider/UserIdProvider";
import AlertCard from "./components/AlertCard";
import AlertsBanner from "./components/AlertsBanner";
import AlertsEmptyState from "./components/AlertsEmptyState";
import AlertsFiltersPanel from "./components/AlertsFiltersPanel";
import AlertsLoadingState from "./components/AlertsLoadingState";
import AlertsPageHeader from "./components/AlertsPageHeader";
import {
  buildMalaysiaStateOptions,
  buildOptions,
  getRegionFilterValue,
  getStatusLabel,
  ItemFeedback,
  normalizeFilterToken,
  ORDER_OPTIONS,
  sortHazardValues,
  sortSeverityValues,
  SOURCE_OPTIONS,
  STATUS_OPTIONS,
} from "./components/alertPage.utils";

export default function AdminAlertsPage() {
  const { userId } = useUserContext();
  const [alerts, setAlerts] = useState<AlertItemInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [processingById, setProcessingById] = useState<Record<string, boolean>>({});
  const [feedbackById, setFeedbackById] = useState<Record<string, ItemFeedback>>({});

  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [hazardFilter, setHazardFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [orderFilter, setOrderFilter] = useState("newest");

  const handleResetFilters = useCallback(() => {
    setSourceFilter("all");
    setStatusFilter("all");
    setSeverityFilter("all");
    setHazardFilter("all");
    setStateFilter("all");
    setOrderFilter("newest");
  }, []);

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/alert", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok || !data?.success || !Array.isArray(data.alerts)) {
        throw new Error(data?.error || "Failed to load alerts.");
      }

      setAlerts(data.alerts);
    } catch (fetchError) {
      console.error("Failed to fetch admin alerts:", fetchError);
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load alerts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAlerts();
  }, [loadAlerts]);

  useEffect(() => {
    if (!actionNotice) {
      return;
    }

    const timeoutId = window.setTimeout(() => setActionNotice(null), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [actionNotice]);

  const severityOptions = useMemo(() => {
    const unique = Array.from(
      new Set(
        alerts
          .map((alert) => normalizeFilterToken(alert.severity))
          .filter((value): value is string => Boolean(value))
      )
    );

    return buildOptions(sortSeverityValues(unique), "All Severities");
  }, [alerts]);

  const hazardOptions = useMemo(() => {
    const unique = Array.from(
      new Set(
        alerts
          .map((alert) => alert.hazardType?.trim())
          .filter((value): value is string => Boolean(value))
      )
    );

    return buildOptions(sortHazardValues(unique), "All Hazard Types");
  }, [alerts]);

  const stateOptions = useMemo(() => {
    const unique = Array.from(
      new Set(
        alerts
          .map((alert) => getRegionFilterValue(alert))
          .filter((value): value is string => Boolean(value))
      )
    );

    return buildMalaysiaStateOptions(unique);
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    const nextAlerts = alerts.filter((alert) => {
      const matchesSource = sourceFilter === "all" || alert.source === sourceFilter;
      const matchesStatus = statusFilter === "all" || alert.status === statusFilter;
      const matchesSeverity =
        severityFilter === "all" ||
        normalizeFilterToken(alert.severity) === normalizeFilterToken(severityFilter);
      const matchesHazard = hazardFilter === "all" || alert.hazardType === hazardFilter;
      const matchesState =
        stateFilter === "all" || getRegionFilterValue(alert) === stateFilter;

      return matchesSource && matchesStatus && matchesSeverity && matchesHazard && matchesState;
    });

    nextAlerts.sort((left, right) => {
      const leftTime = new Date(left.createdAt).getTime();
      const rightTime = new Date(right.createdAt).getTime();
      const safeLeftTime = Number.isNaN(leftTime) ? 0 : leftTime;
      const safeRightTime = Number.isNaN(rightTime) ? 0 : rightTime;

      return orderFilter === "oldest"
        ? safeLeftTime - safeRightTime
        : safeRightTime - safeLeftTime;
    });

    return nextAlerts;
  }, [
    alerts,
    hazardFilter,
    orderFilter,
    severityFilter,
    sourceFilter,
    stateFilter,
    statusFilter,
  ]);

  async function handleStatusChange(alert: AlertItemInfo, nextStatus: AlertStatus) {
    if (!alert.id) {
      setFeedbackById((current) => ({
        ...current,
        unknown: {
          type: "error",
          message: "This alert is missing an ID and cannot be updated.",
        },
      }));
      return;
    }

    const alertId = alert.id;

    if (!userId) {
      setFeedbackById((current) => ({
        ...current,
        [alertId]: {
          type: "error",
          message: "Admin session is not ready yet. Please try again in a moment.",
        },
      }));
      return;
    }

    setProcessingById((current) => ({ ...current, [alertId]: true }));
    setFeedbackById((current) => {
      const nextFeedback = { ...current };
      delete nextFeedback[alertId];
      return nextFeedback;
    });

    try {
      const response = await fetch(`/api/alert/${alertId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          status: nextStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success || !data.alert) {
        throw new Error(data?.error || "Failed to update alert status.");
      }

      setAlerts((current) =>
        current.map((item) => (item.id === alertId ? data.alert : item))
      );
      setFeedbackById((current) => ({
        ...current,
        [alertId]: {
          type: "success",
          message: `Alert moved to ${getStatusLabel(nextStatus)}.`,
        },
      }));
      setActionNotice(
        `${alert.title || "Untitled alert"} moved to ${getStatusLabel(nextStatus)}.`
      );
    } catch (updateError) {
      setFeedbackById((current) => ({
        ...current,
        [alertId]: {
          type: "error",
          message:
            updateError instanceof Error
              ? updateError.message
              : "Failed to update alert status.",
        },
      }));
    } finally {
      setProcessingById((current) => ({
        ...current,
        [alertId]: false,
      }));
    }
  }

  if (loading) {
    return <AlertsLoadingState />;
  }

  const hasAlerts = alerts.length > 0;
  const hasFilteredAlerts = filteredAlerts.length > 0;

  return (
    <div className="flex flex-col gap-8 p-10">
      <AlertsPageHeader totalAlerts={alerts.length} visibleAlerts={filteredAlerts.length} />

      <AlertsBanner
        actionNotice={actionNotice}
        error={error}
        onRetry={() => void loadAlerts()}
      />

      <AlertsFiltersPanel
        sourceFilter={sourceFilter}
        statusFilter={statusFilter}
        severityFilter={severityFilter}
        hazardFilter={hazardFilter}
        stateFilter={stateFilter}
        orderFilter={orderFilter}
        sourceOptions={SOURCE_OPTIONS}
        statusOptions={STATUS_OPTIONS}
        severityOptions={severityOptions}
        hazardOptions={hazardOptions}
        stateOptions={stateOptions}
        orderOptions={ORDER_OPTIONS}
        onSourceChange={setSourceFilter}
        onStatusChange={setStatusFilter}
        onSeverityChange={setSeverityFilter}
        onHazardChange={setHazardFilter}
        onStateChange={setStateFilter}
        onOrderChange={setOrderFilter}
        onResetFilters={handleResetFilters}
      />

      {error && !hasAlerts ? (
        <AlertsEmptyState variant="loadError" onRetry={() => void loadAlerts()} />
      ) : !hasAlerts ? (
        <AlertsEmptyState variant="empty" />
      ) : !hasFilteredAlerts ? (
        <AlertsEmptyState variant="noResults" />
      ) : (
        <div className="flex flex-col gap-4">
          {filteredAlerts.map((alert) => {
            const feedback = alert.id ? feedbackById[alert.id] : null;
            const isProcessing = Boolean(alert.id && processingById[alert.id]);

            return (
              <AlertCard
                key={alert.id ?? `${alert.createdAt}-${alert.title}`}
                alert={alert}
                feedback={feedback}
                isProcessing={isProcessing}
                onStatusChange={handleStatusChange}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
