/**
 * 반응형 카드 그리드 래퍼
 * - 모바일: 1열
 * - 태블릿(md): 2열
 * - PC(lg): variant에 따라 3열 or 4열
 *
 * @param {{
 *   children: React.ReactNode,
 *   variant?: 'place' | 'log',
 *   gap?: string
 * }} props
 *
 * @example
 * <CardGrid variant="place">
 *   {places.map(p => <PlaceCard key={p.id} {...p} />)}
 * </CardGrid>
 */
export default function CardGrid({ children, variant = 'place', gap = 'gap-4' }) {
  const colClass =
    variant === 'place'
      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'

  return (
    <div className={`grid ${colClass} ${gap}`}>
      {children}
    </div>
  )
}
