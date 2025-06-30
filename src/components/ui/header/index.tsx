"use client"
import React from "react"
import Link from "next/link"
import Logo from "@/components/icons/logo"
import { ModeToggle } from "@/components/ui/color-scheme-button"
import { HamburgerMenuIcon, Cross1Icon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import { useAppContext } from "@/components/context"

const Header = () => {
  const { state, dispatch } = useAppContext()

  return (
    <header className="px-3 py-2  md:px-2 bg-background">
      <nav className="container mx-auto">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="block p-2 rounded-lg bg-background hover:bg-accent transition"
          >
            <Logo />
          </Link>
          <div className="hidden md:flex">
            <ul className="flex space-x-8">
              <li>
                <a
                  href="#home"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-2"
                >
                  Work
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-2"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#projects"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-2"
                >
                  Labs
                </a>
              </li>
            </ul>
          </div>
          <div>
            <ModeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="inline-flex md:hidden items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
              onClick={() =>
                dispatch({ type: "SET_MENU", payload: !state.isMenuOpen })
              }
            >
              {state.isMenuOpen ? (
                <Cross1Icon className="h-[1.1rem] w-[1.1rem]" />
              ) : (
                <HamburgerMenuIcon className="h-[1.1rem] w-[1.1rem]" />
              )}
            </Button>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
