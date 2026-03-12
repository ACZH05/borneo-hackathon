import Skeleton from "@/app/components/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8 p-10">
      <div className="flex flex-col gap-6">
        <Skeleton className="h-14 w-80" />
        <Skeleton className="h-6 w-full max-w-4xl" />
        <Skeleton className="h-6 w-5/6 max-w-3xl" />
      </div>

      <div className="grid w-full grid-cols-1 items-stretch gap-6 lg:grid-cols-2 lg:gap-10">
        <Skeleton className="h-96 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    </div>
  );
}
