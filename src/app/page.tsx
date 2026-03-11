"use client";

import { useEffect, useState } from "react";
import ButtonListComponent from "./components/home/ButtonListComponent";
import EmergencyDetailsComponent from "./components/home/EmergencyDetailsComponent";
import LatestAlert from "./components/home/LatestAlert";
import PlatformStatus from "./components/home/PlatformStatus";
import TrustedContacts from "./components/home/TrustedContacts";
import { supabase } from "../../lib/supabase";
import MapDisplay from "./api/map/route";
import { requestUserLocation } from "@/app/api/permission/route";

type RescueCardData = {
  bloodType?: string;
  medicalConditions?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  homeAddress?: string;
  qrCodeData?: string;
};

export default function HomePage() {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [rescueCard, setRescueCard] = useState<RescueCardData | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    requestUserLocation(true).then((location) => {
      if (location) setUserLocation(location);
    });
  }, []);

  useEffect(() => {
    const getUserDetails = async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      const email = data.user?.email;
      setUserId(userId ?? "");
      setEmail(email ?? "");
    };

    getUserDetails();
  }, []);

  useEffect(() => {
    if (!userId || !email) return;

    let isMounted = true;

    const getHomeData = async () => {
      try {
        const [userResult, rescueCardResult] = await Promise.allSettled([
          fetch(`/api/user/${userId}`, { method: "GET" }),
          fetch(`/api/rescue-card?email=${email}`, {
            method: "GET",
          }),
        ]);

        if (!isMounted) return;

        if (userResult.status === "fulfilled" && userResult.value.ok) {
          const userData = await userResult.value.json();
          setName(userData?.user?.name ?? "");
        } else {
          setName("");
        }

        if (
          rescueCardResult.status === "fulfilled" &&
          rescueCardResult.value.ok
        ) {
          const rescueCardData = await rescueCardResult.value.json();
          setRescueCard(rescueCardData?.rescueCard ?? null);
        } else {
          setRescueCard(null);
        }
      } catch (error) {
        console.error("Failed to fetch home data:", error);
        if (!isMounted) return;
        setName("");
        setRescueCard(null);
      }
    };

    getHomeData();

    return () => {
      isMounted = false;
    };
  }, [email, userId]);

  return (
    <div className="grid grid-cols-4 gap-x-4 gap-y-8 p-8">
      <div className="flex flex-col gap-8 col-span-2">
        <div className="text-6xl font-bold">
          Together for a <br />
          <span>Resilient Borneo</span>
        </div>

        <div className="">
          Connecting rural residents with life-saving resources, trusted shelter
          information, and community support during emergencies.
        </div>

        <ButtonListComponent userId={userId} />

        <EmergencyDetailsComponent
          name={name}
          bloodType={rescueCard?.bloodType ?? ""}
          medicalConditions={rescueCard?.medicalConditions ?? ""}
          emergencyContactName={rescueCard?.emergencyContactName ?? ""}
          emergencyContactPhone={rescueCard?.emergencyContactPhone ?? ""}
          homeAddress={rescueCard?.homeAddress ?? ""}
          qrCodeData={rescueCard?.qrCodeData ?? ""}
        />
      </div>

      <div className="col-span-2 bg-blue-50">
        <div className="flex items-center justify-center h-full w-full">
          <MapDisplay latitude={userLocation?.lat ?? null} longitude={userLocation?.lng ?? null} />
        </div>
      </div>

      <div className="col-span-3">
        <LatestAlert />
      </div>

      <div className="col-span-1 flex flex-col gap-4">
        <PlatformStatus />
        <TrustedContacts />
      </div>
    </div>
  );
}
