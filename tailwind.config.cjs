/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.06), 0 20px 80px rgba(2,8,23,0.65)',
      },
      backgroundImage: {
        'hero-grid':
          'radial-gradient(circle at 20% 20%, rgba(56,189,248,0.12), transparent 30%), radial-gradient(circle at 80% 0%, rgba(129,140,248,0.14), transparent 28%), radial-gradient(circle at 50% 80%, rgba(45,212,191,0.10), transparent 30%)',
      },
    },
  },
  plugins: [],
};
