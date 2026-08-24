import { useId } from 'react'
import { useTheme } from '../context/ThemeContext'

export function Logo({ className = 'h-8 w-auto', showText = true }) {
  const { isDark } = useTheme()
  const gradientId = useId()
  const backgroundId = useId()
  const glowId = useId()

  return (
    <div className="flex items-center gap-2.5 select-none">
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="55%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
          <linearGradient id={backgroundId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EEF2FF" />
            <stop offset="55%" stopColor="#DBEAFE" />
            <stop offset="100%" stopColor="#ECFDF5" />
          </linearGradient>
          <radialGradient id={glowId} cx="0" cy="0" r="1" gradientTransform="translate(14 12) rotate(35) scale(30 30)">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect
          width="48"
          height="48"
          rx="12"
          fill={`url(#${backgroundId})`}
          stroke="#C7D2FE"
          strokeWidth="1.5"
        />
        <rect width="48" height="48" rx="12" fill={`url(#${glowId})`} opacity="0.8" />

        <path
          d="M12 26C12 21.5817 15.5817 18 20 18C21.0368 18 22.0232 18.1973 22.9287 18.5567C24.4754 15.2289 27.8763 13 31.8 13C37.4333 13 42 17.5667 42 23.2C42 23.6749 41.9675 24.1423 41.9044 24.6"
          stroke={`url(#${gradientId})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />
        <path
          d="M8 28H15L19 19L24 34L28 23L31 28H40"
          stroke={`url(#${gradientId})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="37" cy="15" r="2.5" fill="#34D399" />
        <circle cx="37" cy="15" r="4.5" fill="#6EE7B7" fillOpacity="0.24" />
      </svg>

      {showText ? (
        <div className="flex items-center text-xl font-extrabold tracking-tight">
          <span className={isDark ? 'text-slate-50' : 'text-slate-800'}>Fin</span>
          <span
            className={
              isDark
                ? 'bg-gradient-to-r from-indigo-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-indigo-600 via-sky-500 to-emerald-500 bg-clip-text text-transparent'
            }
          >
            Pulse
          </span>
          <span
            className={
              isDark
                ? 'ml-1 rounded-full border border-emerald-300/30 bg-emerald-300/12 px-2 py-0.5 text-xs font-mono font-semibold uppercase tracking-[0.24em] text-emerald-200 shadow-[0_0_20px_rgba(52,211,153,0.18)]'
                : 'ml-1 rounded-full border border-emerald-400/35 bg-emerald-50 px-2 py-0.5 text-xs font-mono font-semibold uppercase tracking-[0.24em] text-emerald-700 shadow-[0_0_18px_rgba(16,185,129,0.08)]'
            }
          >
            AI
          </span>
        </div>
      ) : null}
    </div>
  )
}

export default Logo
