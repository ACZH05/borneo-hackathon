import Skeleton from "@/app/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto mb-20 flex max-w-6xl flex-col gap-10 p-6 md:p-10">
      <div className="rounded-3xl border border-foreground/5 bg-surface p-8 shadow-sm">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="mt-3 h-6 w-96" />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex shrink-0 flex-col gap-6 lg:w-80">
          <div className="rounded-3xl border border-foreground/10 bg-surface p-8 shadow-sm">
            <div className="flex flex-col items-center gap-6">
              <Skeleton className="h-28 w-28 rounded-full" />
              <Skeleton className="h-8 w-44" />
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
          </div>
          <Skeleton className="h-72 w-full rounded-3xl border border-foreground/10" />
        </div>

        <div className="flex-1 space-y-6">
          <Skeleton className="h-72 w-full rounded-3xl border border-foreground/10" />
          <Skeleton className="h-96 w-full rounded-3xl border border-foreground/10" />
        </div>
      </div>
    </div>
  );
}
