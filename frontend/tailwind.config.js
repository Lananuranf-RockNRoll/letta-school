export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#A21CAF",
                    light: "#C026D3",
                    dark: "#7E22CE",
                }
            }
        }
    },
    plugins: [require("daisyui")],
}