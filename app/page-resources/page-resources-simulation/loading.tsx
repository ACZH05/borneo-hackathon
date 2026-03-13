import Skeleton from "@/app/components/Skeleton";

export default function Loading() {
  return (
    <div className="flex h-full w-full flex-col p-10">
      <Skeleton className="h-12 w-80" />
      <Skeleton className="mt-3 h-6 w-[34rem]" />
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
      </div>
    </div>
  );
}
