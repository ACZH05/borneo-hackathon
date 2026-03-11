"use client";

import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { JSX, useEffect, useState } from "react";
import { AuthStatus, Logout } from "@/app/api/auth/verification/route";
import AuthWindow from "@/app/components/Auth-Window";
import { supabase } from "../../../lib/supabase";

// --- Navigation Link List ---
const residentNavLinks = [
  { name: "Home", href: "/", icon: "home" },
  { name: "Alerts", href: "/page-alerts", icon: "notifications" },
  {
    name: "Resources",
    href: "/page-resources",
    icon: "folder",
    subLinks: [
      { name: "Simulation", href: "/page-resources/page-resources-simulation" },
      { name: "Checklist", href: "/page-resources/page-resources-checklist" },
    ],
  },
  { name: "Profile", href: "/page-profile", icon: "person" },
];

const adminNavLinks = [
  { name: "SOS", href: "/admin/sos" },
  { name: "Alert", href: "/admin/alert" },
  { name: "Profile", href: "/admin/profile" },
];

export default function Header() {
  const pathname = usePathname();

  const [isAuthWindowOpen, setIsAuthWindowOpen] = useState(false); // State to control the visibility of the login window.
  const [navLinks, setNavLinks] = useState<{ name: string; href: string }[]>(
    [],
  );
  const { isLoggedIn, isLoading } = AuthStatus(); // Store the login state of the user.

  useEffect(() => {
    const setNavBar = async () => {
      const token = localStorage.getItem("supabase.auth.token");
      const { data } = await supabase.auth.getUser(token!);
      const userId = data.user?.id;

      const response = await fetch(`/api/user/${userId}`, {
        method: "GET",
      });

      const result = await response.json();
      const role = result?.user?.role;

      setNavLinks(
        (await role) == "resident" ? residentNavLinks : adminNavLinks,
      );

      if (role == "admin" && !pathname.startsWith("/admin"))
        redirect("/admin/sos");
    };

    setNavBar();
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 flex flex-wrap gap-4 items-center justify-between bg-surface shadow-sm w-full px-8 py-4">
      {/* --- Left Side --- */}
      <div className="flex items-center justify-center gap-3">
        {/* --- Drawer for Mobile --- */} {/* Show only on mobile. */}
        <Drawer navLinks={navLinks} />
        {/* --- Logo --- */}
        <div className="flex items-center justify-center rounded-full bg-secondary/20 h-10 w-10">
          <span className="material-symbols-outlined text-2xl text-primary">
            spa
          </span>{" "}
          {/* Logo Icon from Google Material Symbols */}
        </div>
        {/* --- Title and Subtitle --- */}
        <div className="flex flex-col">
          <span className="text-xl font-extrabold text-primary">BorNEO AI</span>
          <span className="text-xs font-semibold text-textGrey">
            COMMUNITY RESILIENCE
          </span>
        </div>
      </div>
      {/* --- Middle Navigation Links --- */} {/* Show only on desktop. */}
      <nav className="hidden xl:flex items-center gap-1 rounded-full bg-foreground/3 px-1 py-1 ml-auto">
        {navLinks.map((link) => (
          <div key={link.name} className="relative group">
            {/* --- Main Link --- */}
            <Link
              href={link.href}
              className={`inline-block rounded-full px-5 py-2 no-underline text-sm font-semibold transition-all ease-in-out duration-300 ${
                pathname === link.href ||
                (link.subLinks && pathname.startsWith(link.href))
                  ? "bg-primary text-surface"
                  : "text-textGrey hover:bg-secondary/20"
              }`}
            >
              {link.name}
            </Link>

            {/* --- Sub Links (For Resources) --- */}
            {link.subLinks && (
              <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="flex flex-col bg-surface shadow-lg rounded-xl overflow-hidden border border-gray-100 p-1">
                  {link.subLinks.map((subLink) => (
                    <Link
                      key={subLink.name}
                      href={subLink.href}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                        pathname === subLink.href
                          ? "text-primary bg-primary/10"
                          : "text-textGrey hover:bg-secondary/20 hover:text-primary"
                      }`}
                    >
                      {subLink.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>
      {/* --- Right Side --- */}{" "}
      {/* Always show on all screen sizes although wrapped. */}
      <div className="flex gap-4 ml-auto">
        {/* --- Search Bar --- */} {/* Show only on desktop. */}
        <div className="hidden xl:flex items-center rounded-full bg-foreground/8 border-none px-3 py-1">
          <span className="material-symbols-outlined text-textGrey/60 text-xs">
            search
          </span>{" "}
          {/* Search Icon from Google Material Symbols */}
          <input
            placeholder="Find help..."
            className="rounded-full bg-transparent border-none outline-none placeholder:text-textGrey/60 placeholder:text-xs px-2"
          ></input>
        </div>
        {/* --- Login / Logout Button --- */}
        {isLoading ? (
          // --- Skeleton Loader ---
          // Avoid showing the login button until we know if the user is logged in or not to prevent confusion.
          // Show a skeleton loader instead to indicate that we're checking the login status.
          <div className="w-22 h-9 rounded-full bg-foreground/10 animate-pulse"></div>
        ) : isLoggedIn ? (
          // --- Logout Button (If Already Login) ---
          <button
            onClick={Logout}
            title="Log out"
            className="flex items-center justify-center rounded-full border-red-400 border-2 text-red-500 px-4 py-1 transition-all duration-300 hover:bg-red-500 hover:text-white"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        ) : (
          // --- Login Button (If Not Login) ---
          <button
            onClick={() => setIsAuthWindowOpen(true)}
            className="flex items-center justify-center rounded-full border-primary border-2 text-primary font-bold px-5 py-1 transition-all duration-300 hover:bg-primary hover:text-white"
          >
            Log in
          </button>
        )}
      </div>
      <AuthWindow
        isOpen={isAuthWindowOpen}
        onClose={() => setIsAuthWindowOpen(false)}
      />
    </header>
  );
}

function Drawer({
  navLinks,
}: {
  navLinks: { name: string; href: string }[];
}): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* --- Drawer Button --- */} {/* Show only on mobile. */}
      <button
        onClick={() => setIsOpen(true)}
        className="xl:hidden flex items-center justify-center"
      >
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
          <span className="material-symbols-outlined text-textGrey/60 text-xs">
            search
          </span>{" "}
          {/* Search Icon from Google Material Symbols */}
          <input
            placeholder="Find help..."
            className="rounded-full bg-transparent border-none outline-none placeholder:text-textGrey/60 placeholder:text-xs px-2"
          ></input>
        </div>

        {/* --- Menu Links --- */}
        <nav className="flex flex-col">
          {navLinks.map((link) => (
            <div key={link.name} className="flex flex-col">
              {/* --- Main Link --- */}
              <Link
                href={link.href}
                className={`text-sm font-bold px-4 py-3 ${
                  pathname === link.href ||
                  (link.subLinks && pathname.startsWith(link.href))
                    ? "bg-primary text-surface"
                    : "text-textGrey hover:bg-secondary/20"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center">
                  {
                    <span
                      className="material-symbols-outlined mr-2"
                      style={{ fontSize: "1.25rem" }}
                    >
                      {link.icon}
                    </span>
                  }
                  {link.name}
                </div>
              </Link>

              {/* --- Sub Links (For Resources) --- */}
              {link.subLinks && (
                <div className="flex flex-col bg-foreground/3">
                  {link.subLinks.map((subLink) => (
                    <Link
                      key={subLink.name}
                      href={subLink.href}
                      className={`text-sm font-semibold pl-10 pr-4 py-2 ${
                        pathname === subLink.href
                          ? "text-primary"
                          : "text-textGrey hover:bg-secondary/20"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {"> " + subLink.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
