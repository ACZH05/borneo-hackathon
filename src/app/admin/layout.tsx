"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAdminAccess = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/");
          return;
        }

        const response = await fetch(`/api/user/${user.id}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          router.replace("/");
          return;
        }

        const result = await response.json();
        const role = result?.user?.role;

        if (role !== "admin") {
          router.replace("/");
          return;
        }

        if (isMounted) {
          setIsAuthorized(true);
        }
      } catch {
        router.replace("/");
      } finally {
        if (isMounted) {
          setIsCheckingAccess(false);
        }
      }
    };

    checkAdminAccess();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isCheckingAccess) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center p-6 text-sm font-semibold text-textGrey">
        Checking administrator access...
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
