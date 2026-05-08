"use client";

import { Skeleton } from "./ui/skeleton";

export function SkeletonRow() {
  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-12 pb-12">
      <div className="flex items-center space-x-3">
        <Skeleton className="h-8 w-48 bg-white/5" />
      </div>
      <div className="flex items-center space-x-4 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-3 shrink-0">
            <Skeleton className="h-28 w-[200px] md:h-36 md:w-[260px] rounded-md bg-white/5" />
            <Skeleton className="h-4 w-3/4 bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="relative h-[80vh] w-full flex flex-col justify-center px-4 md:px-12">
      <div className="max-w-4xl space-y-8 pt-20">
        <Skeleton className="h-4 w-32 bg-white/5" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-3/4 bg-white/5" />
          <Skeleton className="h-24 w-1/2 bg-white/5" />
        </div>
        <Skeleton className="h-6 w-2/3 bg-white/5" />
        <div className="flex space-x-4 pt-8">
          <Skeleton className="h-14 w-40 rounded-full bg-white/5" />
          <Skeleton className="h-14 w-40 rounded-full bg-white/5" />
        </div>
      </div>
    </div>
  );
}
