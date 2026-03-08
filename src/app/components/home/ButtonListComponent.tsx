"use client";

import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
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

export default function ButtonListComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [hazard, setHazard] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    console.log(hazard);
    console.log(description);
  };

  const hazards = [
    { label: "Flood", value: "flood" },
    { label: "Landslide", value: "landslide" },
    { label: "Medical", value: "medical" },
    { label: "Infrastructure", value: "infrastructure" },
  ];

  return (
    <div className="flex gap-4 text-surface font-bold">
      <button className="flex gap-2 px-8 py-4 bg-primary shadow rounded-full transition hover:-translate-1 cursor-pointer">
        <HealthAndSafetyOutlinedIcon />
        Find Safe Zone
      </button>

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
                onChange={(e) => setHazard(e.target.value)}
              >
                <div className="grid grid-cols-2 grid-rows-2 gap-4">
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
                onChange={(e) => setDescription(e.target.value)}
              />

              <div className="">
                <FmdGoodOutlinedIcon className="text-primary" />
                <span className="pl-1">
                  Broadcasting live GPS location to local authorities
                </span>
              </div>

              <button
                className="bg-priority text-white py-4 rounded-xl shadow-2xl cursor-pointer"
                onClick={() => handleSubmit()}
              >
                SEND SOS SIGNAL
              </button>
            </FormControl>
          </div>
        </div>
      </Modal>
    </div>
  );
}
