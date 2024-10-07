import React from "react"
import Link from "next/link"
import Logo from "@/components/icons/logo"
import { ModeToggle } from "@/components/ui/color-scheme-button"

const Header = () => {
  return (
    <header className="p-3 bg-background">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link
            href="/"
            className="block p-2 rounded-lg bg-background hover:bg-secondary transition"
          >
            <Logo />
          </Link>
          <nav>
            <ul className="flex space-x-8">
              <li>
                <a
                  href="#home"
                  className="transition font-medium hover:text-slate-600"
                >
                  Work
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="transition font-medium hover:text-slate-600"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#projects"
                  className="transition font-medium hover:text-slate-600"
                >
                  Labs
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <ModeToggle />
      </div>
    </header>
  )
}

export default Header
