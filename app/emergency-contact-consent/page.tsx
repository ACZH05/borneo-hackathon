"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type ConsentRequest = {
  requesterName?: string | null;
  requesterEmail: string;
  emergencyContactName?: string | null;
  pendingEmail: string;
  status: string;
  expiresAt: string;
};

export default function EmergencyContactConsentPage() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [consentRequest, setConsentRequest] = useState<ConsentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Missing consent token.");
      setLoading(false);
      return;
    }

    const loadConsentRequest = async () => {
      try {
        const response = await fetch(`/api/emergency-contact-consent?token=${encodeURIComponent(token)}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to load consent request.");
        }

        setConsentRequest(data.consentRequest);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load consent request.");
      } finally {
        setLoading(false);
      }
    };

    loadConsentRequest();
  }, [token]);

  const handleAction = async (action: "approve" | "decline") => {
    if (!token) {
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/emergency-contact-consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, action }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to update consent request.");
      }

      setConsentRequest((current) =>
        current ? { ...current, status: data.status } : current
      );
      setMessage(data.message || "Consent updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update consent request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center p-6">
      <div className="w-full rounded-3xl border border-foreground/10 bg-surface p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold text-foreground">Emergency Contact Consent</h1>

        {loading && <p className="mt-4 text-sm text-textGrey">Loading request...</p>}
        {!loading && error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {!loading && consentRequest && (
          <div className="mt-6 space-y-5">
            <p className="text-sm text-textGrey">
              {consentRequest.requesterName || consentRequest.requesterEmail} wants to list
              <span className="font-bold text-foreground"> {consentRequest.pendingEmail} </span>
              as an emergency contact Gmail.
            </p>
            <div className="rounded-2xl bg-foreground/5 p-5 text-sm text-foreground">
              <p><span className="font-semibold">Requester:</span> {consentRequest.requesterName || "Unknown user"}</p>
              <p><span className="font-semibold">Requester email:</span> {consentRequest.requesterEmail}</p>
              <p><span className="font-semibold">Emergency contact name:</span> {consentRequest.emergencyContactName || "Not provided"}</p>
              <p><span className="font-semibold">Status:</span> {consentRequest.status}</p>
            </div>

            {consentRequest.status === "pending" && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleAction("approve")}
                  disabled={submitting}
                  className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Approve"}
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("decline")}
                  disabled={submitting}
                  className="rounded-xl border border-foreground/10 px-5 py-3 text-sm font-bold text-foreground disabled:opacity-50"
                >
                  Decline
                </button>
              </div>
            )}

            {message && <p className="text-sm text-green-700">{message}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
