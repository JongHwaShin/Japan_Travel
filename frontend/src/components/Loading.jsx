/**
 * @param {{ fullScreen?: boolean, size?: 'sm' | 'md' | 'lg' }} props
 */
export default function Loading({ fullScreen = false, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  }

  const spinner = (
    <div
      className={`${sizeClasses[size]} rounded-full border-gray-200 border-t-primary animate-spin`}
    />
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-sm">
        {spinner}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-10">
      {spinner}
    </div>
  )
}
