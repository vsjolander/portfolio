import React from "react"
import Link from "next/link"
import Logo from "@/components/icons/logo"

const Header = () => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-sm border-b border-border/40 bg-background/80">
      <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/">
          <Logo />
        </Link>
        <nav>
          <ul className="flex items-center gap-6">
            <li>
              <a
                href="#work"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Work
              </a>
            </li>
            <li>
              <a
                href="#about"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
