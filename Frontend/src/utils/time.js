export function parseBackendUtcTimestamp(value) {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return value
  }

  const normalized = String(value).trim()

  if (!normalized) {
    return null
  }

  const hasTimezone = /[zZ]$|[+-]\d{2}:\d{2}$/.test(normalized)
  return new Date(hasTimezone ? normalized : `${normalized}Z`)
}

export function formatUtcTimestamp(value, locale = 'en-GB', options = {}) {
  const date = parseBackendUtcTimestamp(value)

  if (!date || Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat(locale, options).format(date)
}
