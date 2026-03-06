import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/auth";

export default async function AdminPage() {
  const result = await getCurrentUserProfile();

  if (!result?.authUser) {
    redirect("/page-auth");
  }

  if (result.profile?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex flex-col gap-10 p-10">
      <div className="flex flex-col gap-4">
        <h1 className="text-6xl font-bold">
          <span>Admin </span>
          <span className="text-primary">Console</span>
        </h1>
        <p className="text-xl text-textGrey">
          Review disaster reports and manage privileged actions.
        </p>
      </div>

      <div className="rounded-3xl bg-surface shadow-sm p-8">
        <p className="text-textGrey">
          Welcome, {result.profile?.name ?? result.authUser.email}.
        </p>
      </div>
    </div>
  );
}