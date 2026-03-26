/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#fdf8ee",
                    100: "#f9edcf",
                    200: "#f3d99b",
                    300: "#ecc05f",
                    400: "#e6a83a",
                    500: "#d98d1f",
                    600: "#c07018",
                    700: "#9f5218",
                    800: "#82411b",
                    900: "#6b3619",
                    950: "#3d1b09",
                },
                dark: {
                    900: "#0d0d0d",
                    800: "#141414",
                    700: "#1a1a1a",
                    600: "#222222",
                    500: "#2a2a2a",
                    400: "#333333",
                    300: "#444444",
                },
            },
            fontFamily: {
                heading: ["Georgia", "Times New Roman", "serif"],
                body: ["Inter", "system-ui", "sans-serif"],
            },
        },
    },
    plugins: [],
};
