import Skeleton from "@/app/components/Skeleton";

export default function Loading() {
  return (
    <div className="grid h-[calc(100vh-160px)] min-h-0 grid-cols-[1fr_2fr] overflow-hidden">
      <div className="flex min-h-0 flex-col overflow-hidden border-r border-foreground/10">
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4">
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      </div>

      <div className="min-h-0 overflow-hidden">
        <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden p-6">
          <Skeleton className="h-12 w-72" />
          <Skeleton className="mt-6 h-[calc(100vh-280px)] w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
