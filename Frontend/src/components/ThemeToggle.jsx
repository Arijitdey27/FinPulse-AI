import { Moon, SunMedium } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`theme-toggle app-button flex h-14 w-14 items-center justify-center rounded-2xl transition ${className}`.trim()}
    >
      {isDark ? <SunMedium className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
    </button>
  )
}

export default ThemeToggle
