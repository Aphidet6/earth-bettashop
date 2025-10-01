import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      // Default breakpoints
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      
      // Custom breakpoints สำหรับคุณ
      'xs': '480px',      // Extra small
      'tablet': '800px',  // Custom tablet size
      'desktop': '1200px', // Custom desktop
      'wide': '1600px',   // Ultra wide
    },
    extend: {
      // เพิ่ม custom utilities อื่นๆ ได้ที่นี่
    },
  },
  plugins: [],
}

export default config