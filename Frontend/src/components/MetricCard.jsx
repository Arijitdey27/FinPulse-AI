function MetricCard({ title, value, trend, icon: Icon, tone = 'indigo', detail }) {
  const hasTrend = typeof trend === 'number'
  const trendPositive = hasTrend ? trend >= 0 : false
  const toneStyles = {
    indigo: 'from-indigo-500/25 to-indigo-400/5 text-indigo-200',
    emerald: 'from-emerald-500/25 to-emerald-400/5 text-emerald-200',
    amber: 'from-amber-500/25 to-amber-400/5 text-amber-200',
    rose: 'from-rose-500/25 to-rose-400/5 text-rose-200',
  }

  return (
    <article className="panel overflow-hidden p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-3 break-words text-2xl font-semibold tracking-tight text-white sm:text-3xl">{value}</p>
          {detail ? <p className="mt-2 text-sm text-slate-500">{detail}</p> : null}
        </div>
        <div className={`shrink-0 rounded-2xl bg-gradient-to-br p-3 ${toneStyles[tone] || toneStyles.indigo}`}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
      </div>

      {hasTrend ? (
        <div className="mt-5 flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              trendPositive
                ? 'bg-emerald-400/15 text-emerald-300'
                : 'bg-rose-400/15 text-rose-300'
            }`}
          >
            {trendPositive ? '+' : ''}
            {trend}%
          </span>
          <span className="text-xs uppercase tracking-[0.28em] text-slate-500">vs last 30 days</span>
        </div>
      ) : null}
    </article>
  )
}

export default MetricCard
