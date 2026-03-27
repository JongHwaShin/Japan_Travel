export default function LogCardSkeleton() {
  return (
    <div className="flex gap-3 bg-card rounded-2xl shadow-sm p-3.5 animate-pulse">
      <div className="flex-shrink-0 w-[88px] h-[88px] rounded-xl bg-gray-200" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 bg-gray-200 rounded-md w-full" />
        <div className="h-4 bg-gray-200 rounded-md w-4/5" />
        <div className="h-3 bg-gray-200 rounded-md w-1/3 mt-2" />
        <div className="flex justify-between mt-1">
          <div className="h-3 bg-gray-200 rounded-md w-24" />
          <div className="h-3 bg-gray-200 rounded-md w-10" />
        </div>
      </div>
    </div>
  )
}
