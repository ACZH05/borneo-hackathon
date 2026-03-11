"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase"; 

// ─── Types ─────────────────────────────────────────────────────────────────────
interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  regionCode: string;
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

// Roles match your database!
const ROLE_CONFIG: Record<string, { label: string; dot: string }> = {
  admin:    { label: "Administrator", dot: "bg-orange-400" },
  resident: { label: "Resident",      dot: "bg-primary" },
};

// ─── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name }: { name: string }) {
  const encodedName = encodeURIComponent(name || "User");
  const avatarUrl = `https://api.dicebear.com/7.x/micah/svg?seed=${encodedName}&backgroundColor=f1f5f9`;

  return (
    <div className="relative shrink-0 drop-shadow-md">
      {/* Ring - Fixed Tailwind warnings here */}
      <div className="w-28 h-28 rounded-full p-0.75 bg-linear-to-br from-primary via-primary/60 to-transparent">
        <div className="w-full h-full rounded-full overflow-hidden bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl}
            alt={`${name} avatar`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      {/* Online indicator */}
      <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-primary border-4 border-surface" />
    </div>
  );
}

// ─── Info Row ──────────────────────────────────────────────────────────────────
function InfoRow({
  icon,
  label,
  value,
  muted,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  muted?: boolean;
}) {
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

// ─── Edit Drawer ───────────────────────────────────────────────────────────────
function EditDrawer({
  user,
  onClose,
  onSave,
}: {
  user: UserProfile;
  onClose: () => void;
  onSave: (d: { name: string; regionCode: string }) => Promise<void>;
}) {
  const [name, setName] = useState(user.name ?? "");
  const [regionCode, setRegionCode] = useState(user.regionCode ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!name.trim()) { setError("Name cannot be empty."); return; }
    setSaving(true);
    setError("");
    try {
      await onSave({ name: name.trim(), regionCode });
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm transition-all"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Panel */}
      <div className="w-full sm:max-w-lg bg-surface border border-foreground/10 sm:rounded-2xl rounded-t-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-foreground/20" />
        </div>

        {/* Header - Fixed Tailwind warning here */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-foreground/10 bg-foreground/2">
          <div>
            <h2 className="text-foreground font-extrabold text-xl tracking-tight">Edit Profile</h2>
            <p className="text-textGrey text-sm mt-1">Update your identity and region</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-foreground/10 text-textGrey hover:text-foreground transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Fields */}
        <div className="px-8 py-6 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-xs text-textGrey font-bold uppercase tracking-widest">Display Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3.5 text-foreground placeholder-textGrey/50 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            />
          </div>

          {/* Region */}
          <div className="space-y-2">
            <label className="text-xs text-textGrey font-bold uppercase tracking-widest">Assigned Region</label>
            <select
              value={regionCode}
              onChange={(e) => setRegionCode(e.target.value)}
              className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3.5 text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm cursor-pointer appearance-none"
            >
              <option value="" disabled>Select your region</option>
              {REGION_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Email (locked) - Fixed Tailwind warning here */}
          <div className="space-y-2">
            <label className="text-xs text-textGrey font-bold uppercase tracking-widest flex items-center gap-2">
              Email Address
              <span className="normal-case tracking-normal font-medium bg-foreground/10 text-textGrey px-2 py-0.5 rounded-full text-[10px]">
                Read-Only
              </span>
            </label>
            <input
              value={user.email}
              disabled
              className="w-full bg-foreground/3 border border-foreground/5 rounded-xl px-4 py-3.5 text-textGrey text-sm cursor-not-allowed"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl border border-foreground/10 text-textGrey hover:bg-foreground/5 hover:text-foreground transition-all text-sm font-bold"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex-1 py-3.5 rounded-xl bg-primary text-surface font-bold text-sm hover:opacity-90 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
                Saving…
              </>
            ) : "Save Changes"}
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
  const [toast, setToast]           = useState("");

  // Fetch Supabase auth user ID → then load profile from our API
  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          setFetchError("Session not found. Please log in from the home page.");
          setLoading(false);
          return;
        }

        const res  = await fetch(`/api/user/${authUser.id}`);
        const data = await res.json();
        
        if (data.success) {
          setUser(data.user);
        } else {
          setFetchError(data.error ?? "Could not load profile.");
        }

      } catch {
        setFetchError("Network error. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (updates: { name: string; regionCode: string }) => {
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

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex flex-col gap-10 p-10 max-w-6xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight">
          My <span className="text-primary">Profile</span>
        </h1>
        <div className="flex items-center gap-4 text-textGrey font-medium">
          <span className="w-6 h-6 border-2 border-textGrey/30 border-t-primary rounded-full animate-spin" />
          Securely loading your data...
        </div>
      </div>
    );
  }

  // ── Error ──
  if (fetchError) {
    return (
      <div className="flex flex-col gap-10 p-10 max-w-6xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight">
          My <span className="text-primary">Profile</span>
        </h1>
        <div className="flex flex-col gap-4 max-w-md bg-red-50 border border-red-100 p-6 rounded-2xl">
          <p className="text-red-600 font-medium">{fetchError}</p>
          <button
            onClick={() => router.push("/")}
            className="self-start px-6 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 text-sm font-bold transition-colors shadow-sm"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const role   = ROLE_CONFIG[user.role] ?? { label: user.role || "Resident", dot: "bg-textGrey" };
  const region = REGION_MAP[user.regionCode] ?? user.regionCode ?? "Not assigned";

  return (
    <>
      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-10 right-10 z-50 flex items-center gap-3 bg-surface border-l-4 border-primary text-foreground px-6 py-4 rounded-xl shadow-2xl text-sm font-bold animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          {toast}
        </div>
      )}

      <div className="flex flex-col gap-10 p-6 md:p-10 max-w-6xl mx-auto">
        {/* ── Page Title ── */}
        <div className="flex flex-wrap gap-6 items-center justify-between bg-surface border border-foreground/5 p-8 rounded-3xl shadow-sm">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
              My <span className="text-primary">Profile</span>
            </h1>
            <p className="text-lg text-textGrey font-medium">
              Manage your responder identity and regional assignment.
            </p>
          </div>

          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-primary text-surface hover:opacity-90 hover:shadow-lg transition-all font-bold text-sm shadow-md"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Profile
          </button>
        </div>

        {/* ── Main Content ── */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Left — Identity Card ── */}
          <div className="lg:w-80 shrink-0 bg-surface border border-foreground/10 shadow-sm hover:shadow-md transition-shadow rounded-3xl p-8 flex flex-col items-center gap-6 h-fit">
            <Avatar name={user.name} />

            {/* Name & role */}
            <div className="text-center space-y-2 w-full">
              <h2 className="text-foreground font-extrabold text-2xl leading-tight">
                {user.name || "Unnamed User"}
              </h2>
              <div className="flex items-center justify-center gap-2 bg-foreground/5 py-1.5 px-4 rounded-full w-fit mx-auto border border-foreground/10">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${role.dot} shadow-sm`} />
                <span className="text-foreground font-semibold text-xs tracking-wide">{role.label}</span>
              </div>
            </div>

            <div className="w-full h-px bg-foreground/10" />

            {/* Region badge */}
            <div className="w-full bg-primary/10 border border-primary/20 rounded-2xl px-5 py-4 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary/40" />
              <p className="text-xs text-primary/80 font-bold uppercase tracking-widest mb-1">Assigned Region</p>
              <p className="text-primary font-extrabold text-base">{region}</p>
            </div>

            {/* ID */}
            <p className="text-[10px] text-textGrey/50 font-mono tracking-widest text-center break-all uppercase">
              UUID • {user.id}
            </p>
          </div>

          {/* ── Right — Details ── */}
          <div className="flex-1 space-y-6">

            {/* Account details card */}
            <div className="bg-surface border border-foreground/10 shadow-sm rounded-3xl px-8 py-4">
              <h3 className="text-xs text-textGrey font-bold uppercase tracking-widest pt-4 pb-4 border-b border-foreground/10">
                Account Details
              </h3>

              <InfoRow
                label="Display Name"
                value={user.name}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                }
              />
              <InfoRow
                label="Email Address"
                value={user.email}
                muted
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                }
              />
              <InfoRow
                label="Clearance Role"
                value={role.label}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                }
              />
              <InfoRow
                label="Operational Region"
                value={region}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                }
              />
            </div>

            {/* Editable fields callout */}
            <div className="flex items-start gap-4 bg-primary/5 border border-primary/20 rounded-3xl px-7 py-5 shadow-sm">
              <svg className="text-primary shrink-0 mt-0.5" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p className="text-sm text-textGrey leading-relaxed font-medium">
                You can edit your <span className="text-foreground font-bold">display name</span> and{" "}
                <span className="text-foreground font-bold">assigned region</span> at any time. Your email is securely managed by the authentication provider.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ── Edit Drawer ── */}
      {editOpen && (
        <EditDrawer
          user={user}
          onClose={() => setEditOpen(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}