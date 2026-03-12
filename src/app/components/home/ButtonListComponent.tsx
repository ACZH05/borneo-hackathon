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

export default function ButtonListComponent({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hazard, setHazard] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    if (!userId) {
      console.error("Missing userId for SOS request");
      return;
    }

    if (!hazard) {
      console.error("Hazard type is required for SOS request");
      return;
    }

    try {
      setIsSubmitting(true);
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
        const errorData = await response.json().catch(() => null);
        console.error("SOS request failed", errorData ?? response.statusText);
        return;
      }

      const { message } = await response.json();
      console.log(message);
      setIsOpen(false);
      setHazard("");
      setDescription("");
    } catch (error) {
      console.error("Failed to send SOS request:", error);
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
    <div className="flex gap-4 text-surface font-bold">
      <button
        onClick={() => setIsOpen(true)}
        className="flex gap-2 px-8 py-4 bg-priority shadow rounded-full transition hover:-translate-1 cursor-pointer"
      >
        <RingVolumeIcon />
        SOS
      </button>

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
    </div>
  );
}
