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
      // 1. Tell the official Supabase client to log us in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw new Error(error.message || "Invalid login credentials.");

      // 2. 🚨 THE FIX: Manually save the custom token for your AuthListener!
      if (data.session) {
        localStorage.setItem("supabase.auth.token", data.session.access_token);
      }

      return { success: true, user: data.user, session: data.session };
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // --- C. SIGN UP & SEND OTP ---
  const signUpAndSendOtp = async (email: string, password?: string, fullName?: string) => {
    setLoading(true); 
    setMessage(null);
    try {
     
      const checkRes = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const checkData = await checkRes.json();

    
      if (checkData.exists) {
        throw new Error("Account already exists. Please switch to 'Sign In' to log in.");
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) throw new Error(error.message);

      setMessage({ type: 'success', text: 'OTP sent! Check your inbox.' });
      return { success: true };
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // --- D. VERIFY OTP (COMPLETE SIGNUP) ---
  const verifyOtpAndLogin = async (email: string, otp: string) => {
    setLoading(true); setMessage(null);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'signup' 
      });

      if (error) throw new Error(error.message || "Invalid verification code.");

      // 🚨 THE CRITICAL FIX: 
      // Force the Supabase SDK to officially save this session so it survives a browser refresh!
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      requestUserLocation();
      
      return { success: true, user: data.user, session: data.session };
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };
  
  // --- E. SEND PASSWORD RESET ---
  const sendPasswordReset = async (email: string) => {
    setLoading(true); 
    setMessage(null);
    try {
      // 🚨 1. Check your new secure API route first!
      const checkRes = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const checkData = await checkRes.json();

      // If the API says they don't exist, stop everything and throw an error!
      if (!checkData.exists) {
        throw new Error("Account not found. Please switch to 'Sign Up' to create an account.");
      }

      // 🚨 2. If they DO exist, proceed with the official Supabase reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/page-resetPassword`, // Adjust to match your URL
      });

      if (error) throw new Error(error.message);

      setMessage({ type: 'success', text: 'Password reset link sent! Check your inbox.' });
      return { success: true };
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
      return { success: false };
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