/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./public/**/*.html",
    "./public/**/*.js",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#42c3be',
        'primary-focus': '#38a8a4',
        'primary-content': '#ffffff',
        'secondary': '#f426b9',
        'secondary-focus': '#d61f9f',
        'accent': '#a1d42a',
        'warning': '#f3cf2a',
        'neutral': '#1F2937',
        'base-100': '#faf8fa',
        'base-200': '#F3F4F6',
        'base-300': '#E5E7EB',
        'info': '#3B82F6',
        'success': '#16A34A',
        'error': '#DC2626',
      },
    },
  },
  plugins: [],
}
