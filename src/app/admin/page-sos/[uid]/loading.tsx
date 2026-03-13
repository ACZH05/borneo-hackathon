import Skeleton from "@/app/components/Skeleton";

export default function Loading() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-end justify-between border-b-2 border-textGrey/10 p-6 pb-4">
        <Skeleton className="h-9 w-56" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-44 rounded-xl" />
          <Skeleton className="h-10 w-56 rounded-xl" />
        </div>
      </div>

      <div className="flex h-full min-h-0 flex-col gap-4 p-6">
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-4">
          <Skeleton className="h-full min-h-64 w-full rounded-xl" />
          <div className="flex min-h-0 flex-col gap-4">
            <Skeleton className="h-full min-h-64 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    </div>
  );
}
