"use client";

import { useEffect,  useState } from "react";
import { requestUserLocation } from "@/app/api/permission/route";

// --- Login Status Listener ---
// Once the user is redirected back from the magic link, this component will detect the token in the URL, store it and sync the user info to our database.
export default function AuthListener() {
  useEffect(() => {
    const syncUser = async () => {
      // 1. Check if there's an access token (already login or not) in the URL hash (after redirect from magic link).
      const hash = window.location.hash;
      if (!hash || !hash.includes("access_token")) return;

      // 2. Extract the token from the URL hash.
      const params = new URLSearchParams(hash.replace("#", "?"));
      const token = params.get("access_token");

      if (token) {
        // 3. Store the token in localStorage for Supabase client to use.
        localStorage.setItem("supabase.auth.token", token);

        try {
          // 4. Fetch the user's info from Supabase using the token to authenticate.
          const userRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
            headers: {
              "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              "Authorization": `Bearer ${token}`
            }
          });
          const userData = await userRes.json();

          if (userData?.id) {
            // 5. Sync the user info to our Prisma database by calling our Next.js API route. (Must be done server-side to keep our database secure and prevent exposing credentials to the client.)
            await fetch("/api/auth/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: userData.id,
                email: userData.email,
                name: "Resident" // Default name, can be updated later in user settings.
              })
            });
            console.log("User successfully synced to Prisma Database!");
          }
        } catch (error) {
          console.error("Failed to sync user:", error);
        } finally {
          // 6. Clean up the URL by removing the token from the hash and show a success message.
          window.history.replaceState(null, "", window.location.pathname);
          alert("Login successful!");

          // 7. Request location permission after successful login.
          requestUserLocation();
        }
      }
    };

    // 8. Run the sync function when the component mounts to check for the token in the URL.
    syncUser(); 
  }, []);

  return null; // This component doesn't need to display anything, it only works in the background.
}

// --- Check Authentication Status ---
// Checks if the user is currently logged in by looking for the token in localStorage. 
// This can be used across the app to conditionally render content based on login status.
export function AuthStatus() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    // 1. Look for the token in localStorage.
    const token = localStorage.getItem("supabase.auth.token");
    
    // 2. If token exists, user is logged in. Otherwise, they're not.
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }

    setIsLoading(false); 
  }, []);

  return { isLoggedIn, isLoading }; 
}

// --- Login ---
export function Login() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // --- API Keys from Environment Variables ---
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // --- Magic Link Authentication Function ---
  const sendMagicLink = async (email: string) => {
    if (!email) return;
    
    setLoading(true); // Start loading state.
    setMessage(null); // Clear previous messages.

    try {
      // 1. Send request to Supabase Auth API to send a magic link to the user's email.
      const response = await fetch(`${SUPABASE_URL}/auth/v1/otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY!,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          email,
          options: {
            shouldCreateUser: true,
            emailRedirectTo: `${window.location.origin}`,
          }
        })
      });

      // 2. Handle the response from Supabase.
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error_description || data.msg || "Failed to send link");
      }

      setMessage({ type: 'success', text: "Check your email for the magic link!" });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return { sendMagicLink, loading, message };
}

// --- Logout ---
export const Logout = async () => {
  // 1. Look for the token in localStorage.
  const token = localStorage.getItem("supabase.auth.token"); 

  if (token) {
    try {
      // 2. Inform Supabase about the logout so it can invalidate the session on their end.
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

  // 3. Remove the token from localStorage to log the user out on the client side.
  localStorage.removeItem("supabase.auth.token");

  // 4. Reload the page to update the UI and reflect the logged-out state.
  window.location.reload(); 
};