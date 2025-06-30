import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import Header from "@/components/ui/header"
import { ThemeProvider } from "@/components/theme-provider"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
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
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Header />
          <div className="duration-sidebar ease-curve-sidebar grid transition-[grid-template-columns] grid-cols-[1fr] md:grid-cols-[theme(spacing.nav-width)_1fr]">
            <nav className="hidden px-3 md:px-2 md:flex">
              <div className="hidden md:flex w-full">
                <ul className="flex flex-col w-full align-center pt-32 gap-1">
                  <li>
                    <a
                      href="#work"
                      className="w-full inline-flex items-center justify-start whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-2 hover:pl-4"
                    >
                      Work
                    </a>
                  </li>
                  <li>
                    <a
                      href="#about"
                      className="w-full inline-flex items-center justify-start whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-2 hover:pl-4"
                    >
                      About
                    </a>
                  </li>
                  <li>
                    <a
                      href="#cv"
                      className="w-full inline-flex items-center justify-start whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-2 hover:pl-4"
                    >
                      CV
                    </a>
                  </li>
                </ul>
              </div>
            </nav>
            <main>{children}</main>
          </div>
        </body>
      </html>
    </ThemeProvider>
  )
}
