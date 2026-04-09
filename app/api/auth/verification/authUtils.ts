"use client";

import { useEffect, useState } from "react";
import { requestUserLocation } from "@/app/lib/permission/location";
import { supabase } from "@/app/lib/database/supabase";

// ==========================================
// 1. AUTH LISTENER (Magic Link & Redirects)
// ==========================================
export default function AuthListener() {
  useEffect(() => {
    const syncUser = async () => {
      const hash = window.location.hash;
      if (!hash || !hash.includes("access_token")) return;

      const params = new URLSearchParams(hash.replace("#", "?"));
      const token = params.get("access_token");

      if (token) {
        localStorage.setItem("supabase.auth.token", token);

        try {
          const userRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
            headers: {
              "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              "Authorization": `Bearer ${token}`
            }
          });
          const userData = await userRes.json();

          if (userData?.id) {
            await fetch("/api/auth/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: userData.id,
                email: userData.email,
                name: "Resident" // Existing users logging in via magic link
              })
            });
            console.log("User successfully synced to Prisma Database!");
          }
        } catch (error) {
          console.error("Failed to sync user:", error);
        } finally {
          window.history.replaceState(null, "", window.location.pathname);
          alert("Login successful!");
          requestUserLocation();
        }
      }
    };

    syncUser(); 
  }, []);

  return null;
}

// ==========================================
// 2. AUTH STATUS CHECKER
// ==========================================
export function AuthStatus() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const token = localStorage.getItem("supabase.auth.token");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
    setIsLoading(false); 
  }, []);

  return { isLoggedIn, isLoading }; 
}

// ==========================================
// 3. MAIN LOGIN & SIGNUP HOOK
// ==========================================
export function Login() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const headers = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
  };

  // --- A. MAGIC LINK (STRICTLY LOGIN ONLY) ---
  const sendMagicLink = async (email: string) => {
    if (!email) return;
    setLoading(true); setMessage(null);

    try {
      // 1. Ask Prisma if the user exists first!
      const checkRes = await fetch("/api/auth/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const { exists } = await checkRes.json();

      // 2. If they don't exist in Prisma, stop and show the error!
      if (!exists) {
        setMessage({ type: 'error', text: "Account not found. Please Sign Up first." });
        return false;
      }

      // 3. If they DO exist, tell Supabase to send the magic link
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}`,
        }
      });

      if (error) throw error;

      setMessage({ type: 'success', text: "Check your email for the magic link!" });
      return true;
    } catch (error: any) {
      setMessage({ type: 'error', text: "Failed to send link." });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // --- B. PASSWORD LOGIN ---
  const loginWithPassword = async (email: string, password: string) => {
    setLoading(true); setMessage(null);
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers,
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error_description || "Invalid login credentials.");

      // Store token and trigger location (simulating what the listener does)
      localStorage.setItem("supabase.auth.token", data.access_token);
      requestUserLocation();
      return { success: true, user: data.user, token: data.access_token };
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // --- C. SIGN UP (SEND OTP) ---
  const signUpAndSendOtp = async (email: string, password: string, name: string) => {
    setLoading(true); setMessage(null);
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          email,
          password,
          data: { full_name: name }
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error_description || data.msg || "Failed to sign up.");
      
      setMessage({ type: 'success', text: "Verification code sent to your email!" });
      return true;
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // --- D. VERIFY OTP (COMPLETE SIGNUP) ---
  const verifyOtpAndLogin = async (email: string, otp: string) => {
    setLoading(true); setMessage(null);
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          type: "signup",
          email,
          token: otp
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error_description || data.msg || "Invalid verification code.");

      // Store token
      localStorage.setItem("supabase.auth.token", data.access_token);
      requestUserLocation();
      return { success: true, user: data.user, token: data.access_token };
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };
  
  // --- E. FORGOT PASSWORD (SEND RESET LINK) ---
  const sendPasswordReset = async (email: string) => {
    setLoading(true); setMessage(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // This is the page we will create next!
        redirectTo: `${window.location.origin}/update-password`, 
      });

      if (error) throw error;

      setMessage({ type: 'success', text: "Password reset link sent! Check your email." });
      return true;
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || "Failed to send reset link." });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { sendMagicLink, loginWithPassword, signUpAndSendOtp, verifyOtpAndLogin, sendPasswordReset, loading, message, setMessage };
}

// ==========================================
// 4. LOGOUT
// ==========================================
export const Logout = async () => {
  const token = localStorage.getItem("supabase.auth.token"); 

  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Error clearing Supabase client session:", error);
  }

  if (token) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          "Authorization": `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  localStorage.removeItem("supabase.auth.token");
  Object.keys(localStorage).forEach((key) => {
    if (/^sb-.*-auth-token$/.test(key)) {
      localStorage.removeItem(key);
    }
  });

  window.location.replace("/");
};