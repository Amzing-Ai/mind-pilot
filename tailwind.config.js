/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}", // ✅ 修正这里
    ],
    plugins: [require("tailwindcss-animate")],
};