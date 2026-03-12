"use client";

type RescueCardProps = {
  name: string;
  bloodType: string;
  allergies: string;
  medicalConditions: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  homeAddress: string;
};

type CardFieldProps = {
  label: string;
  value: string;
  className?: string;
};

function CardField({ label, value, className = "" }: CardFieldProps) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="text-[11px] font-semibold tracking-wide text-textGrey/80">
        {label}
      </p>
      <p className="mt-1 break-words text-sm leading-5 text-textBlack">{value}</p>
    </div>
  );
}

function RescueCard({
  name,
  bloodType,
  allergies,
  medicalConditions,
  emergencyContactName,
  emergencyContactPhone,
  homeAddress,
}: RescueCardProps) {
  const safeName = name || "Unknown User";
  const safeBloodType = bloodType || "N/A";
  const safeMedicalConditions = medicalConditions || "N/A";
  const safeHomeAddress = homeAddress || "N/A";
  const safeEmergencyContact = emergencyContactName || "N/A";
  const safeEmergencyContactPhone = emergencyContactPhone || "N/A";
  const safeAllergies = allergies || "N/A";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-textGrey/15 pb-3">
        <p className="break-words text-2xl font-bold text-textBlack">{safeName}</p>
      </div>
      <div className="mt-3 grid min-h-0 flex-1 grid-cols-2 gap-x-4 gap-y-3 overflow-y-auto pr-1">
        <CardField label="BLOOD TYPE" value={safeBloodType} />
        <CardField label="MEDICAL CONDITION" value={safeMedicalConditions} />
        <CardField label="HOME ADDRESS" value={safeHomeAddress} className="col-span-2" />
        <CardField label="ALLERGIES" value={safeAllergies} />
        <CardField label="EMERGENCY CONTACT" value={safeEmergencyContact} />
        <CardField
          label="EMERGENCY CONTACT PHONE"
          value={safeEmergencyContactPhone}
          className="col-span-2"
        />
      </div>
    </div>
  );
}

export default RescueCard;
