/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {}, // <-- Aquí está el cambio
  },
};

export default config;