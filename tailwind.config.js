@type {import('tailwindcss').Config} 

module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'primary': '#6366f1', // Example primary color (indigo/purple based on guidelines)
                'secondary': '#4f46e5', // Another related shade
                'background': '#1f2937', // Dark background theme
                'surface': '#374151', // Slightly lighter surface
                },
            },
        },
        plugins: [],
    };