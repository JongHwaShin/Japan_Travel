import { Link } from 'react-router-dom'

const PRICE_LABELS = {
  LOW: '¥',
  MEDIUM: '¥¥',
  HIGH: '¥¥¥',
}

const CATEGORY_COLORS = {
  맛집:   'bg-orange-100 text-orange-600',
  카페:   'bg-yellow-100 text-yellow-600',
  관광지: 'bg-blue-100 text-blue-600',
  쇼핑:   'bg-pink-100 text-pink-600',
}

/**
 * API PlaceResponse 필드를 그대로 받는다.
 * @param {{
 *   placeId: number,
 *   nameKo: string,
 *   category: '맛집'|'관광지'|'카페'|'쇼핑',
 *   images: Array<{imageUrl: string, isMain: boolean}>,
 *   rating: number,
 *   priceRange: 'LOW'|'MEDIUM'|'HIGH'
 * }} props
 */
export default function PlaceCard({ placeId, nameKo, category, images, rating, priceRange }) {
  const imageUrl = images?.find((i) => i.isMain)?.imageUrl ?? images?.[0]?.imageUrl
  const categoryColor = CATEGORY_COLORS[category] ?? 'bg-gray-100 text-gray-600'
  const priceLabel = PRICE_LABELS[priceRange] ?? ''

  return (
    <Link
      to={`/places/${placeId}`}
      className="group block bg-card rounded-2xl overflow-hidden shadow-sm
                 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
    >
      <div className="relative w-full h-44 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={nameKo}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-4xl">🗾</div>
        )}
        <span className={`absolute top-2.5 left-2.5 text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColor}`}>
          {category}
        </span>
      </div>

      <div className="p-3">
        <h3 className="font-bold text-text-main text-sm truncate">{nameKo}</h3>
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-1 text-xs">
            <span>⭐</span>
            <span className="font-medium text-text-main">{rating != null ? Number(rating).toFixed(1) : '-'}</span>
          </div>
          {priceLabel && (
            <span className="text-xs font-medium text-text-sub">{priceLabel}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
