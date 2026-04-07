"use client";

import RingVolumeIcon from "@mui/icons-material/RingVolume";
import EmergencyIcon from "@mui/icons-material/Emergency";
import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";

import { useState } from "react";
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Modal,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";

type SubmissionStatus =
  | { type: "success"; message: string }
  | { type: "error"; message: string };

type SosResponse = {
  message?: string;
  emergencyContactNotification?: {
    email?: string | null;
    notified?: boolean;
    error?: string | null;
  };
};

export default function ButtonListComponent({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hazard, setHazard] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus | null>(null);

  const getLocation = () =>
    new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
      );
    });

  const getRequestErrorMessage = (errorData: unknown) => {
    if (errorData && typeof errorData === "object" && "error" in errorData) {
      const message = (errorData as { error?: unknown }).error;
      if (typeof message === "string" && message.trim()) {
        return message;
      }
    }

    return "SOS signal failed to send. Please try again.";
  };

  const getClientErrorMessage = (error: unknown) => {
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code?: unknown }).code;

      if (code === 1) {
        return "Location access was denied. Please enable GPS permission and try again.";
      }

      if (code === 2) {
        return "Unable to determine your location. Please try again in an open area.";
      }

      if (code === 3) {
        return "Location request timed out. Please try again.";
      }
    }

    return "SOS signal failed to send. Please check your connection and try again.";
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    if (!userId) {
      console.error("Missing userId for SOS request");
      setSubmissionStatus({
        type: "error",
        message: "Unable to send SOS signal because your session is missing. Please log in again.",
      });
      return;
    }

    if (!hazard) {
      console.error("Hazard type is required for SOS request");
      setSubmissionStatus({
        type: "error",
        message: "Please select a hazard type before sending SOS.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmissionStatus(null);
      const location = await getLocation();
      const payloadDescription = description.trim() || "No description provided";

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          lat: location.lat,
          lng: location.lng,
          hazardType: hazard,
          description: payloadDescription,
        }),
      });

      if (!response.ok) {
        const errorData: unknown = await response.json().catch(() => null);
        const errorMessage = getRequestErrorMessage(errorData);
        console.error("SOS request failed", errorData ?? response.statusText);
        setSubmissionStatus({
          type: "error",
          message: errorMessage,
        });
        return;
      }

      const responseData: unknown = await response.json();
      const sosResponse =
        responseData && typeof responseData === "object"
          ? (responseData as SosResponse)
          : null;
      const successMessage =
        sosResponse &&
        typeof sosResponse.message === "string"
          ? sosResponse.message
          : "SOS signal sent successfully.";
      const emergencyContactStatus =
        sosResponse?.emergencyContactNotification?.email
          ? sosResponse.emergencyContactNotification.notified
            ? `Emergency contact notified at ${sosResponse.emergencyContactNotification.email}.`
            : `Emergency contact email failed${sosResponse.emergencyContactNotification.error ? `: ${sosResponse.emergencyContactNotification.error}` : "."}`
          : "No approved emergency contact Gmail available.";
      const combinedSuccessMessage = `${successMessage} ${emergencyContactStatus}`;

      console.log(combinedSuccessMessage);
      setIsOpen(false);
      setHazard("");
      setDescription("");
      setSubmissionStatus({
        type: "success",
        message: combinedSuccessMessage,
      });
    } catch (error) {
      console.error("Failed to send SOS request:", error);
      setSubmissionStatus({
        type: "error",
        message: getClientErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hazards = [
    { label: "Flood", value: "flood" },
    { label: "Landslide", value: "landslide" },
    { label: "Tidal", value: "tidal" },
    { label: "Medical", value: "medical" },
    { label: "Infrastructure", value: "infrastructure" },
    { label: "Other", value: "other" },
  ];

  return (
    <div className="text-surface font-bold">
      <div className="flex gap-4">
        <button
          onClick={() => {
            setIsOpen(true);
            setSubmissionStatus(null);
          }}
          className="flex gap-2 px-8 py-4 bg-priority shadow rounded-full transition hover:-translate-1 cursor-pointer"
        >
          <RingVolumeIcon />
          SOS
        </button>
      </div>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="flex justify-center items-center"
      >
        <div className=" bg-white w-lg rounded-2xl">
          <div className="flex gap-3 items-center bg-priority text-white rounded-t-2xl py-4 px-6">
            <EmergencyIcon fontSize="large" />
            <div className="flex flex-col text-xs">
              <span className="text-xl font-extrabold ">Confirm Emergency</span>
              IMMEDIATE RESPONSE REQUIRED
            </div>
          </div>
          <div className="p-6">
            <FormControl fullWidth className="flex gap-4">
              <FormLabel id="hazard-type-selection">
                What is the hazard type?
              </FormLabel>
              <RadioGroup
                aria-labelledby="hazard-type-selection"
                value={hazard}
                onChange={(e) => setHazard(e.target.value)}
              >
                <div className="grid grid-cols-2 gap-4">
                  {hazards.map((hazard) => (
                    <FormControlLabel
                      label={hazard.label}
                      value={hazard.value}
                      control={<Radio />}
                      key={hazard.value}
                    />
                  ))}
                </div>
              </RadioGroup>

              <FormLabel>What&apos;s happening? (Optional)</FormLabel>
              <TextField
                multiline
                rows={4}
                placeholder="Briefly describe your situation..."
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div className="">
                <FmdGoodOutlinedIcon className="text-primary" />
                <span className="pl-1">
                  Broadcasting live GPS location to local authorities
                </span>
              </div>

              {submissionStatus?.type === "error" && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {submissionStatus.message}
                </div>
              )}

              <button
                disabled={isSubmitting || !hazard}
                className="bg-priority text-white py-4 rounded-xl shadow-2xl cursor-pointer"
                onClick={() => handleSubmit()}
              >
                {isSubmitting ? "SENDING..." : "SEND SOS SIGNAL"}
              </button>
            </FormControl>
          </div>
        </div>
      </Modal>

      {submissionStatus && !isOpen && (
        <div
          role="status"
          aria-live="polite"
          className={`mt-3 rounded-lg border px-4 py-3 text-sm font-medium ${
            submissionStatus.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {submissionStatus.message}
        </div>
      )}
    </div>
  );
}
