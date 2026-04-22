import Skeleton from "@/app/components/Skeleton";

export default function AlertsLoadingState() {
  return (
    <div className="flex flex-col gap-10 p-10">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-16 w-72" />
          <Skeleton className="h-6 w-96 max-w-full" />
        </div>
        <Skeleton className="h-14 w-52 rounded-[1.75rem]" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-[1.75rem]" />
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`alert-skeleton-${index}`}
            className="rounded-[1.75rem] border border-foreground/10 bg-white p-6 shadow-sm"
          >
            <Skeleton className="h-5 w-56" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
            <Skeleton className="mt-6 h-10 w-40 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
