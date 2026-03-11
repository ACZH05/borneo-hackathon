"use client";

import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CallIcon from "@mui/icons-material/Call";
import CloseIcon from "@mui/icons-material/Close";
import { Modal } from "@mui/material";
import Image from "next/image";
import { useState } from "react";

export default function EmergencyDetailsComponent({
  name,
  bloodType,
  medicalConditions,
  emergencyContactName,
  emergencyContactPhone,
  qrCodeData,
}: {
  name: string;
  bloodType: string;
  medicalConditions: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  qrCodeData: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      onClick={() => setIsOpen(true)}
      className="flex flex-col bg-primary text-surface rounded-2xl p-4 gap-4 transition hover:-translate-1 cursor-pointer"
    >
      <div className="flex justify-between font-bold">
        EMERGENCY DETAILS
        <ArrowForwardIosIcon />
      </div>
      <div className="flex gap-4">
        <div className="">
          <span className="text-xs">NAME</span>
          <br />
          <span className="font-bold">{name || "-"}</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs">EMERGENCY CONTACT</span>
          <span className="font-bold">{emergencyContactName}</span>
          <div className="items-center text-xs">
            <CallIcon fontSize="small" />
            {emergencyContactPhone}
          </div>
        </div>
      </div>
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="flex justify-center items-center"
      >
        <div className="bg-white rounded-2xl">
          <div className="grid grid-cols-3 grid-rows-3 gap-4 p-4">
            <div className="flex justify-between items-center col-span-3">
              Ahmad Yusof
              <div onClick={() => setIsOpen(false)} className="cursor-pointer">
                <CloseIcon />
              </div>
            </div>
            <div className="flex flex-col text-xs gap-1 row-start-2">
              <span className="text-textGrey">BLOOD TYPE</span>
              <span className="text-sm font-bold">{bloodType}</span>
            </div>
            <div className="flex flex-col text-xs gap-1 row-start-2">
              <span className="text-textGrey">MEDICAL CONDITION</span>
              <span className="text-sm font-bold">{medicalConditions}</span>
            </div>
            <div className="flex flex-col text-xs gap-1">
              <span className="text-textGrey">HOME ADRRESS</span>
              <span className="text-sm font-bold">Villa 12, Lake View</span>
            </div>
            <div className="flex flex-col text-xs gap-1 row-start-3">
              <span className="text-textGrey">CONTACT PHONE</span>
              <span className="text-sm font-bold">{emergencyContactPhone}</span>
            </div>
            <div className="flex flex-col text-xs gap-1 col-span-2 row-start-3">
              <span className="text-textGrey">EMERGENCY CONTACT</span>
              <span className="text-sm font-bold">{emergencyContactName}</span>
            </div>
          </div>
          <div className="flex justify-center items-center p-8">
            <Image src={qrCodeData} alt="QR" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
