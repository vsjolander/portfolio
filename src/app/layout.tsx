import type { Metadata } from "next"
import localFont from "next/font/local"
import "./layout.css"
import { ThemeProvider } from "@/components/theme-provider"

const soehne = localFont({
  variable: "--font-sans",
  src: [
    {
      path: "../assets/fonts/test-soehne-extraleicht.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../assets/fonts/test-soehne-extraleicht-kursiv.woff2",
      weight: "200",
      style: "italic",
    },
    {
      path: "../assets/fonts/test-soehne-leicht.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../assets/fonts/test-soehne-leicht-kursiv.woff2",
      weight: "300",
      style: "italic",
    },
    {
      path: "../assets/fonts/test-soehne-buch.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/test-soehne-buch-kursiv.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../assets/fonts/test-soehne-kraftig.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/test-soehne-kraftig-kursiv.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../assets/fonts/test-soehne-halbfett.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../assets/fonts/test-soehne-halbfett-kursiv.woff2",
      weight: "600",
      style: "italic",
    },
    {
      path: "../assets/fonts/test-soehne-dreiviertelfett.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../assets/fonts/test-soehne-dreiviertelfett-kursiv.woff2",
      weight: "700",
      style: "italic",
    },
    {
      path: "../assets/fonts/test-soehne-fett.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../assets/fonts/test-soehne-fett-kursiv.woff2",
      weight: "800",
      style: "italic",
    },
    {
      path: "../assets/fonts/test-soehne-extrafett.woff2",
      weight: "900",
      style: "normal",
    },
    {
      path: "../assets/fonts/test-soehne-extrafett-kursiv.woff2",
      weight: "900",
      style: "italic",
    },
  ],
})

const soehneMono = localFont({
  variable: "--font-mono",
  src: [
    {
      path: "../assets/fonts/test-soehne-mono-extraleicht.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../assets/fonts/test-soehne-mono-extraleicht-kursiv.woff2",
      weight: "200",
      style: "italic",
    },
    {
      path: "../assets/fonts/test-soehne-mono-leicht.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../assets/fonts/test-soehne-mono-leicht-kursiv.woff2",
      weight: "300",
      style: "italic",
    },
    {
      path: "../assets/fonts/test-soehne-mono-buch.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/test-soehne-mono-buch-kursiv.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../assets/fonts/test-soehne-mono-kraftig.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/test-soehne-mono-kraftig-kursiv.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../assets/fonts/test-soehne-mono-halbfett.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../assets/fonts/test-soehne-mono-halbfett-kursiv.woff2",
      weight: "600",
      style: "italic",
    },
    {
      path: "../assets/fonts/test-soehne-mono-dreiviertelfett.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../assets/fonts/test-soehne-mono-dreiviertelfett-kursiv.woff2",
      weight: "700",
      style: "italic",
    },
    {
      path: "../assets/fonts/test-soehne-mono-fett.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../assets/fonts/test-soehne-mono-fett-kursiv.woff2",
      weight: "800",
      style: "italic",
    },
    {
      path: "../assets/fonts/test-soehne-mono-extrafett.woff2",
      weight: "900",
      style: "normal",
    },
    {
      path: "../assets/fonts/test-soehne-mono-extrafett-kursiv.woff2",
      weight: "900",
      style: "italic",
    },
  ],
})

export const metadata: Metadata = {
  title: "Vilhelm Olof Sjölander",
  description: "Vilhelm is a developer and designer from Stockholm Sweden",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <html lang="en">
        <body className={`font-sans antialiased`}>
          <main>{children}</main>
        </body>
      </html>
    </ThemeProvider>
  )
}
