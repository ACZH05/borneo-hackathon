"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const supabase = createClient();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [regionCode, setRegionCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              regionCode,
            },
          },
        });

        if (error) throw error;

        setMessage("Account created. Please check your email if confirmation is enabled.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        window.location.href = "/";
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Authentication failed";
      setMessage(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-10 p-10 max-w-3xl mx-auto">
      <div className="flex flex-col gap-4">
        <h1 className="text-6xl font-bold">
          <span>{mode === "login" ? "Log " : "Sign "}</span>
          <span className="text-primary">{mode === "login" ? "In" : "Up"}</span>
        </h1>

        <p className="text-xl text-textGrey">
          Secure access for residents and administrators of BorNEO AI.
        </p>
      </div>

      <div className="rounded-3xl bg-surface shadow-sm p-8">
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setMode("login")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              mode === "login"
                ? "bg-primary text-surface"
                : "text-textGrey bg-foreground/5"
            }`}
          >
            Log In
          </button>

          <button
            onClick={() => setMode("signup")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              mode === "signup"
                ? "bg-primary text-surface"
                : "text-textGrey bg-foreground/5"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "signup" && (
            <>
              <input
                className="rounded-2xl bg-foreground/8 px-4 py-3 outline-none"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="rounded-2xl bg-foreground/8 px-4 py-3 outline-none"
                placeholder="Region code"
                value={regionCode}
                onChange={(e) => setRegionCode(e.target.value)}
              />
            </>
          )}

          <input
            type="email"
            className="rounded-2xl bg-foreground/8 px-4 py-3 outline-none"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="rounded-2xl bg-foreground/8 px-4 py-3 outline-none"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-full border-2 border-primary text-primary font-bold px-5 py-3 transition-all duration-300 hover:bg-primary hover:text-white disabled:opacity-50"
          >
            {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
          </button>

          {message && <p className="text-sm text-textGrey">{message}</p>}
        </form>
      </div>
    </div>
  );
}