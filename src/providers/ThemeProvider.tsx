// src/providers/ThemeProvider.tsx
'use client'
import { createContext } from 'react'

export const ThemeContext = createContext('light')

import { ReactNode } from 'react';

export default function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value="dark">
      {children}
    </ThemeContext.Provider>
  )
}
