import { AspectRatio } from "./ui/aspect-ratio"

export default function DeckRowSkeleton() {
  return (
    <div className="space-y-2 md:space-y-4 py-4">
      <div className="h-6 w-48 animate-pulse rounded-md bg-white/10 px-4 md:px-12" />
      
      <div className="relative group px-4 md:px-12">
        <div className="flex space-x-2 overflow-hidden py-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="min-w-[160px] flex-1 md:min-w-[280px]">
              <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-md bg-white/5 animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
              </AspectRatio>
              <div className="mt-2 space-y-2">
                <div className="h-3 w-3/4 animate-pulse rounded bg-white/10" />
                <div className="h-2 w-1/2 animate-pulse rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
