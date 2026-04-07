"use client";

export default function Footer() {
  return (
    <footer
      id="site-footer"
      className="flex flex-wrap gap-6 items-center justify-between bg-surface border-t border-foreground/20 shadow-sm w-full px-8 py-4"
    >
      <div className="flex items-center gap-3">
        {/* --- Logo --- */}
        <div className="flex items-center justify-center rounded-full bg-secondary/20 h-10 w-10">
          <img src="/favicon.ico" alt="logo" className="h-full w-full" />
        </div>

        {/* --- Copyright --- */}
        <span className="text-xs text-textGrey">
          © 2026 HACHIMI AI. All rights reserved.
        </span>
      </div>

      {/* --- Footer Links --- */}
      <div className="flex items-center text-xs text-textGrey gap-3 ml-auto">
        <span>Privacy</span>
        <span>Terms</span>
        <span>Accessibility</span>
      </div>
    </footer>
  );
}
