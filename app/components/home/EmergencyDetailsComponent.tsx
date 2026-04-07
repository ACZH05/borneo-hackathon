"use client";

import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CallIcon from "@mui/icons-material/Call";
import CloseIcon from "@mui/icons-material/Close";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { Modal } from "@mui/material";
import Image from "next/image";
import { useState } from "react";

export default function EmergencyDetailsComponent({
  name,
  bloodType,
  allergies,
  medicalConditions,
  emergencyContactName,
  emergencyContactPhone,
  emergencyContactGmail,
  homeAddress,
  qrCodeData,
}: {
  name: string;
  bloodType: string;
  allergies: string;
  medicalConditions: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactGmail: string;
  homeAddress: string;
  qrCodeData: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState("");

  const handleShareQr = async () => {
    if (!qrCodeData) {
      setShareStatus("QR code unavailable.");
      return;
    }

    try {
      const response = await fetch(qrCodeData);
      const blob = await response.blob();
      const file = new File([blob], "emergency-qr.png", { type: blob.type || "image/png" });

      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({
          title: "Emergency QR Code",
          text: "Emergency details QR code",
          files: [file],
        });
        setShareStatus("QR code shared.");
        return;
      }

      await navigator.clipboard.writeText(qrCodeData);
      setShareStatus("QR code copied to clipboard.");
    } catch (error) {
      console.error("Failed to share QR code:", error);
      setShareStatus("Unable to share QR code.");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open emergency details"
        className="group flex w-full cursor-pointer flex-col gap-4 rounded-2xl bg-primary p-4 text-left text-surface transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-surface/80 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-[0.12em] text-surface/80">
              QUICK ACCESS
            </span>
            <span className="font-bold">EMERGENCY DETAILS</span>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface/15 transition group-hover:bg-surface/25">
            <ArrowForwardIosIcon fontSize="small" />
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-surface/10 p-3">
            <span className="text-[11px] font-semibold tracking-wide text-surface/80">PERSONAL INFO</span>
            <p className="mt-1 wrap-break-word text-sm font-bold">{name || "-"}</p>
            <div className="mt-1 text-xs text-surface/90">
              Blood Type: <span className="font-semibold">{bloodType || "-"}</span>
            </div>
            <div className="mt-1 text-xs wrap-break-words text-surface/90">
              Allergies: <span className="font-semibold">{allergies || "-"}</span>
            </div>
          </div>

          <div className="rounded-xl bg-surface/10 p-3">
            <span className="text-[11px] font-semibold tracking-wide text-surface/80">
              EMERGENCY CONTACT
            </span>
            <p className="mt-1 wrap-break-word text-sm font-bold">{emergencyContactName || "-"}</p>
            <div className="mt-1 flex items-center gap-1 text-xs break-all text-surface/90">
              <CallIcon fontSize="small" />
              {emergencyContactPhone || "-"}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs break-all text-surface/90">
              <EmailOutlinedIcon fontSize="small" />
              {emergencyContactGmail || "-"}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-surface/20 bg-surface/10 px-3 py-2">
          <span className="text-xs font-semibold">
            Tap to view full details and QR code
          </span>
          <ArrowForwardIosIcon fontSize="small" />
        </div>
      </button>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="flex items-center justify-center p-4"
      >
        <div
          className="flex w-full max-w-3xl max-h-[80vh] flex-col overflow-hidden rounded-3xl border border-textGrey/15 bg-white shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between border-b border-textGrey/15 px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[0.14em] text-textGrey/80">
                EMERGENCY DETAILS
              </p>
              <p className="mt-1 wrap-break-word text-xl font-bold text-textBlack">
                {name || "-"}
              </p>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setIsOpen(false);
              }}
              className="rounded-full p-1 text-textGrey transition hover:bg-primary/10 hover:text-primary"
              aria-label="Close emergency details"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5 sm:p-6 lg:flex-row lg:items-start">
            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-textGrey/10 bg-background p-4">
                <p className="text-[11px] font-semibold tracking-wide text-textGrey/80">
                  BLOOD TYPE
                </p>
                <p className="mt-1 wrap-break-word text-sm font-bold text-textBlack">
                  {bloodType || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-textGrey/10 bg-background p-4">
                <p className="text-[11px] font-semibold tracking-wide text-textGrey/80">
                  MEDICAL CONDITION
                </p>
                <p className="mt-1 wrap-break-word text-sm font-bold text-textBlack">
                  {medicalConditions || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-textGrey/10 bg-background p-4">
                <p className="text-[11px] font-semibold tracking-wide text-textGrey/80">
                  ALLERGIES
                </p>
                <p className="mt-1 wrap-break-word text-sm font-bold text-textBlack">
                  {allergies || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-textGrey/10 bg-background p-4">
                <p className="text-[11px] font-semibold tracking-wide text-textGrey/80">
                  EMERGENCY CONTACT
                </p>
                <p className="mt-1 wrap-break-word text-sm font-bold text-textBlack">
                  {emergencyContactName || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-textGrey/10 bg-background p-4 sm:col-span-2">
                <p className="text-[11px] font-semibold tracking-wide text-textGrey/80">
                  EMERGENCY CONTACT PHONE
                </p>
                <p className="mt-1 wrap-break-word text-sm font-bold text-textBlack">
                  {emergencyContactPhone || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-textGrey/10 bg-background p-4 sm:col-span-2">
                <p className="text-[11px] font-semibold tracking-wide text-textGrey/80">
                  EMERGENCY CONTACT GMAIL
                </p>
                <p className="mt-1 wrap-break-word text-sm font-bold text-textBlack">
                  {emergencyContactGmail || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-textGrey/10 bg-background p-4 sm:col-span-2">
                <p className="text-[11px] font-semibold tracking-wide text-textGrey/80">
                  HOME ADDRESS
                </p>
                <p className="mt-1 wrap-break-word text-sm font-bold text-textBlack">
                  {homeAddress || "-"}
                </p>
              </div>
            </div>

            <div className="w-full rounded-2xl border border-primary/20 bg-primary/5 p-4 lg:max-w-65">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold tracking-wide text-textGrey/80">
                  SCAN QR CODE
                </p>
                <button
                  type="button"
                  onClick={handleShareQr}
                  className="rounded-lg border border-primary/20 bg-white px-3 py-1.5 text-[11px] font-semibold text-primary transition hover:bg-primary/10"
                >
                  Share
                </button>
              </div>
              <div className="mt-3 flex min-h-55 items-center justify-center rounded-xl bg-white p-3">
                {qrCodeData ? (
                  <Image src={qrCodeData} alt="QR" width={220} height={220} />
                ) : (
                  <span className="text-sm text-textGrey">QR code unavailable</span>
                )}
              </div>
              {shareStatus && (
                <p className="mt-2 text-center text-[11px] text-textGrey">{shareStatus}</p>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
