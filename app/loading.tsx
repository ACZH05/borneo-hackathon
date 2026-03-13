import Skeleton from "@/app/components/Skeleton";

export default function Loading() {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 p-4 sm:p-6 lg:grid-cols-4 lg:p-8">
      <div className="col-span-1 flex min-w-0 flex-col gap-8 lg:col-span-2">
        <div className="space-y-3">
          <Skeleton className="h-12 w-72 sm:h-14 sm:w-96" />
          <Skeleton className="h-12 w-64 sm:h-14 sm:w-80" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="rounded-2xl border border-foreground/10 bg-white p-4 sm:p-6">
          <Skeleton className="mb-4 h-6 w-44" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>

      <div className="col-span-1 min-h-80 lg:col-span-2">
        <Skeleton className="h-full min-h-80 w-full rounded-2xl" />
      </div>

      <div className="col-span-1 min-w-0 lg:col-span-3">
        <div className="rounded-2xl border border-foreground/10 bg-white p-4 sm:p-6">
          <Skeleton className="mb-4 h-6 w-52" />
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>

      <div className="col-span-1 flex min-w-0 flex-col gap-4 lg:col-span-1">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-36 w-full rounded-2xl" />
      </div>
    </div>
  );
}
