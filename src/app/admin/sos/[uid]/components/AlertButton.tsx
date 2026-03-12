"use client";

import React, { useEffect, useState } from "react";
import PostAddIcon from "@mui/icons-material/PostAdd";
import { FormControl, Input, InputLabel, Modal } from "@mui/material";
import { supabase } from "@/app/lib/supabase";

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
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;
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
    <div className="">
      <button
        onClick={handleDraft}
        className="flex items-center gap-2 px-6 py-2 text-sm font-black bg-priority text-white rounded-xl cursor-pointer"
      >
        <PostAddIcon />
        Deploy Alert
      </button>

      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <div className="bg-white w-1/2 absolute top-1/2 left-1/2 -translate-1/2 p-6 rounded-2xl">
          <div className="flex flex-col gap-4">
            <span>Draft</span>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FormControl>
                <InputLabel>Title</InputLabel>
                <Input
                  onChange={(e) => setTitle(e.target.value)}
                  value={title}
                />
              </FormControl>

              <FormControl>
                <InputLabel>Severity</InputLabel>
                <Input
                  onChange={(e) => setSeverity(e.target.value)}
                  value={severity}
                />
              </FormControl>

              <FormControl>
                <InputLabel>Hazard Type</InputLabel>
                <Input
                  onChange={(e) => setHazardType(e.target.value)}
                  value={hazardType}
                />
              </FormControl>

              <FormControl>
                <InputLabel>Body</InputLabel>
                <Input
                  multiline
                  onChange={(e) => setBody(e.target.value)}
                  value={body}
                />
              </FormControl>

              <button className="bg-primary text-white py-4 rounded-xl shadow-2xl cursor-pointer">
                POST
              </button>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AlertButton;
