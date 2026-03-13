"use client";

import React, { useEffect, useState } from "react";
import PostAddIcon from "@mui/icons-material/PostAdd";
import { Modal, TextField } from "@mui/material";
import { useUserContext } from "@/provider/UserIdProvider";

type ReportType = {
  id: string;
  userId: string;
  lat: number;
  lng: number;
  address: string;
  hazardType: string;
  description: string;
  status: string;
  aiTriage: string | null;
  createAt: string;
  user: { name: string; regionCode: string };
};

function AlertButton({ uid }: { uid: string }) {
  const [report, setReport] = useState<ReportType>();
  const [isOpen, setIsOpen] = useState(false);
  const [isDraftLoading, setIsDraftLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [draftError, setDraftError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState("");
  const [hazardType, setHazardType] = useState("");
  const [body, setBody] = useState("");
  const [regionCode, setRegionCode] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const { userId } = useUserContext();

  useEffect(() => {
    const getReport = async () => {
      const response = await fetch(`/api/reports/${uid}`, {
        method: "GET",
      });

      const data = await response.json();
      setReport(data?.reports);
      setLat(data?.reports.lat);
      setLng(data?.reports?.lng);
      setRegionCode(data?.reports?.user?.regionCode);
    };
    getReport();
  }, [uid]);

  const postAlertDraft = async () => {
    const response = await fetch("/api/ai/draft-alert", {
      method: "POST",
      body: JSON.stringify({
        rawInput: report?.description,
        location: report?.address,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || "Failed to generate alert draft.");
    }

    const data = await response.json();
    const draft = data?.draft;
    if (!data?.success || !draft) {
      throw new Error(data?.error || "Failed to generate alert draft.");
    }

    return draft;
  };

  const handleDraft = async () => {
    setIsOpen(true);
    setIsDraftLoading(true);
    setDraftError("");
    setSubmitError("");

    try {
      const draftAlert = await postAlertDraft();
      setTitle(draftAlert?.title || "");
      setSeverity(draftAlert?.severity || "");
      setHazardType(draftAlert?.hazardType || "");
      setBody(draftAlert?.body || "");
    } catch (error) {
      setDraftError(
        error instanceof Error
          ? error.message
          : "Failed to generate alert draft.",
      );
    } finally {
      setIsDraftLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPosting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/alert", {
        method: "POST",
        body: JSON.stringify({
          userId,
          regionCode,
          hazardType,
          severity,
          title,
          body,
          lat,
          lng,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Failed to post alert.");
      }

      setSuccessMessage("Alert posted successfully.");
      setIsOpen(false);
      window.setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to post alert.",
      );
    } finally {
      setIsPosting(false);
    }
  };
  return (
    <div>
      {successMessage && (
        <div className="fixed bottom-10 right-10 z-50 flex items-center gap-3 rounded-xl border-l-4 border-green-500 bg-white px-6 py-4 text-sm font-bold text-textBlack shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 text-green-600">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          {successMessage}
        </div>
      )}

      <button
        onClick={handleDraft}
        className="flex cursor-pointer items-center gap-2 rounded-xl bg-priority px-6 py-2 text-sm font-black text-white transition hover:opacity-90"
      >
        <PostAddIcon />
        Deploy Alert
      </button>

      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-textGrey/15 bg-white shadow-2xl">
            <div className="border-b border-textGrey/10 px-6 py-4">
              <p className="text-lg font-bold text-textBlack">Alert Draft</p>
              <p className="text-xs text-textGrey">
                Review and edit the generated public alert before posting.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
              {draftError && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                  {draftError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <TextField
                  label="Title"
                  onChange={(e) => setTitle(e.target.value)}
                  value={title}
                  size="small"
                  fullWidth
                  disabled={isDraftLoading || isPosting}
                />
                <TextField
                  label="Severity"
                  onChange={(e) => setSeverity(e.target.value)}
                  value={severity}
                  size="small"
                  fullWidth
                  disabled={isDraftLoading || isPosting}
                />
                <TextField
                  label="Hazard Type"
                  onChange={(e) => setHazardType(e.target.value)}
                  value={hazardType}
                  size="small"
                  fullWidth
                  disabled={isDraftLoading || isPosting}
                />
                <div className="flex items-center rounded-xl bg-primary/5 px-3 py-2 text-xs text-textGrey">
                  Coordinates: {lat || "-"}, {lng || "-"}
                </div>
              </div>

              <TextField
                label="Body"
                multiline
                minRows={6}
                onChange={(e) => setBody(e.target.value)}
                value={body}
                fullWidth
                disabled={isDraftLoading || isPosting}
              />

              {isDraftLoading && (
                <div className="flex items-center gap-3 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
                  <span className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                  Generating alert draft...
                </div>
              )}

              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {submitError}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isDraftLoading || isPosting}
                  className="cursor-pointer rounded-xl border border-textGrey/30 px-5 py-2 text-sm font-semibold text-textGrey transition hover:bg-textGrey/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDraftLoading || isPosting}
                  className="flex min-w-32 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2 text-sm font-bold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPosting ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post Alert"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AlertButton;
