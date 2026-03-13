"use client";

import { useEffect, useState } from "react";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";

const PROMPT_DURATION_MS = 2600;

function UnsupportedDispatchButton() {
  const [isPressed, setIsPressed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!showPrompt) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setShowPrompt(false);
    }, PROMPT_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [showPrompt]);

  const handleClick = () => {
    setIsPressed(true);
    setShowPrompt(true);

    window.setTimeout(() => {
      setIsPressed(false);
    }, 180);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-6 py-2 text-sm font-black text-white shadow-sm transition duration-200 hover:opacity-90 ${
          isPressed ? "scale-95" : "scale-100"
        }`}
      >
        <MedicalServicesOutlinedIcon />
        Dispatch Medical Team
      </button>

      <div
        className={`pointer-events-none fixed bottom-10 right-10 z-50 transition-all duration-300 ${
          showPrompt
            ? "translate-y-0 opacity-100"
            : "translate-y-3 opacity-0"
        }`}
        aria-live="polite"
      >
        <div className="rounded-xl border border-amber-200 bg-white px-5 py-4 text-sm font-semibold text-amber-700 shadow-2xl">
          This function is not supported yet.
        </div>
      </div>
    </>
  );
}

export default UnsupportedDispatchButton;
