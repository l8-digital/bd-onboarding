const defaultTheme = require('tailwindcss/defaultTheme');

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            keyframes: {
                scroll: {
                    '0%': {transform: 'translateX(80%)'},
                    '100%': {transform: 'translateX(-100%)'},
                },
            },
            animation: {
                scroll: 'scroll 5s linear infinite',
            },
            fontFamily: {
                // sans: ['Inter', ...defaultTheme.fontFamily.sans, 'Segoe UI Emoji', 'Noto Color Emoji', 'Android Emoji', 'Apple Color Emoji'],
                sans: ['Aeonik Medium', 'sans-serif'],
            },
        },
        colors: {
            'primary': 'rgb(26 92 241 / <alpha-value>)',
            'primary-bw': 'oklch(1 0 0)',
            'neutral': 'rgb(0 0 0 / <alpha-value>)',
            'neutral-bw': 'oklch(1 0 0)',
            'content': 'oklch(1 0 0)',
            'content-bw': 'oklch(0 0 0)',
            'success': 'oklch(0 0 0)',
            'success-bw': 'oklch(0 0 0)',
            'root': 'rgb(15 15 15 / <alpha-value>)',
            'white': {
                light: '#F7F7F7',
                DEFAULT: 'rgb(255 255 255 / <alpha-value>)',
                dark: '#dedede',
            },
            'yellow': 'rgb(253 212 82 / <alpha-value>)',
            'orange': {
                light: '#2c2c2c',
                DEFAULT: '#F58700',
                dark: '#A35A00',
            },
            'red': '#df2424',
            'green': '#27AE60',
            'black': {
                light: '#222',
                DEFAULT: '#000000',
                dark: '#181818',
            },
            'gray': {
                light: '#F2F2F2',
                DEFAULT: '#545454',
                dark: '#2b2b2b',
            },
            'silver': '#707070',
            'blue': '#265DC6',
            'golden': '#FAB709',
            'rose': '#FFC4BD',
            transparent: 'transparent',
            current: 'currentColor',
        },
        container: {
            center: true,
            padding: {
                DEFAULT: '2rem',
                md: '1.25rem',
            },
        },
        aspectRatio: {
            auto: 'auto',
            square: '1 / 1',
            video: '16 / 9',
            1: '1',
            2: '2',
            3: '3',
            4: '4',
            5: '5',
            6: '6',
            7: '7',
            8: '8',
            9: '9',
            10: '10',
            11: '11',
            12: '12',
            13: '13',
            14: '14',
            15: '15',
            16: '16',
        }
    },
}