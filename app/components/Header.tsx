"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { JSX, useEffect, useMemo, useState } from "react";
import { AuthStatus, Logout } from "@/app/api/auth/verification/route";
import AuthWindow from "@/app/components/Auth-Window";
import { useUserContext } from "../provider/UserIdProvider";

type NavSubLink = {
  name: string;
  href: string;
};

type NavLink = {
  name: string;
  href: string;
  icon?: string;
  subLinks?: NavSubLink[];
};

type SearchItem = {
  name: string;
  href: string;
  description: string;
  keywords: string[];
};

// --- Navigation Link List ---
const residentNavLinks: NavLink[] = [
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

const adminNavLinks: NavLink[] = [
  { name: "SOS", href: "/admin/page-sos" },
  { name: "Profile", href: "/admin/page-profile" },
];

const residentSearchItems: SearchItem[] = [
  {
    name: "Home",
    href: "/",
    description: "Open the dashboard and emergency overview.",
    keywords: ["dashboard", "overview", "map", "status"],
  },
  {
    name: "Alerts",
    href: "/page-alerts",
    description: "Check the latest emergency alerts and incidents.",
    keywords: ["warning", "incident", "sos", "emergency"],
  },
  {
    name: "Resources",
    href: "/page-resources",
    description: "Browse preparedness tools and emergency guides.",
    keywords: ["help", "guides", "preparedness", "support"],
  },
  {
    name: "AI Survival Simulator",
    href: "/page-resources/page-resources-simulation",
    description: "Practice emergency decisions with simulation scenarios.",
    keywords: ["training", "quiz", "practice", "hazard", "simulation"],
  },
  {
    name: "Smart Emergency Checklists",
    href: "/page-resources/page-resources-checklist",
    description: "Generate and manage your emergency checklist.",
    keywords: ["list", "supplies", "plan", "preparedness", "checklist"],
  },
  {
    name: "Profile",
    href: "/page-profile",
    description: "Manage your account and rescue card details.",
    keywords: ["account", "rescue card", "medical", "contacts"],
  },
];

const adminSearchItems: SearchItem[] = [
  {
    name: "SOS Dashboard",
    href: "/admin/page-sos",
    description: "Monitor and respond to SOS requests.",
    keywords: ["rescue", "emergency", "requests", "dashboard"],
  },
  {
    name: "Admin Profile",
    href: "/admin/page-profile",
    description: "Manage administrator profile details.",
    keywords: ["account", "profile", "settings"],
  },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [isAuthWindowOpen, setIsAuthWindowOpen] = useState(false); // State to control the visibility of the login window.
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
  const [searchItems, setSearchItems] =
    useState<SearchItem[]>(residentSearchItems);
  const { isLoggedIn, isLoading } = AuthStatus(); // Store the login state of the user.

  const { userId } = useUserContext();

  useEffect(() => {
    const setNavBar = async () => {
      if (!isLoading && !isLoggedIn) {
        setNavLinks(residentNavLinks);
        setSearchItems(residentSearchItems);
        if (pathname.startsWith("/admin")) {
          router.replace("/");
        }
        return;
      }

      if (!userId) {
        setNavLinks(residentNavLinks);
        setSearchItems(residentSearchItems);
        return;
      }

      const response = await fetch(`/api/user/${userId}`, {
        method: "GET",
      });

      const result = await response.json();
      const role = result?.user?.role;

      setNavLinks(role === "admin" ? adminNavLinks : residentNavLinks);
      setSearchItems(role === "admin" ? adminSearchItems : residentSearchItems);

      if (role === "admin" && !pathname.startsWith("/admin")) {
        router.replace("/admin/page-sos");
        return;
      }

      if (role !== "admin" && pathname.startsWith("/admin")) {
        router.replace("/");
      }
    };

    setNavBar();
  }, [isLoading, isLoggedIn, pathname, router, userId]);

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
        <SearchBar
          items={searchItems}
          pathname={pathname}
          onNavigate={(href) => router.push(href)}
          className="hidden xl:block"
        />
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

function Drawer({ navLinks }: { navLinks: NavLink[] }): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchItems = useMemo(
    () =>
      pathname.startsWith("/admin") ? adminSearchItems : residentSearchItems,
    [pathname],
  );

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
        <div className="mx-2 my-4">
          <SearchBar
            items={searchItems}
            pathname={pathname}
            onNavigate={(href) => {
              setIsOpen(false);
              router.push(href);
            }}
            resultsAlign="left"
          />
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

function SearchBar({
  items,
  pathname,
  onNavigate,
  className = "",
  resultsAlign = "right",
}: {
  items: SearchItem[];
  pathname: string;
  onNavigate: (href: string) => void;
  className?: string;
  resultsAlign?: "left" | "right";
}): JSX.Element {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = useMemo(() => {
    const searchableItems = items.filter((item) => item.href !== pathname);

    if (!normalizedQuery) {
      return searchableItems.slice(0, 5);
    }

    return searchableItems
      .map((item) => {
        const haystack = [
          item.name,
          item.description,
          item.href,
          ...item.keywords,
        ]
          .join(" ")
          .toLowerCase();

        const score = [
          item.name.toLowerCase().startsWith(normalizedQuery) ? 4 : 0,
          item.keywords.some((keyword) =>
            keyword.toLowerCase().startsWith(normalizedQuery),
          )
            ? 3
            : 0,
          haystack.includes(normalizedQuery) ? 1 : 0,
        ].reduce((total, value) => total + value, 0);

        return { item, score };
      })
      .filter(({ score }) => score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 5)
      .map(({ item }) => item);
  }, [items, normalizedQuery, pathname]);

  const submitSearch = () => {
    if (filteredItems.length === 0) return;

    onNavigate(filteredItems[0].href);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`.trim()}>
      <div className="flex items-center rounded-full bg-foreground/8 border-none px-3 py-1">
        <span className="material-symbols-outlined text-textGrey/60 text-xs">
          search
        </span>
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setIsOpen(false), 120);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submitSearch();
            }

            if (event.key === "Escape") {
              setIsOpen(false);
            }
          }}
          placeholder="Find help..."
          className="w-full min-w-40 rounded-full bg-transparent border-none outline-none placeholder:text-textGrey/60 placeholder:text-xs px-2 text-sm"
        />
      </div>

      {isOpen && filteredItems.length > 0 && (
        <div
          className={`absolute top-full z-50 mt-2 w-full max-w-full overflow-hidden rounded-2xl border border-foreground/10 bg-surface shadow-xl sm:min-w-72 ${
            resultsAlign === "left" ? "left-0" : "right-0"
          }`}
        >
          {filteredItems.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => {
                onNavigate(item.href);
                setQuery("");
                setIsOpen(false);
              }}
              className="flex w-full flex-col items-start gap-1 px-4 py-3 text-left transition-colors hover:bg-secondary/15"
            >
              <span className="text-sm font-bold text-foreground">
                {item.name}
              </span>
              <span className="text-xs text-textGrey">{item.description}</span>
            </button>
          ))}
        </div>
      )}

      {isOpen && normalizedQuery && filteredItems.length === 0 && (
        <div
          className={`absolute top-full z-50 mt-2 w-full max-w-full rounded-2xl border border-foreground/10 bg-surface px-4 py-3 text-xs text-textGrey shadow-xl sm:min-w-72 ${
            resultsAlign === "left" ? "left-0" : "right-0"
          }`}
        >
          No matching help page found.
        </div>
      )}
    </div>
  );
}
