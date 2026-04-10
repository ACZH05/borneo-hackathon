"use client";

import { useState } from "react";

export default function UpdatePasswordPage() {
  // --- States ---
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // --- Validation ---
  const isPasswordLongEnough = password.length >= 8;
  const doPasswordsMatch = password === confirmPassword;
  const isSubmitDisabled = loading || !password || !confirmPassword || !isPasswordLongEnough || !doPasswordsMatch;

  // --- Action Handler ---
  const handleUpdatePassword = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // 1. Grab the token your AuthListener saved when the page loaded!
      const token = localStorage.getItem("supabase.auth.token");
      
      if (!token) {
        throw new Error("Invalid or expired session. Please click the reset link in your email again.");
      }

      // 2. Use raw fetch to update the password, matching your exact architecture
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error_description || data.msg || "Failed to update password.");

      setMessage({ type: 'success', text: "Password updated successfully! Redirecting..." });

      // Wait 2 seconds, then send to Home!
      setTimeout(() => {
        window.location.replace("/");
      }, 2000);

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl p-8 pt-10 flex flex-col items-center animate-in fade-in duration-500">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 shrink-0">
          <div className="flex items-center justify-center h-[80px] w-[80px] min-h-[80px] min-w-[80px] mb-2 shrink-0">
            <img src="/favicon.ico" alt="logo" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Hachimi AI</h1>
        </div>

        {/* Dynamic Titles */}
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-1 text-center">
          Secure Your Account
        </h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Please enter your new password below.
        </p>

        {/* Message Banner */}
        {message && (
          <div className={`w-full p-3 rounded-xl text-xs font-bold mb-4 text-center animate-in slide-in-from-top-2 ${
            message.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Inputs */}
        <div className="w-full flex flex-col gap-4 mb-6">
          <div className="flex-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-3 mb-1 block">New Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Min. 8 chars" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-gray-100 text-sm pl-4 pr-10 py-3 rounded-xl outline-none focus:ring-2 transition-all [&::-ms-reveal]:hidden [&::-ms-clear]:hidden ${
                  password.length > 0 && !isPasswordLongEnough 
                    ? "focus:ring-red-500 border border-red-500" 
                    : "focus:ring-[#183d2e]/30 border border-transparent"
                }`} 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 outline-none"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {password.length > 0 && !isPasswordLongEnough && (
              <span className="text-[10px] text-red-500 font-semibold pl-3 mt-1 block">Too short</span>
            )}
          </div>

          <div className="flex-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-3 mb-1 block">Confirm New Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full bg-gray-100 text-sm pl-4 pr-10 py-3 rounded-xl outline-none focus:ring-2 transition-all [&::-ms-reveal]:hidden [&::-ms-clear]:hidden ${
                  confirmPassword.length > 0 && !doPasswordsMatch 
                    ? "focus:ring-red-500 border border-red-500" 
                    : "focus:ring-[#183d2e]/30 border border-transparent"
                }`} 
              />
            </div>
            {confirmPassword.length > 0 && !doPasswordsMatch && (
              <span className="text-[10px] text-red-500 font-semibold pl-3 mt-1 block">Doesn't match</span>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="button"
          onClick={handleUpdatePassword}
          disabled={isSubmitDisabled}
          className={`w-full font-medium py-3 rounded-full flex items-center justify-center transition-all shadow-md ${
            isSubmitDisabled 
              ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
              : "bg-[#183d2e] hover:bg-[#122e22] text-white active:scale-[0.98]"
          }`}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
}