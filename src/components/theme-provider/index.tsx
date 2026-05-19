"use client"

import * as React from "react"
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes"
import { AppProvider } from "../context"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <AppProvider>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </AppProvider>
  )
}
