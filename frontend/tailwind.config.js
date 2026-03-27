/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    // 브레이크포인트: 모바일 ~768 / 태블릿 768~1024 / PC 1024~
    screens: {
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      colors: {
        primary: '#FF6B35',
        secondary: '#2D9CDB',
        background: '#F8F9FA',
        'text-main': '#1A1A1A',
        'text-sub': '#888888',
        card: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Noto Sans KR', 'sans-serif'],
      },
      maxWidth: {
        'app': '430px',
        'desktop': '1200px',
      },
      // iOS safe-area를 Tailwind spacing으로 사용하기 위한 값
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
    },
  },
  plugins: [],
}
