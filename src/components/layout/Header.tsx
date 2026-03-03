"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; 

export default function Header() {
  const pathname = usePathname(); 

  // --- Navigation Link List ---
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Alerts", href: "/alerts" },
    { name: "Resources", href: "/resources" },
    { name: "Supports", href: "/supports" },
    { name: "Settings", href: "/settings" },
  ];

  return (
    <header className="sticky top-0 z-50 flex flex-wrap gap-4 items-center justify-between bg-surface shadow-sm min-w-screen px-8 py-3">
      {/* --- Left Side --- */}
      <div className="flex items-center gap-3">
        {/* --- Logo --- */}
        <div className="flex items-center justify-center rounded-full bg-secondary/20 h-10 w-10">
          <span className="material-symbols-outlined text-2xl text-primary">spa</span> {/* Logo Icon from Google Material Symbols */}
        </div>

        {/* --- Title and Subtitle --- */}
        <div className="flex flex-col">
          <span className="text-xl font-extrabold text-primary">BorNEO AI</span>
          <span className="text-xs font-semibold text-textGrey">COMMUNITY RESILIENCE</span>
        </div>
      </div>

      {/* --- Middle Navigation Links --- */}
      <nav className="flex items-center gap-1 rounded-full bg-foreground/3 px-1 py-1">
        {navLinks.map((link) => (
          <Link
            href={link.href}
            className={`rounded-full px-5 py-2 no-underline text-sm font-semibold transition-all ease-in-out duration-300 ${
              pathname === link.href
                ? "bg-primary text-surface"             // Active Link Style: Green background with white text.
                : "text-textGrey hover:bg-secondary/20" // Inactive Link Style: Grey text that turns light green on hover.
            }`}
          >
            {link.name}
          </Link>
        ))}
      </nav>

      <div className="flex gap-4">
        {/* --- Search Bar --- */}
        <div className="flex items-center rounded-full bg-foreground/8 border-none px-3 py-1">
          <span className="material-symbols-outlined text-textGrey/60 text-xs">search</span> {/* Search Icon from Google Material Symbols */}
          <input placeholder="Find help..." className="rounded-full bg-transparent border-none outline-none placeholder:text-textGrey/60 placeholder:text-xs px-2"></input>
        </div>
        
        {/* --- Login Button --- */}
        <button className="flex items-center justify-center rounded-full border-primary border-2 text-primary font-bold px-5 py-1 transition-all duration-300 hover:bg-primary hover:text-white">Log in</button>
      </div>
    </header>
  );
}