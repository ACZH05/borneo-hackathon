import Skeleton from "@/app/components/Skeleton";

export default function Loading() {
  return (
    <div className="relative flex h-[calc(100vh-160px)] flex-row overflow-hidden">
      <div className="hidden h-full w-80 shrink-0 border-r border-foreground/10 bg-white p-4 md:flex md:flex-col md:gap-4">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="space-y-3 pt-2">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>

      <div className="flex h-full flex-1 flex-col gap-4 p-4 sm:p-6">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-5 w-80" />
        <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-full min-h-64 w-full rounded-2xl" />
          <Skeleton className="h-full min-h-64 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
