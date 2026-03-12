"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthStatus } from "@/app/api/auth/verification/route";
import ChecklistBody from "./components/Checklist-Body";
import ChecklistDrawer from "./components/Checklist-Drawer";
import { BodyView, ChecklistItem, EmergencyPlan } from "./components/types";

function getUserIdFromSupabaseToken(): string | null {
  const token = localStorage.getItem("supabase.auth.token");
  if (!token) return null;

  try {
    const tokenPayload = token.split(".")[1];
    if (!tokenPayload) return null;

    const base64 = tokenPayload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join("")
    );

    const parsed = JSON.parse(jsonPayload) as { sub?: string };
    return parsed.sub ?? null;
  } catch {
    return null;
  }
}

export default function ResourcesChecklistPage() {
  {/* Authentication Check */}
  const { isLoggedIn, isLoading } = AuthStatus();

  const [userId, setUserId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<BodyView>("initial");
  const [history, setHistory] = useState<EmergencyPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<EmergencyPlan | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isPersisting, setIsPersisting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const hasPendingChanges = useMemo(() => {
    if (!selectedPlan) return false;
    const original = history.find((plan) => plan.id === selectedPlan.id);
    if (!original) return false;
    return JSON.stringify(original.checklist) !== JSON.stringify(selectedPlan.checklist);
  }, [history, selectedPlan]);

  const loadHistory = useCallback(async (id: string) => {
    setIsHistoryLoading(true);
    try {
      const response = await fetch(`/api/checklist?userId=${id}`);
      const data = await response.json();

      if (response.ok && Array.isArray(data.plans)) {
        setHistory(data.plans as EmergencyPlan[]);
      }
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  const persistSelectedPlan = useCallback(async () => {
    if (!selectedPlan || !hasPendingChanges) return;

    setIsPersisting(true);
    try {
      const response = await fetch(`/api/checklist/${selectedPlan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checklist: selectedPlan.checklist }),
      });

      if (!response.ok) return;

      setHistory((currentHistory) =>
        currentHistory.map((plan) =>
          plan.id === selectedPlan.id
            ? { ...plan, checklist: selectedPlan.checklist, updatedAt: new Date().toISOString() }
            : plan
        )
      );
    } finally {
      setIsPersisting(false);
    }
  }, [hasPendingChanges, selectedPlan]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const id = getUserIdFromSupabaseToken();
    setUserId(id);
    if (id) {
      void loadHistory(id);
    }
  }, [isLoggedIn, loadHistory]);

  useEffect(() => {
    const syncBeforeUnload = () => {
      if (!selectedPlan || !hasPendingChanges) return;

      void fetch(`/api/checklist/${selectedPlan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checklist: selectedPlan.checklist }),
        keepalive: true,
      });
    };

    window.addEventListener("beforeunload", syncBeforeUnload);
    return () => {
      syncBeforeUnload();
      window.removeEventListener("beforeunload", syncBeforeUnload);
    };
  }, [hasPendingChanges, selectedPlan]);

  const moveToInitial = async () => {
    await persistSelectedPlan();
    setActiveView("initial");
    setSelectedPlan(null);
  };

  const moveToAdd = async () => {
    await persistSelectedPlan();
    setActiveView("add");
    setSelectedPlan(null);
  };

  const openPlan = async (plan: EmergencyPlan) => {
    await persistSelectedPlan();
    setSelectedPlan(plan);
    setActiveView("view");
  };

  const onPlanGenerated = (newPlan: EmergencyPlan) => {
    setHistory((current) => [newPlan, ...current]);
    setSelectedPlan(newPlan);
    setActiveView("view");
  };

  const onChecklistChange = (checklist: ChecklistItem[]) => {
    if (!selectedPlan) return;
    setSelectedPlan({ ...selectedPlan, checklist });
  };

  const deleteSelectedPlan = useCallback(async () => {
    if (!selectedPlan) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/checklist/${selectedPlan.id}`, {
        method: "DELETE",
      });

      if (!response.ok) return;

      setHistory((currentHistory) =>
        currentHistory.filter((plan) => plan.id !== selectedPlan.id)
      );
      setSelectedPlan(null);
      setActiveView("initial");
    } finally {
      setIsDeleting(false);
    }
  }, [selectedPlan]);

  if (isLoading)   return <div className="flex items-center justify-center h-full">Loading...</div>;
  if (!isLoggedIn) return <div className="flex items-center justify-center h-full">Please log in to access the checklist.</div>;

  return (
    <div className="relative flex flex-row h-[calc(100vh-160px)] overflow-hidden">
      <ChecklistDrawer
        activeView={activeView}
        history={history}
        isHistoryLoading={isHistoryLoading}
        selectedPlanId={selectedPlan?.id ?? null}
        onOpenInitial={moveToInitial}
        onOpenAdd={moveToAdd}
        onOpenPlan={openPlan}
      />
      <ChecklistBody
        activeView={activeView}
        userId={userId}
        selectedPlan={selectedPlan}
        isPersisting={isPersisting}
        isDeleting={isDeleting}
        hasPendingChanges={hasPendingChanges}
        onOpenAdd={moveToAdd}
        onPlanGenerated={onPlanGenerated}
        onChecklistChange={onChecklistChange}
        onSave={persistSelectedPlan}
        onDelete={deleteSelectedPlan}
      />
    </div>
  );
}
