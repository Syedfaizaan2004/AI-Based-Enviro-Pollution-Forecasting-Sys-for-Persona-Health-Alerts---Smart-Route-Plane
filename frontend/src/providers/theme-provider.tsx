import { useEffect } from "react"
import { useTheme } from "@/store/themeStore"

type ThemeProviderProps = {
  children: React.ReactNode
}

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  const { theme, accent, highContrast } = useTheme()

  useEffect(() => {
    const root = window.document.documentElement

    // Theme Logic
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }

    // Accent Logic
    root.setAttribute('data-accent', accent)

    // High Contrast Logic
    if (highContrast) {
      root.setAttribute('data-contrast', 'high')
    } else {
      root.removeAttribute('data-contrast')
    }

  }, [theme, accent, highContrast])

  return (
    <div {...props}>
      {children}
    </div>
  )
}
