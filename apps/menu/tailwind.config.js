/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: 'var(--void)',
        ink: 'var(--ink)',
        graphite: 'var(--graphite)',
        steel: 'var(--steel)',
        elevated: 'var(--elevated)',
        line: 'var(--line)',
        ash: 'var(--ash)',
        text2: 'var(--text-2)',
        offWhite: 'var(--off-white)',
        silverAccent: 'var(--silver-accent)',
        silverDim: 'var(--silver-dim)',
        silverDeep: 'var(--silver-deep)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      // Motion primitives live in globals.css so keyframes stay next to the
      // layered background FX that use them (aurora, waves, sheen, spotlight).
    },
  },
  plugins: [],
};
