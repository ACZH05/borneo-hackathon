import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
  });

  return {
    authUser: user,
    profile,
  };
}

export async function requireAuth() {
  const result = await getCurrentUserProfile();

  if (!result?.authUser) {
    throw new Error("Unauthorized");
  }

  return result;
}

export async function requireAdmin() {
  const result = await requireAuth();

  if (result.profile?.role !== "admin") {
    throw new Error("Forbidden");
  }

  return result;
}