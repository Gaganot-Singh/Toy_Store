/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
    daisyui: {
      themes: ['night'],
  },
  plugins: [],
  purge: ['./**/*.ejs'],
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui'),
  ],
}

