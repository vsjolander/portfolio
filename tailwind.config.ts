import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        "nav-width": "200px",
        // Fine-grained spacing (0.5x increments)
        "0.5": "0.125rem", // 2px
        "1.5": "0.375rem", // 6px
        "2.5": "0.625rem", // 10px
        "3.5": "0.875rem", // 14px
        "4.5": "1.125rem", // 18px
        "5.5": "1.375rem", // 22px
        "6.5": "1.625rem", // 26px
        "7.5": "1.875rem", // 30px
        "8.5": "2.125rem", // 34px
        "9.5": "2.375rem", // 38px
        "10.5": "2.625rem", // 42px
        "11.5": "2.875rem", // 46px
        "12.5": "3.125rem", // 50px
        "13.5": "3.375rem", // 54px
        "14.5": "3.625rem", // 58px
        "15.5": "3.875rem", // 62px
        "16.5": "4.125rem", // 66px
        "17.5": "4.375rem", // 70px
        "18.5": "4.625rem", // 74px
        "19.5": "4.875rem", // 78px
        "20.5": "5.125rem", // 82px

        // Extended large spacing for generous padding
        "22": "5.5rem", // 88px
        "24": "6rem", // 96px
        "26": "6.5rem", // 104px
        "28": "7rem", // 112px
        "30": "7.5rem", // 120px
        "32": "8rem", // 128px
        "34": "8.5rem", // 136px
        "36": "9rem", // 144px
        "38": "9.5rem", // 152px
        "40": "10rem", // 160px
        "44": "11rem", // 176px
        "48": "12rem", // 192px
        "52": "13rem", // 208px
        "56": "14rem", // 224px
        "60": "15rem", // 240px
        "64": "16rem", // 256px
        "68": "17rem", // 272px
        "72": "18rem", // 288px
        "76": "19rem", // 304px
        "80": "20rem", // 320px
        "84": "21rem", // 336px
        "88": "22rem", // 352px
        "92": "23rem", // 368px
        "96": "24rem", // 384px
        "100": "25rem", // 400px
        "104": "26rem", // 416px
        "108": "27rem", // 432px
        "112": "28rem", // 448px
        "116": "29rem", // 464px
        "120": "30rem", // 480px

        // Extra large spacing for hero sections and layouts
        "128": "32rem", // 512px
        "144": "36rem", // 576px
        "160": "40rem", // 640px
        "176": "44rem", // 704px
        "192": "48rem", // 768px
        "208": "52rem", // 832px
        "224": "56rem", // 896px
        "240": "60rem", // 960px
        "256": "64rem", // 1024px

        // Semantic size tokens for padding
        "padding-xs": "0.5rem", // 8px
        "padding-sm": "0.75rem", // 12px
        "padding-md": "1rem", // 16px
        "padding-lg": "1.5rem", // 24px
        "padding-xl": "2rem", // 32px
        "padding-2xl": "2.5rem", // 40px
        "padding-3xl": "3rem", // 48px
        "padding-4xl": "4rem", // 64px
        "padding-5xl": "5rem", // 80px
        "padding-6xl": "6rem", // 96px
        "padding-7xl": "8rem", // 128px
        "padding-8xl": "10rem", // 160px
        "padding-9xl": "12rem", // 192px
        "padding-10xl": "16rem", // 256px

        // Component-specific padding tokens
        "card-xs": "0.75rem", // 12px
        "card-sm": "1rem", // 16px
        "card-md": "1.5rem", // 24px
        "card-lg": "2rem", // 32px
        "card-xl": "2.5rem", // 40px
        "card-2xl": "3rem", // 48px

        "section-xs": "2rem", // 32px
        "section-sm": "3rem", // 48px
        "section-md": "4rem", // 64px
        "section-lg": "6rem", // 96px
        "section-xl": "8rem", // 128px
        "section-2xl": "10rem", // 160px
        "section-3xl": "12rem", // 192px

        "container-xs": "1rem", // 16px
        "container-sm": "1.5rem", // 24px
        "container-md": "2rem", // 32px
        "container-lg": "3rem", // 48px
        "container-xl": "4rem", // 64px
        "container-2xl": "6rem", // 96px

        // Hero and layout padding
        "hero-sm": "4rem", // 64px
        "hero-md": "6rem", // 96px
        "hero-lg": "8rem", // 128px
        "hero-xl": "12rem", // 192px
        "hero-2xl": "16rem", // 256px
      },
      container: {
        screens: {
          sm: "600px",
          md: "728px",
          lg: "984px",
          xl: "1088px",
          "2xl": "1088px",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
