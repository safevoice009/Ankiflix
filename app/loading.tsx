import DeckRowSkeleton from "@/components/DeckRowSkeleton";

export default function Loading() {
  return (
    <div className="relative min-h-screen">
      {/* Hero Skeleton */}
      <section className="relative h-[85vh] md:h-[95vh] w-full overflow-hidden bg-[#141414]">
        <div className="relative z-10 flex h-full flex-col justify-end pb-20 px-4 md:justify-center md:pb-0 md:px-12">
          <div className="max-w-3xl space-y-6">
            <div className="h-20 w-3/4 animate-pulse rounded-md bg-white/5 md:h-32" />
            <div className="h-6 w-1/2 animate-pulse rounded-md bg-white/5" />
            <div className="flex space-x-3 pt-4">
              <div className="h-12 w-40 animate-pulse rounded-md bg-white/5" />
              <div className="h-12 w-40 animate-pulse rounded-md bg-white/5" />
            </div>
          </div>
        </div>
      </section>

      {/* Discovery Feed Skeleton */}
      <div className="relative -mt-32 space-y-24 pb-20 md:px-12">
        <DeckRowSkeleton />
        <DeckRowSkeleton />
        <DeckRowSkeleton />
      </div>
    </div>
  );
}
