import { useRef } from 'react'

/**
 * 터치 스와이프 감지 훅
 *
 * @param {{
 *   onSwipeLeft?: () => void,
 *   onSwipeRight?: () => void,
 *   onSwipeUp?: () => void,
 *   onSwipeDown?: () => void,
 *   threshold?: number
 * }} options
 *
 * @example
 * const swipe = useSwipe({ onSwipeLeft: () => goNext(), onSwipeRight: () => goPrev() })
 * <div {...swipe}>...</div>
 */
export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
} = {}) {
  const start = useRef({ x: 0, y: 0 })

  const onTouchStart = (e) => {
    start.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }

  const onTouchEnd = (e) => {
    const dx = start.current.x - e.changedTouches[0].clientX
    const dy = start.current.y - e.changedTouches[0].clientY

    // 수평/수직 중 더 큰 방향만 처리
    if (Math.abs(dx) >= Math.abs(dy)) {
      if (Math.abs(dx) >= threshold) {
        if (dx > 0) onSwipeLeft?.()
        else onSwipeRight?.()
      }
    } else {
      if (Math.abs(dy) >= threshold) {
        if (dy > 0) onSwipeUp?.()
        else onSwipeDown?.()
      }
    }
  }

  return { onTouchStart, onTouchEnd }
}
