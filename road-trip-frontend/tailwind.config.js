/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'primary-1': '#47B5FF',
                'primary-2': '#0AA1DD',
                'primary-3': '#FF7000',
                'secondary-1': '#CFD2CF',
                'secondary-2': '#EEEEEE',
                'secondary-3': '#F7F5F2',
                'secondary-4': '#181818',
                'secondary-5': '#F6F6F6'
            },
            backgroundImage: {
                'landing-img': "url('../public/images/landing-img.jpg')",
                'img-1': "url('../public/background.svg')"
            },
            margin: {
                '25prc': '25%',
                '33prc': '33%',
                '50prc': '50%'
            }
        }
    },
    plugins: [],
}