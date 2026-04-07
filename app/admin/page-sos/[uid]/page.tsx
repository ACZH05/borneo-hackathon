"use client";
import React, { useEffect, useState } from "react";

import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";
import RescueCard from "./components/RescueCard";
import IncidentMap from "./components/IncidentMap";
import Skeleton from "@/app/components/Skeleton";

function Page({ params }: { params: Promise<{ uid: string }> }) {
  const [userId, setUserId] = useState("");
  const [action, setAction] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [emergencyContactGmail, setEmergencyContactGmail] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [reportLocation, setReportLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    const getReport = async () => {
      setIsPageLoading(true);
      try {
        const { uid } = await params;
        const response = await fetch(`/api/reports/${uid}`, {
          method: "GET",
        });

        if (!response.ok || !isMounted) {
          return;
        }

        const data = await response.json();
        setUserId(data?.reports?.userId);
        setAction(data?.reports?.aiTriage?.action);
        setName(data?.reports?.user?.name);

        const reportLat = data?.reports?.lat;
        const reportLng = data?.reports?.lng;
        if (
          typeof reportLat === "number" &&
          Number.isFinite(reportLat) &&
          typeof reportLng === "number" &&
          Number.isFinite(reportLng)
        ) {
          setReportLocation({ lat: reportLat, lng: reportLng });
        } else {
          setReportLocation(null);
        }
      } finally {
        if (isMounted) {
          setIsPageLoading(false);
        }
      }
    };

    getReport();

    return () => {
      isMounted = false;
    };
  }, [params]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const getEmail = async () => {
      const response = await fetch(`/api/user/${userId}`, {
        method: "GET",
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      const { email } = data?.user;
      setEmail(email);
    };

    getEmail();
  }, [userId]);

  useEffect(() => {
    if (!email) {
      return;
    }

    const getRescueCard = async () => {
      const response = await fetch(`/api/rescue-card?email=${email}`, {
        method: "GET",
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      const {
        bloodType,
        allergies,
        medicalConditions,
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactGmail,
        homeAddress,
      } = data?.rescueCard;
      setBloodType(bloodType);
      setAllergies(allergies);
      setMedicalConditions(medicalConditions);
      setEmergencyContactName(emergencyContactName);
      setEmergencyContactPhone(emergencyContactPhone);
      setEmergencyContactGmail(emergencyContactGmail);
      setHomeAddress(homeAddress);
    };

    getRescueCard();
  }, [email]);

  if (isPageLoading) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-4 p-6">
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-4">
          <Skeleton className="h-full min-h-64 w-full rounded-xl" />
          <div className="flex min-h-0 flex-col gap-4">
            <Skeleton className="h-full min-h-64 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-6">
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-4">
        <div className="min-h-0">
          <IncidentMap
            lat={reportLocation?.lat ?? null}
            lng={reportLocation?.lng ?? null}
          />
        </div>
        <div className="flex min-h-0 flex-col gap-4">
          <div className="flex-1 min-h-0 rounded-xl border border-textGrey/15 bg-white p-4">
            <RescueCard
              name={name}
              bloodType={bloodType}
              allergies={allergies}
              medicalConditions={medicalConditions}
              emergencyContactName={emergencyContactName}
              emergencyContactPhone={emergencyContactPhone}
              emergencyContactGmail={emergencyContactGmail}
              homeAddress={homeAddress}
            />
          </div>
          <div className="shrink-0 rounded-xl border border-textGrey/15 bg-white p-4">
            <div className="mb-2 flex gap-2 text-primary">
              <TipsAndUpdatesOutlinedIcon />
              <span className="font-bold">AI SIGNAL INTELLIGENCE</span>
            </div>
            <span className="text-sm text-textGrey">{action || "No AI action summary yet."}</span>
          </div>
        </div>
      </div>
      <div className="shrink-0 flex justify-between border-2 border-textGrey/20 text-textGrey/50 rounded-xl p-3">
        <div className="flex gap-2 items-center">
          <FiberManualRecordIcon fontSize="small" className="text-primary" />
          <span className="font-bold text-xs">System Secure</span>
        </div>
      </div>
    </div>
  );
}

export default Page;
