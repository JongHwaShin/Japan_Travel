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
  숙박:   'bg-purple-100 text-purple-600',
}

// 카테고리별 기본 이미지 (place_images 없을 때 사용)
const CATEGORY_FALLBACK_IMAGES = {
  맛집:   'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&q=80&fit=crop',
  관광지: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80&fit=crop',
  카페:   'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80&fit=crop',
  쇼핑:   'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80&fit=crop',
  숙박:   'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80&fit=crop',
}

/**
 * API PlaceResponse 필드를 그대로 받는다.
 * images 없으면 카테고리별 기본 이미지 표시
 */
export default function PlaceCard({ placeId, nameKo, category, images, rating, priceRange }) {
  const imageUrl =
    images?.find((i) => i.isMain)?.imageUrl ??
    images?.[0]?.imageUrl ??
    CATEGORY_FALLBACK_IMAGES[category]

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
