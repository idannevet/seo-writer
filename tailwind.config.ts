import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: '#FAFFE0',
          100: '#F5FFC2',
          200: '#EBFF85',
          300: '#DFFF47',
          400: '#C8FF00',
          500: '#B0E000',
          600: '#8AB300',
          700: '#668500',
          800: '#445800',
          900: '#222C00',
        },
      },
    },
  },
  plugins: [],
};
export default config;
