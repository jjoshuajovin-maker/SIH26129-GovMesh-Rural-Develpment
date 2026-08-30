/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          blue: '#003366',
          navy: '#0f172a',
          saffron: '#FF9933',
          green: '#138808',
          accent: '#1e40af',
          lightBg: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0',
        }
      }
    },
  },
  plugins: [],
}
