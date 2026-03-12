"use client";

import React, { useEffect, useState } from "react";
import PostAddIcon from "@mui/icons-material/PostAdd";
import { Modal, TextField } from "@mui/material";
import { useUserContext } from "@/app/provider/UserIdProvider";

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

    const data = await response.json();
    const draft = data?.draft;
    return draft;
  };

  const handleDraft = async () => {
    setIsOpen(true);
    const draftAlert = await postAlertDraft();
    setTitle(draftAlert?.title);
    setSeverity(draftAlert?.severity);
    setHazardType(draftAlert?.hazardType);
    setBody(draftAlert?.body);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetch("/api/alert", {
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
  };
  return (
    <div>
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <TextField
                  label="Title"
                  onChange={(e) => setTitle(e.target.value)}
                  value={title}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Severity"
                  onChange={(e) => setSeverity(e.target.value)}
                  value={severity}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Hazard Type"
                  onChange={(e) => setHazardType(e.target.value)}
                  value={hazardType}
                  size="small"
                  fullWidth
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
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="cursor-pointer rounded-xl border border-textGrey/30 px-5 py-2 text-sm font-semibold text-textGrey transition hover:bg-textGrey/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer rounded-xl bg-primary px-6 py-2 text-sm font-bold text-white shadow-md transition hover:opacity-90"
                >
                  Post Alert
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
