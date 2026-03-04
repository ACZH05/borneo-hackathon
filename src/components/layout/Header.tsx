"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; 
import { JSX, useState } from "react";

// --- Navigation Link List ---
const navLinks = [
  { name: "Home", href: "/" },
  { name: "Alerts", href: "/alerts" },
  { name: "Resources", href: "/resources" },
  { name: "Supports", href: "/supports" },
  { name: "Settings", href: "/settings" },
];

export default function Header() {
  const pathname = usePathname(); 

  return (
    <header className="sticky top-0 z-50 flex flex-wrap gap-4 items-center justify-between bg-surface shadow-sm min-w-screen px-4 py-4">
      {/* --- Left Side --- */}
      <div className="flex items-center justify-center gap-3">
        {/* --- Drawer for Mobile --- */}
        <Drawer />

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

      {/* --- Middle Navigation Links --- */} {/* Show only on desktop. */}
      <nav className="hidden xl:flex items-center gap-1 rounded-full bg-foreground/3 px-1 py-1">
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

      <div className="flex gap-4 ml-auto">
        {/* --- Search Bar --- */} {/* Show only on desktop. */}
        <div className="hidden xl:flex items-center rounded-full bg-foreground/8 border-none px-3 py-1"> 
          <span className="material-symbols-outlined text-textGrey/60 text-xs">search</span> {/* Search Icon from Google Material Symbols */}
          <input placeholder="Find help..." className="rounded-full bg-transparent border-none outline-none placeholder:text-textGrey/60 placeholder:text-xs px-2"></input>
        </div>
        
        {/* --- Login Button --- */}
        <button className="flex items-center justify-center rounded-full border-primary border-2 text-primary font-bold px-5 py-1 transition-all duration-300 hover:bg-primary hover:text-white">Log in</button>
      </div>
    </header>
  );
}

function Drawer() : JSX.Element {
  const [isOpen, setIsOpen] = useState(false); 
  const pathname = usePathname(); 

  return (
    <>
      {/* --- Drawer Button --- */} {/* Show only on mobile. */}
      <button onClick={() => setIsOpen(true)} className="xl:hidden flex items-center justify-center"> 
        <span className="material-symbols-outlined text-3xl">menu</span>
      </button>

      {/* --- Drawer Overlay --- */}
      <div 
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ease-out ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)} // Close drawer when clicking on the overlay.
      />

      {/* --- Drawer Panel --- */}
      <aside 
        className={`fixed top-0 left-0 z-50 flex flex-col bg-surface shadow-2xl h-full w-54 transition-transform duration-500 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* --- Search Bar --- */}
        <div className="flex items-center rounded-full bg-foreground/8 border-none px-3 py-1 mx-2 my-4">
          <span className="material-symbols-outlined text-textGrey/60 text-xs">search</span> {/* Search Icon from Google Material Symbols */}
          <input placeholder="Find help..." className="rounded-full bg-transparent border-none outline-none placeholder:text-textGrey/60 placeholder:text-xs px-2"></input>
        </div>

        {/* --- Menu Links --- */}
        <nav className="flex flex-col">
          {navLinks.map((link) => (
            <Link
              href={link.href}
              className={`text-sm font-bold px-4 py-3 ${
                pathname === link.href 
                  ? "bg-primary text-surface" 
                  : "text-textGrey hover:bg-secondary/20"
              }`}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}