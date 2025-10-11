// tailwind.config.js
module.exports = {
    content: [
      './src/**/*.{js,jsx,ts,tsx}',
      './src/styles/**/*.css',
      './public/**/*.html',
    ],
    theme: {
      extend: {
        colors: {
          primary: '#2563eb',
          secondary: '#64748b',
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
        },
      },
    },
    plugins: [],
  };