const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-orange-500 active:bg-orange-600',
  secondary: 'bg-secondary text-white hover:bg-blue-500 active:bg-blue-600',
  outline: 'bg-transparent border border-primary text-primary hover:bg-orange-50 active:bg-orange-100',
}

// 모든 size가 터치 최소 44px(min-h) 충족
const SIZES = {
  sm: 'min-h-[44px] h-9 px-4 text-sm',
  md: 'min-h-[44px] h-11 px-6 text-sm',
  lg: 'min-h-[44px] h-[52px] px-8 text-base',
}

/**
 * @param {{
 *   variant?: 'primary' | 'secondary' | 'outline',
 *   size?: 'sm' | 'md' | 'lg',
 *   fullWidth?: boolean,
 *   disabled?: boolean,
 *   onClick?: () => void,
 *   type?: 'button' | 'submit' | 'reset',
 *   children: React.ReactNode
 * }} props
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  children,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center rounded-xl font-semibold transition-colors',
        VARIANTS[variant],
        SIZES[size],
        fullWidth ? 'w-full' : '',
        disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </button>
  )
}
