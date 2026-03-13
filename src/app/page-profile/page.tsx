"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/database/supabase"; 
import MapPicker from "./components/MapPicker";
import Skeleton from "@/app/components/Skeleton";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface RescueCard {
  bloodType?: string;
  allergies?: string;
  medicalConditions?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  homeLat?: number;
  homeLng?: number;
  homeAddress?: string;
  qrCodeData?: string;
  shareableUrl?: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  regionCode: string;
  rescueCard?: RescueCard; // Added Rescue Card Type!
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const REGION_OPTIONS = [
  { value: "MY-01", label: "Johor" },
  { value: "MY-02", label: "Kedah" },
  { value: "MY-03", label: "Kelantan" },
  { value: "MY-04", label: "Melaka" },
  { value: "MY-05", label: "Negeri Sembilan" },
  { value: "MY-06", label: "Pahang" },
  { value: "MY-07", label: "Pulau Pinang" },
  { value: "MY-08", label: "Perak" },
  { value: "MY-09", label: "Perlis" },
  { value: "MY-10", label: "Selangor" },
  { value: "MY-11", label: "Terengganu" },
  { value: "MY-12", label: "Sabah" },
  { value: "MY-13", label: "Sarawak" },
  { value: "MY-14", label: "Kuala Lumpur" },
  { value: "ID-KI", label: "Kalimantan Timur (Indonesia)" },
  { value: "ID-KB", label: "Kalimantan Barat (Indonesia)" }
];

const REGION_MAP: Record<string, string> = Object.fromEntries(
  REGION_OPTIONS.map((r) => [r.value, r.label])
);

const ROLE_CONFIG: Record<string, { label: string; dot: string }> = {
  admin:    { label: "Administrator", dot: "bg-orange-400" },
  resident: { label: "Resident",      dot: "bg-primary" },
};

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];

// ─── Components ────────────────────────────────────────────────────────────────
function Avatar({ name }: { name: string }) {
  const encodedName = encodeURIComponent(name || "User");
  const avatarUrl = `https://api.dicebear.com/7.x/micah/svg?seed=${encodedName}&backgroundColor=f1f5f9`;

  return (
    <div className="relative shrink-0 drop-shadow-md">
      <div className="w-28 h-28 rounded-full p-0.75 bg-linear-to-br from-primary via-primary/60 to-transparent">
        <div className="w-full h-full rounded-full overflow-hidden bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarUrl} alt={`${name} avatar`} className="w-full h-full object-cover" />
        </div>
      </div>
      <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-primary border-4 border-surface" />
    </div>
  );
}

function InfoRow({ icon, label, value, muted }: { icon: React.ReactNode; label: string; value: string; muted?: boolean; }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-foreground/5 last:border-0">
      <span className="text-primary mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-textGrey uppercase tracking-widest mb-0.5">{label}</p>
        <p className={`text-base font-medium truncate ${muted ? "text-textGrey" : "text-foreground"}`}>
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

// ─── Edit Profile Drawer ───────────────────────────────────────────────────────
function EditDrawer({ user, onClose, onSave }: { user: UserProfile; onClose: () => void; onSave: (d: { name: string; regionCode: string }) => Promise<void>; }) {
  const [name, setName] = useState(user.name ?? "");
  const [regionCode, setRegionCode] = useState(user.regionCode ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!name.trim()) { setError("Name cannot be empty."); return; }
    setSaving(true); setError("");
    try {
      await onSave({ name: name.trim(), regionCode });
    } catch { setError("Failed to save. Please try again."); } 
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm transition-all" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full sm:max-w-lg bg-surface border border-foreground/10 sm:rounded-2xl rounded-t-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-12 h-1.5 rounded-full bg-foreground/20" /></div>
        <div className="flex items-center justify-between px-8 py-6 border-b border-foreground/10 bg-foreground/2">
          <div>
            <h2 className="text-foreground font-extrabold text-xl tracking-tight">Edit Profile</h2>
            <p className="text-textGrey text-sm mt-1">Update your identity and region</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-foreground/10 text-textGrey hover:text-foreground transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div className="px-8 py-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs text-textGrey font-bold uppercase tracking-widest">Display Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3.5 text-foreground placeholder-textGrey/50 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-textGrey font-bold uppercase tracking-widest">Assigned Region</label>
            <select value={regionCode} onChange={(e) => setRegionCode(e.target.value)} className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3.5 text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm cursor-pointer appearance-none">
              <option value="" disabled>Select your region</option>
              {REGION_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-textGrey font-bold uppercase tracking-widest flex items-center gap-2">
              Email Address <span className="normal-case tracking-normal font-medium bg-foreground/10 text-textGrey px-2 py-0.5 rounded-full text-[10px]">Read-Only</span>
            </label>
            <input value={user.email} disabled className="w-full bg-foreground/3 border border-foreground/5 rounded-xl px-4 py-3.5 text-textGrey text-sm cursor-not-allowed" />
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> {error}
            </div>
          )}
        </div>
        <div className="px-8 pb-8 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-foreground/10 text-textGrey hover:bg-foreground/5 hover:text-foreground transition-all text-sm font-bold">Cancel</button>
          <button onClick={submit} disabled={saving} className="flex-1 py-3.5 rounded-xl bg-primary text-surface font-bold text-sm hover:opacity-90 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {saving ? <><span className="w-4 h-4 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />Saving…</> : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Medical Rescue Card Drawer ───────────────────────────────────────────
function EditRescueCardDrawer({
  card,
  onClose,
  onSave,
}: {
  card?: RescueCard;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    bloodType: card?.bloodType || "",
    allergies: card?.allergies || "",
    medicalConditions: card?.medicalConditions || "",
    emergencyContactName: card?.emergencyContactName || "",
    emergencyContactPhone: card?.emergencyContactPhone || "",
    homeAddress: card?.homeAddress || "",
    homeLat: card?.homeLat ?? null,
    homeLng: card?.homeLng ?? null,
  });

  const [saving, setSaving] = useState(false);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSearchAddress = async () => {
    if (!formData.homeAddress.trim()) {
      setError("Please enter an address first.");
      return;
    }

    setSearchingAddress(true);
    setError("");

    try {
      const res = await fetch("/api/geocode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: formData.homeAddress,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to find address.");
      }

      setFormData((prev) => ({
        ...prev,
        homeAddress: data.formattedAddress,
        homeLat: data.lat,
        homeLng: data.lng,
      }));
    } catch (err: any) {
      setError(err.message || "Failed to search address.");
    } finally {
      setSearchingAddress(false);
    }
  };

  const handleMapPick = async ({ lat, lng }: { lat: number; lng: number }) => {
    try {
      const res = await fetch("/api/reverse-geocode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lat, lng }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to resolve address.");
      }

      setFormData((prev) => ({
        ...prev,
        homeLat: lat,
        homeLng: lng,
        homeAddress: data.formattedAddress,
      }));
    } catch (err: any) {
      setFormData((prev) => ({
        ...prev,
        homeLat: lat,
        homeLng: lng,
      }));
      setError(err.message || "Failed to update address from map.");
    }
  };

  const submit = async () => {
    setSaving(true);
    setError("");

    try {
      await onSave(formData);
    } catch {
      setError("Failed to save Rescue Card.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm transition-all overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full sm:max-w-xl bg-surface border border-foreground/10 sm:rounded-2xl rounded-t-3xl shadow-2xl my-8">
        <div className="flex items-center justify-between px-8 py-6 border-b border-foreground/10 bg-foreground/2">
          <div>
            <h2 className="text-foreground font-extrabold text-xl tracking-tight">
              Medical Rescue Card
            </h2>
            <p className="text-textGrey text-sm mt-1">
              Update your emergency medical info
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-foreground/10 text-textGrey transition-colors">
            ✕
          </button>
        </div>

        <div className="px-8 py-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-textGrey font-bold uppercase tracking-widest">
                Blood Type
              </label>
              <select
                name="bloodType"
                value={formData.bloodType}
                onChange={handleChange}
                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-sm"
              >
                <option value="">Select</option>
                {BLOOD_TYPES.map((bt) => (
                  <option key={bt} value={bt}>
                    {bt}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-textGrey font-bold uppercase tracking-widest">
                Allergies
              </label>
              <input
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="e.g. Peanuts, Penicillin"
                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-textGrey font-bold uppercase tracking-widest">
              Medical Conditions
            </label>
            <input
              name="medicalConditions"
              value={formData.medicalConditions}
              onChange={handleChange}
              placeholder="e.g. Asthma, Diabetes"
              className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleChange}
              placeholder="Emergency contact name"
              className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-sm"
            />
            <input
              name="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={handleChange}
              placeholder="+60..."
              className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-sm"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs text-textGrey font-bold uppercase tracking-widest">
              Home Address
            </label>

            <div className="flex gap-3">
              <input
                name="homeAddress"
                value={formData.homeAddress}
                onChange={handleChange}
                placeholder="Enter your address"
                className="flex-1 bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-sm"
              />
              <button
                type="button"
                onClick={handleSearchAddress}
                disabled={searchingAddress}
                className="px-4 py-3 rounded-xl bg-primary text-white text-sm font-bold disabled:opacity-50"
              >
                {searchingAddress ? "Searching..." : "Find"}
              </button>
            </div>

            <MapPicker
              lat={formData.homeLat}
              lng={formData.homeLng}
              onPick={handleMapPick}
            />

            <p className="text-xs text-textGrey">
              Search your address, then click the map to fine-tune the exact location.
            </p>

            {formData.homeLat !== null && formData.homeLng !== null && (
              <div className="text-xs text-textGrey bg-foreground/5 rounded-xl px-4 py-3">
                Selected coordinates: {formData.homeLat}, {formData.homeLng}
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <div className="px-8 pb-8 pt-4 border-t border-foreground/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl border border-foreground/10 text-textGrey"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex-1 py-3.5 rounded-xl bg-red-600 text-white font-bold text-sm disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Rescue Card"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router  = useRouter();

  const [user, setUser]             = useState<UserProfile | null>(null);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [editOpen, setEditOpen]     = useState(false);
  const [rescueEditOpen, setRescueEditOpen] = useState(false);
  const [toast, setToast]           = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          setFetchError("Session not found. Please log in from the home page.");
          setLoading(false); return;
        }

        const res  = await fetch(`/api/user/${authUser.id}`);
        const data = await res.json();
        
        if (data.success) { setUser(data.user); } 
        else { setFetchError(data.error ?? "Could not load profile."); }
      } catch { setFetchError("Network error. Please refresh the page."); } 
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSaveProfile = async (updates: { name: string; regionCode: string }) => {
    if (!user) return;
    const res  = await fetch(`/api/user/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    setUser(data.user);
    setEditOpen(false);
    setToast("Profile updated successfully!");
    setTimeout(() => setToast(""), 3500);
  };

  const handleSaveRescueCard = async (updates: any) => {
    if (!user) return;
    // We pass the email from our state because the backend requires it!
    const res = await fetch(`/api/rescue-card`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, ...updates }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    
    // Update local state with the new rescue card so the QR code appears instantly
    setUser({ ...user, rescueCard: data.rescueCard });
    setRescueEditOpen(false);
    setToast("Rescue Card updated and QR generated!");
    setTimeout(() => setToast(""), 3500);
  };

  if (loading) {
    return (
      <div className="mx-auto mb-20 flex max-w-6xl flex-col gap-10 p-6 md:p-10">
        <div className="rounded-3xl border border-foreground/5 bg-surface p-8 shadow-sm">
          <Skeleton className="h-12 w-72" />
          <Skeleton className="mt-3 h-6 w-96" />
        </div>
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="lg:w-80 shrink-0 flex flex-col gap-6">
            <div className="bg-surface border border-foreground/10 shadow-sm rounded-3xl p-8">
              <div className="flex flex-col items-center gap-6">
                <Skeleton className="h-28 w-28 rounded-full" />
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-24 w-full rounded-2xl" />
              </div>
            </div>
            <Skeleton className="h-72 w-full rounded-3xl border border-foreground/10" />
          </div>
          <div className="flex-1 space-y-6">
            <Skeleton className="h-72 w-full rounded-3xl border border-foreground/10" />
            <Skeleton className="h-96 w-full rounded-3xl border border-foreground/10" />
          </div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col gap-10 p-10 max-w-6xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight">My <span className="text-primary">Profile</span></h1>
        <div className="flex flex-col gap-4 max-w-md bg-red-50 border border-red-100 p-6 rounded-2xl"><p className="text-red-600 font-medium">{fetchError}</p><button onClick={() => router.push("/")} className="self-start px-6 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 text-sm font-bold transition-colors shadow-sm">Return Home</button></div>
      </div>
    );
  }

  if (!user) return null;

  const role   = ROLE_CONFIG[user.role] ?? { label: user.role || "Resident", dot: "bg-textGrey" };
  const region = REGION_MAP[user.regionCode] ?? user.regionCode ?? "Not assigned";

  return (
    <>
      {toast && (
        <div className="fixed bottom-10 right-10 z-50 flex items-center gap-3 bg-surface border-l-4 border-primary text-foreground px-6 py-4 rounded-xl shadow-2xl text-sm font-bold animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></div>
          {toast}
        </div>
      )}

      <div className="flex flex-col gap-10 p-6 md:p-10 max-w-6xl mx-auto mb-20">
        
        {/* Header Section */}
        <div className="flex flex-wrap gap-6 items-center justify-between bg-surface border border-foreground/5 p-8 rounded-3xl shadow-sm">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">My <span className="text-primary">Profile</span></h1>
            <p className="text-lg text-textGrey font-medium">Manage your responder identity and medical rescue data.</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Identity Card */}
          <div className="lg:w-80 shrink-0 flex flex-col gap-6">
            <div className="bg-surface border border-foreground/10 shadow-sm rounded-3xl p-8 flex flex-col items-center gap-6">
              <Avatar name={user.name} />
              <div className="text-center space-y-2 w-full">
                <h2 className="text-foreground font-extrabold text-2xl leading-tight">{user.name || "Unnamed User"}</h2>
                <div className="flex items-center justify-center gap-2 bg-foreground/5 py-1.5 px-4 rounded-full w-fit mx-auto border border-foreground/10">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${role.dot} shadow-sm`} />
                  <span className="text-foreground font-semibold text-xs tracking-wide">{role.label}</span>
                </div>
              </div>
              <div className="w-full h-px bg-foreground/10" />
              <div className="w-full bg-primary/10 border border-primary/20 rounded-2xl px-5 py-4 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary/40" />
                <p className="text-xs text-primary/80 font-bold uppercase tracking-widest mb-1">Assigned Region</p>
                <p className="text-primary font-extrabold text-base">{region}</p>
              </div>
            </div>

            {/* QR Code Card (Only shows if QR code exists) */}
            {user.rescueCard?.qrCodeData && (
              <div className="bg-surface border border-red-500/20 shadow-sm rounded-3xl p-6 flex flex-col items-center gap-4">
                <h3 className="text-sm text-red-600 font-bold uppercase tracking-widest">Emergency QR</h3>
                <div className="bg-white p-2 rounded-xl border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={user.rescueCard.qrCodeData} alt="Medical QR Code" className="w-48 h-48" />
                </div>
                <p className="text-xs text-textGrey text-center font-medium">Scannable by first responders</p>
              </div>
            )}
          </div>

          {/* Right Column: Data Cards */}
          <div className="flex-1 space-y-6">
            
            {/* Account Details */}
            <div className="bg-surface border-2 border-green-500/20 shadow-sm rounded-3xl px-8 py-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500/80" />
              <div className="flex justify-between items-center pt-4 pb-4 border-b border-foreground/10">
                <h3 className="text-xs text-green-600 font-bold uppercase tracking-widest">Account Details</h3>
                <button onClick={() => setEditOpen(true)} className="text-sm font-bold text-green-600 bg-green-500/10 px-4 py-1.5 rounded-full hover:bg-green-500/20 transition-all">
                  Edit Identity
                </button>
              </div>
              <InfoRow label="Display Name" value={user.name} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} />
              <InfoRow label="Email Address" value={user.email} muted icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>} />
            </div>

            {/* Medical Rescue Card */}
            <div className="bg-surface border-2 border-red-500/20 shadow-sm rounded-3xl px-8 py-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500/80" />
              
              <div className="flex justify-between items-center pt-4 pb-4 border-b border-foreground/10">
                <h3 className="text-xs text-red-600 font-bold uppercase tracking-widest flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                  Medical Rescue Card
                </h3>
                <button onClick={() => setRescueEditOpen(true)} className="text-sm font-bold text-red-600 bg-red-500/10 px-4 py-1.5 rounded-full hover:bg-red-500/20 transition-all">
                  Update Card
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <InfoRow label="Blood Type" value={user.rescueCard?.bloodType || "Not Set"} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>} />
                <InfoRow label="Allergies" value={user.rescueCard?.allergies || "None declared"} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>} />
                <div className="md:col-span-2">
                  <InfoRow label="Medical Conditions" value={user.rescueCard?.medicalConditions || "None declared"} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>} />
                </div>
                <InfoRow label="Emergency Contact" value={user.rescueCard?.emergencyContactName || "Not Set"} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} />
                <InfoRow label="Contact Phone" value={user.rescueCard?.emergencyContactPhone || "Not Set"} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>} />
                <div className="md:col-span-2">
                  <InfoRow label="Home Base Location" value={user.rescueCard?.homeAddress || (user.rescueCard?.homeLat ? `${user.rescueCard.homeLat}, ${user.rescueCard.homeLng}` : "Not Set")} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {editOpen && <EditDrawer user={user} onClose={() => setEditOpen(false)} onSave={handleSaveProfile} />}
      {rescueEditOpen && <EditRescueCardDrawer card={user.rescueCard} onClose={() => setRescueEditOpen(false)} onSave={handleSaveRescueCard} />}
    </>
  );
}
