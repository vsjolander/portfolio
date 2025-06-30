"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { AppProvider } from "../context"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <AppProvider>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </AppProvider>
  )
}
