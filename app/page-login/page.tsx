"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";


// --- REUSABLE FORM COMPONENT (Moved OUTSIDE to prevent flashing!) ---
const FormContent = ({
  mode,
  loginMethod,
  setLoginMethod,
  handleToggle,
  isAnimating
}: {
  mode: "login" | "signup";
  loginMethod: "magic" | "password";
  setLoginMethod: (val: "magic" | "password") => void;
  handleToggle: () => void;
  isAnimating: boolean;
}) => {
  const isLoginMode = mode === "login";
  
  // --- NEW: Add state to track passwords ---
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // --- NEW: Simple Validation Logic ---
  const isPasswordLongEnough = password.length >= 8;
  const doPasswordsMatch = password === confirmPassword;
  
  // Disable Sign Up if conditions aren't met. (We don't disable Login mode)
  const isSubmitDisabled = !isLoginMode && (!isPasswordLongEnough || !doPasswordsMatch || password.length === 0);

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center animate-in fade-in duration-500 py-4">
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-5 shrink-0">
        <div className="flex items-center justify-center h-[80px] w-[80px] min-h-[80px] min-w-[80px] mb-2 shrink-0">
          <img src="/favicon.ico" alt="logo" className="h-full w-full object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Hachimi AI</h1>
        <p className="text-xs tracking-widest text-gray-500 uppercase mt-1">The Resilient Editorial</p>
      </div>

      {/* Dynamic Titles */}
      <h2 className="text-2xl font-bold text-[#1a1a1a] mb-1">
        {isLoginMode ? "Welcome Back" : "Join the Hub"}
      </h2>
      <p className="text-sm text-gray-500 mb-5 text-center">
        {isLoginMode ? "Please enter your details to sign in." : "Please enter your details to create an account."}
      </p>

      {/* Login Toggle */}
      {isLoginMode && (
        <div className="flex w-full bg-gray-100 rounded-full p-1 mb-5">
          <button
            onClick={() => setLoginMethod("magic")}
            className={`flex-1 py-1.5 text-sm font-medium rounded-full transition-all ${
              loginMethod === "magic" ? "bg-white text-[#1a1a1a] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Magic Link
          </button>
          <button
            onClick={() => setLoginMethod("password")}
            className={`flex-1 py-1.5 text-sm font-medium rounded-full transition-all ${
              loginMethod === "password" ? "bg-white text-[#1a1a1a] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Password
          </button>
        </div>
      )}

      {/* Inputs Stack */}
      <div className="w-full flex flex-col gap-2.5 mb-4">
        
        {/* 1. Sign Up Fields (Side-by-Side) */}
        {!isLoginMode && (
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-3 mb-1 block">Full Name</label>
              <input type="text" placeholder="John Doe" className="w-full bg-gray-100 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-[#183d2e]/30 transition-all" />
            </div>
          </div>
        )}

        {/* 2. Email & OTP Button */}
        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-3 mb-1 block">Email Address</label>
          <div className="flex gap-2">
            <input type="email" placeholder="HachimiAI@gmail.com" className="w-full bg-gray-100 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-[#183d2e]/30 transition-all" />
            {!isLoginMode && (
              <button type="button" className="bg-[#183d2e]/10 hover:bg-[#183d2e]/20 text-[#183d2e] text-xs font-bold px-4 rounded-xl transition-all whitespace-nowrap active:scale-95">
                Send OTP
              </button>
            )}
          </div>
        </div>

        {/* 3. Verification Code (Only on Sign Up) */}
        {!isLoginMode && (
          <div>
            <div className="flex justify-between items-center pr-3 mb-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-3 block">Verification Code</label>
              <span className="text-[10px] font-semibold text-gray-400">Check your inbox</span>
            </div>
            <input type="text" placeholder="Enter 6-digit OTP" maxLength={6} className="w-full bg-gray-100 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-[#183d2e]/30 transition-all tracking-[0.2em] font-medium text-center" />
          </div>
        )}

        {/* 4. Passwords (Side-by-Side during Sign Up!) */}
        {(!isLoginMode || loginMethod === "password") && (
          <div className={`flex w-full ${!isLoginMode ? "gap-3" : "flex-col"}`}>
            
            <div className="flex-1">
              <div className="flex justify-between items-center pr-3 mb-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-3 block">Password</label>
                {isLoginMode && <button type="button" className="text-[10px] font-bold text-[#183d2e] hover:underline">Forgot password?</button>}
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Min. 8 characters" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-gray-100 text-sm pl-4 pr-10 py-2.5 rounded-xl outline-none focus:ring-2 transition-all [&::-ms-reveal]:hidden [&::-ms-clear]:hidden ${
                    !isLoginMode && password.length > 0 && !isPasswordLongEnough 
                      ? "focus:ring-red-500 border border-red-500" 
                      : "focus:ring-[#183d2e]/30 border border-transparent"
                  }`} 
                />
                {/* Custom Eye Icon Toggle */}
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 flex items-center justify-center outline-none"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {/* Password Length Error */}
              {!isLoginMode && password.length > 0 && !isPasswordLongEnough && (
                <span className="text-[10px] text-red-500 font-semibold pl-3 mt-1 block">Too short</span>
              )}
            </div>

            {!isLoginMode && (
              <div className="flex-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-3 mb-1 block">Confirm Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full bg-gray-100 text-sm pl-4 pr-10 py-2.5 rounded-xl outline-none focus:ring-2 transition-all [&::-ms-reveal]:hidden [&::-ms-clear]:hidden ${
                      confirmPassword.length > 0 && !doPasswordsMatch 
                        ? "focus:ring-red-500 border border-red-500" 
                        : "focus:ring-[#183d2e]/30 border border-transparent"
                    }`} 
                  />
                  {/* Custom Eye Icon Toggle */}
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 flex items-center justify-center outline-none"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {/* Password Match Error */}
                {confirmPassword.length > 0 && !doPasswordsMatch && (
                  <span className="text-[10px] text-red-500 font-semibold pl-3 mt-1 block">Doesn't match</span>
                )}
              </div>
            )}
            
          </div>
        )}
      </div>

      {/* Main Action Button */}
      <button 
        disabled={isSubmitDisabled}
        className={`w-full font-medium py-3 rounded-full flex items-center justify-center gap-2 transition-all shadow-md ${
          isSubmitDisabled 
            ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
            : "bg-[#183d2e] hover:bg-[#122e22] text-white active:scale-[0.98]"
        }`}
      >
        {isLoginMode ? (loginMethod === "magic" ? "Send Magic Link" : "Login") : "Sign Up"}
        {isLoginMode && loginMethod === "magic" && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
      </button>

      {/* Switch State Link */}
      <div className="mt-5 text-sm text-gray-500 flex gap-1">
        {isLoginMode ? "Don't have an account?" : "Already have an account?"}
        <button 
          onClick={handleToggle} 
          disabled={isAnimating}
          className={`font-bold text-[#183d2e] hover:underline ${isAnimating ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isLoginMode ? "Sign Up" : "Sign In"}
        </button>
      </div>
      
      <div className="mt-6 text-[10px] text-gray-400 tracking-wider md:hidden uppercase flex gap-4">
        <Link href="#" className="hover:text-gray-600">Privacy Policy</Link>
      </div>
    </div>
  );
};

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [visibleMode, setVisibleMode] = useState<"login" | "signup">("login");
  const [loginMethod, setLoginMethod] = useState<"magic" | "password">("magic");
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    const nextIsLogin = !isLogin;
    setIsLogin(nextIsLogin);

    setTimeout(() => {
      setVisibleMode(nextIsLogin ? "login" : "signup");
    }, 300);

    setTimeout(() => {
      setIsAnimating(false);
    }, 700);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 md:p-8 pt-12 pb-20">
      
      {/* MOBILE LAYOUT */}
      <div className="w-full max-w-md mt-12 md:hidden flex flex-col items-center">
        <div className="bg-white w-full rounded-[2.5rem] shadow-xl p-8 pt-10">
          <FormContent 
            mode={isLogin ? "login" : "signup"} 
            loginMethod={loginMethod}
            setLoginMethod={setLoginMethod}
            handleToggle={handleToggle}
            isAnimating={isAnimating}
          /> 
        </div>
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="hidden md:flex relative w-full max-w-[1000px] h-[650px] bg-white rounded-[2.5rem] shadow-xl overflow-hidden mt-12">
        
        {/* LEFT: Image Panel */}
        <div 
          className={`absolute top-0 w-1/2 h-full z-10 transition-transform duration-700 ease-in-out ${
            isLogin ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0 bg-[#183d2e]">
            <Image 
              src="/login-bg.jpeg"
              alt="Background"
              fill
              className="object-cover opacity-90"
            />
          </div>

          {/* Main Slogan & New Subtitle */}
          <div className="absolute top-1/2 left-12 -translate-y-1/2 text-white max-w-[320px]">
            <h1 className="text-5xl font-bold leading-tight drop-shadow-md mb-6">
              Building<br/>stronger,<br/>together.
            </h1>
            {/* --- NEW: Professional Subtitle --- */}
            <p className="text-sm text-white/80 leading-relaxed font-light drop-shadow-sm border-l-2 border-white/30 pl-4">
              Empowering communities with AI-driven disaster preparedness, real-time alerts, and unified resilience planning.
            </p>
          </div>

          {/* --- NEW: System Status Badge (Bottom Left) --- */}
          <div className="absolute bottom-10 left-12 flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2.5 shadow-lg transition-transform hover:scale-105 cursor-default">
            {/* Pulsing Green Dot */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            {/* Badge Text */}
            <span className="text-xs font-medium text-white tracking-wide drop-shadow-sm">
              BorNEO Network Active
            </span>
          </div>
        </div>

        {/* RIGHT: Form Panel */}
        <div 
          className={`absolute top-0 w-1/2 h-full bg-white flex flex-col justify-center items-center px-12 transition-transform duration-700 ease-in-out ${
            isLogin ? "translate-x-full" : "translate-x-0"
          }`}
        >
          <FormContent 
            mode={visibleMode} 
            loginMethod={loginMethod}
            setLoginMethod={setLoginMethod}
            handleToggle={handleToggle}
            isAnimating={isAnimating}
          />
        </div>
      </div>
    </div>
  );
}