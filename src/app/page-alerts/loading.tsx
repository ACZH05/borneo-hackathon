import Skeleton from "@/app/components/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-10 p-10">
      <div className="flex flex-wrap items-start justify-between gap-10">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-14 w-72" />
          <Skeleton className="h-6 w-120" />
        </div>
        <Skeleton className="h-12 w-56 rounded-full" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>

      <div className="flex flex-col gap-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    </div>
  );
}
