/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          blue:   '#3B82F6',
          violet: '#7C3AED',
          pink:   '#EC4899',
          cyan:   '#06B6D4',
        },
        surface: {
          bg:       '#05060F',
          card:     '#0D0F1E',
          elevated: '#131629',
          border:   'rgba(255,255,255,0.07)',
        },
      },
      boxShadow: {
        card:      '0 4px 24px rgba(0,0,0,0.5)',
        cardHover: '0 8px 40px rgba(59,130,246,0.2)',
        neon:      '0 0 24px rgba(59,130,246,0.35)',
        neonViolet:'0 0 24px rgba(124,58,237,0.4)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #3B82F6, #7C3AED, #EC4899)',
        'subtle-radial':  'radial-gradient(ellipse at 60% 0%, rgba(59,130,246,0.12) 0%, transparent 60%), radial-gradient(ellipse at 0% 80%, rgba(124,58,237,0.10) 0%, transparent 60%)',
      },
      animation: {
        'float':       'float 6s ease-in-out infinite',
        'fade-up':     'fadeUp 0.6s ease-out both',
        'shimmer':     'shimmer 2s linear infinite',
        'pulse-slow':  'pulse 4s ease-in-out infinite',
        'spin-slow':   'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-14px)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
