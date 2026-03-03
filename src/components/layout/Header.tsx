"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; 

export default function Header() {
  const [isHovering, setIsHovering] = useState(false); // State for login button hover effect. (Text color changes on hover.)
  const pathname = usePathname(); 

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Alerts", href: "/alerts" },
    { name: "Resources", href: "/resources" },
    { name: "Supports", href: "/supports" },
    { name: "Settings", href: "/settings" },
  ];

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-surface shadow-sm" style={{ padding: "14px 24px" }}>
        {/* Left Side */}
        <div className="flex items-center" style={{ gap: "6px" }}>
          {/* Logo */}
          <div className="flex items-center justify-center rounded-full bg-secondary/20" style={{ height: 36, width: 36 }}>
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 26 }}>spa</span>
          </div>

          {/* Title and Subtitle */}
          <div className="flex flex-col">
            <span className="text-[20px] text-primary" style={{ fontWeight: 800 }}>BorNEO AI</span>
            <span className="text-[10px] text-foreground" style={{ fontWeight: 600 }}>COMMUNITY RESILIENCE</span>
          </div>
        </div>

        {/* Middle Navigation Links */}
        <nav className="flex items-center rounded-full bg-foreground/3" style={{ gap: "4px", padding: "6px 8px" }}>
          {navLinks.map((link) => (
            <Link
              href={link.href}
              className={`no-underline rounded-full transition-colors duration-100 ${
                pathname === link.href
                  ? "bg-primary text-surface"
                  : "text-foreground hover:bg-secondary/20"
              }`}
              style={{ padding: "8px 20px", fontWeight: 500 }}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex" style={{ gap: "18px" }}>
          {/* Search Bar */}
          <div className="flex items-center rounded-full bg-foreground/8 border-0 text-foreground/60" style={{ padding: "6px 12px" }}>
            <span className="material-symbols-outlined">search</span>
            <input placeholder="Find help..." className="rounded-full bg-transparent border-0 placeholder:text-foreground/60 placeholder:text-xs" style={{ padding: "6px 12px", width: "200px" }}></input>
          </div>
          

          {/* Login Button */}
          <button 
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="flex items-center justify-center rounded-full border-2 transition-all duration-300" 
            style={{ 
              padding: "12px 24px", 
              fontWeight: 600,
              borderColor: "#2D6A4F",
              backgroundColor: isHovering ? "#2D6A4F" : "transparent",
              color: isHovering ? "#FFFFFF" : "#2D6A4F"
            }}
          >
            Log in
          </button>
        </div>
    </header>
  );
}