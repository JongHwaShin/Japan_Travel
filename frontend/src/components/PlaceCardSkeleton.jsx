export default function PlaceCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="w-full h-44 bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded-md w-3/4" />
        <div className="flex items-center justify-between">
          <div className="h-3 bg-gray-200 rounded-md w-12" />
          <div className="h-3 bg-gray-200 rounded-md w-8" />
        </div>
      </div>
    </div>
  )
}
