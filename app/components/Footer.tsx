"use client";
import { usePathname } from "next/navigation";

type FooterMode = "user-flow" | "admin-fixed";

export default function Footer({ mode }: { mode: FooterMode }) {
  const pathname = usePathname();
  if (pathname === "/page-resetPassword" || pathname === "/page-login") return null;

  const footerClassName =
    mode === "admin-fixed"
      ? "fixed inset-x-0 bottom-0 z-40 flex h-24 sm:h-20 flex-col sm:flex-row items-center justify-between gap-2 sm:gap-6 bg-surface border-t border-foreground/20 shadow-sm w-full px-4 sm:px-8"
      : "flex flex-wrap gap-6 items-center justify-between bg-surface border-t border-foreground/20 shadow-sm w-full px-8 py-4";

  return (
    <footer
      id="site-footer"
      className={footerClassName}
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
      <div className="flex items-center text-xs text-textGrey gap-3 sm:ml-auto">
        <span>Privacy</span>
        <span>Terms</span>
        <span>Accessibility</span>
      </div>
    </footer>
  );
}
