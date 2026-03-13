"use client";

import { useEffect, useState } from "react";
import ButtonListComponent from "./components/home/ButtonListComponent";
import EmergencyDetailsComponent from "./components/home/EmergencyDetailsComponent";
import LatestAlert from "./components/home/LatestAlert";
import PlatformStatus from "./components/home/PlatformStatus";
import TrustedContacts from "./components/home/TrustedContacts";
import MapDisplay from "./api/map/MapDisplay";
import { requestUserLocation } from "@/app/lib/permission/location";
import { useUserContext } from "./provider/UserIdProvider";

type RescueCardData = {
  bloodType?: string;
  allergies?: string;
  medicalConditions?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  homeAddress?: string;
  qrCodeData?: string;
};

export default function HomePage() {
  const [name, setName] = useState("");
  const [rescueCard, setRescueCard] = useState<RescueCardData | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const { userId, email } = useUserContext();

  useEffect(() => {
    requestUserLocation(true).then((location) => {
      if (location) setUserLocation(location);
    });
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
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 p-4 sm:p-6 lg:grid-cols-4 lg:p-8">
      <div className="col-span-1 flex min-w-0 flex-col gap-8 lg:col-span-2">
        <div className="wrap-break-word text-4xl font-bold sm:text-5xl lg:text-6xl">
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
          allergies={rescueCard?.allergies ?? ""}
          medicalConditions={rescueCard?.medicalConditions ?? ""}
          emergencyContactName={rescueCard?.emergencyContactName ?? ""}
          emergencyContactPhone={rescueCard?.emergencyContactPhone ?? ""}
          homeAddress={rescueCard?.homeAddress ?? ""}
          qrCodeData={rescueCard?.qrCodeData ?? ""}
        />
      </div>

      <div className="col-span-1 min-h-80 bg-blue-50 lg:col-span-2">
        <div className="flex items-center justify-center h-full w-full">
          <MapDisplay
            latitude={userLocation?.lat ?? null}
            longitude={userLocation?.lng ?? null}
          />
        </div>
      </div>

      <div className="col-span-1 min-w-0 lg:col-span-3">
        <LatestAlert />
      </div>

      <div className="col-span-1 min-w-0 flex flex-col gap-4 lg:col-span-1">
        <PlatformStatus />
        <TrustedContacts />
      </div>
    </div>
  );
}
