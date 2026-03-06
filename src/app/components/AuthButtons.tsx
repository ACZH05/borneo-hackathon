"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AuthButtons() {
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  }

  if (!email) {
    return (
      <Link
        href="/auth"
        className="flex items-center justify-center rounded-full border-primary border-2 text-primary font-bold px-5 py-1 transition-all duration-300 hover:bg-primary hover:text-white"
      >
        Log in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden xl:block text-sm text-textGrey">{email}</span>
      <button
        onClick={handleLogout}
        className="flex items-center justify-center rounded-full border-primary border-2 text-primary font-bold px-5 py-1 transition-all duration-300 hover:bg-primary hover:text-white"
      >
        Log out
      </button>
    </div>
  );
}