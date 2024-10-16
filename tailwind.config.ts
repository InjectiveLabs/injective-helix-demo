import type { Config } from 'tailwindcss'
// import defaultTheme from 'tailwindcss/defaultTheme'
import { colors } from './nuxt-config/tailwind'

export default <Partial<Config>>{
  content: [
    './components/**/*.{vue,js,ts,jsx,tsx}',
    './layouts/**/*.{vue,js,ts,jsx,tsx}',
    './pages/**/*.{vue,js,ts,jsx,tsx}',
    './composables/**/*.{js,ts,vue}',
    './store/**/*.{js,ts,vue}',
    './utils/**/*.{js,ts,vue}',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        ...colors
      },

      divideColor: {
        DEFAULT: '#202431'
      },

      border: {
        DEFAULT: '#202431'
      },

      height: {
        footer: '2.5rem',
        orders: '10rem',
        trades: '26rem',
        header: '56px'
      }
    }
  }
}
