"use client";

import { JSX, useState } from "react";
import { Login } from "@/app/api/auth/verification/route";

interface AuthWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthWindow({ isOpen, onClose }: AuthWindowProps): JSX.Element | null {
  const [email, setEmail] = useState("");
  const { sendMagicLink, loading, message } = Login();

  if (!isOpen) return null; // If the window is not open, render nothing.

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-3">
      
      {/* --- Background Overlay --- */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* --- Window Pop Up Animation --- */}
      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>

      {/* --- Authentication Window Body --- */}
      <div className={`
        relative bg-background w-full max-w-md 
        rounded-t-[2.5rem] rounded-[2.5rem] 
        shadow-2xl p-8 flex flex-col items-center gap-8 
        animate-[slide-up_0.4s_ease-out]
      `}>

        {/* --- Header Content --- */}
        <div className="flex flex-col items-center gap-3 text-primary">
          {/* --- Icon --- */}
          <div className="rounded-full bg-secondary/20 h-16 w-16 flex items-center justify-center">
            <span className="material-symbols-outlined " style={{ fontSize: "2rem" }}>spa</span>
          </div>

          {/* --- Title and Description --- */}
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-textGrey text-sm text-center">
            Enter your email to receive a <b>Magic Link</b>. <br/>
            No password required.
          </p>
        </div>

        {/* --- Input and Button --- */}
        <div className="flex flex-col gap-3 w-full">
          {/* --- Email Input Field --- */}
          <div className="relative flex items-center text-textGrey/60">
            <span className="material-symbols-outlined absolute px-4">mail</span>
            <input 
              onChange={(e) => setEmail(e.target.value)}
              value={email} 
              placeholder="your@email.com"
              className="w-full rounded-full border-2 border-transparent bg-foreground/8 focus:border-primary/30 focus:bg-white text-textBlack text-sm font-medium outline-none px-12 py-4" />
          </div>
          
          {/* --- Send Magic Link Button --- */}
          <button 
            onClick={() => sendMagicLink(email)} 
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 rounded-full shadow-lg font-bold py-4 transition-all duration-300 ${loading 
              ? "bg-primary/70 text-white/90 cursor-not-allowed"
              : "bg-primary text-white active:scale-[0.98]"      
            }`}
          >
            Send Magic Link
          </button>

          {/* --- Message Display (Below Send Button) --- */}
          {message && (
            <p className={`text-sm font-bold text-center mt-2 ${
                message.type === 'error' ? 'text-red-500' : 'text-primary'
              }`}
            >
              {message.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}