import QRCode from "qrcode";

type RescueCardPayload = {
  email: string;
  bloodType?: string | null;
  allergies?: string | null;
  medicalConditions?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactGmail?: string | null;
  homeAddress?: string | null;
};

export function buildMedicalDataString({
  email,
  bloodType,
  allergies,
  medicalConditions,
  emergencyContactName,
  emergencyContactPhone,
  emergencyContactGmail,
  homeAddress,
}: RescueCardPayload) {
  return `
                        ━━━━━━━━━━━━━━━
                        🚑 BORNEO RESCUE CARD 🚑
                        ━━━━━━━━━━━━━━━
                        👤 USER: ${email}
                        🩸 BLOOD: ${bloodType || "N/A"}
                        ⚠️ ALLERGIES: ${allergies || "NONE"}
                        🏥 MEDICAL: ${medicalConditions || "NONE"}

                        📞 EMERGENCY CONTACT:
                        Name: ${emergencyContactName || "N/A"}
                        Phone: ${emergencyContactPhone || "N/A"}
                        Gmail: ${emergencyContactGmail || "N/A"}

                        📍 HOME:
                        ${homeAddress || "Address not found"}
                        ━━━━━━━━━━━━━━━
    `.trim();
}

export async function generateRescueCardQrCode(payload: RescueCardPayload) {
  return QRCode.toDataURL(buildMedicalDataString(payload), {
    errorCorrectionLevel: "H",
    width: 400,
    margin: 1,
  });
}

export function buildGoogleMapsUrl(homeLat?: number | null, homeLng?: number | null) {
  if (typeof homeLat !== "number" || typeof homeLng !== "number") {
    return null;
  }

  return `https://www.google.com/maps?q=${homeLat},${homeLng}`;
}
