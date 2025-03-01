import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#fff',
            a: {
              color: '#6ee7b7',
              '&:hover': {
                color: '#10b981',
              },
            },
            h1: {
              color: '#8b5cf6',
            },
            h2: {
              color: '#6ee7b7',
            },
            h3: {
              color: '#3b82f6',
            },
            code: {
              color: '#ec4899',
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              borderRadius: '0.25rem',
              padding: '0.15rem 0.3rem',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            blockquote: {
              borderLeftColor: '#8b5cf6',
              color: '#94a3b8',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config
