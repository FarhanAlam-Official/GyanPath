"use client"

import { Toaster as Sonner, ToasterProps } from "sonner"

// Optional: If you're using next-themes for theme support, uncomment the line below
// import { useTheme } from 'next-themes'

const Toaster = ({ ...props }: ToasterProps) => {
  // Optional: If you're using next-themes, uncomment these lines:
  // const { theme = 'system' } = useTheme()

  return (
    <Sonner
      // theme={theme as ToasterProps['theme']} // Uncomment if using next-themes
      className="toaster group"
      position="top-right"
      duration={2500}
      visibleToasts={5}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
