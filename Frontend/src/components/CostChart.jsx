import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function CostChart({ data = [] }) {
  return (
    <div className="panel h-[420px] p-5">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">Spend vs utilization</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Daily cloud spend and CPU contour</h3>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.28em] text-slate-400">
          trailing 14 days
        </span>
      </div>

      <ResponsiveContainer width="100%" height="82%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="costGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.55} />
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
          <XAxis dataKey="dateLabel" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <YAxis
            yAxisId="left"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              background: '#0f172a',
              border: '1px solid rgba(148,163,184,0.2)',
              borderRadius: '16px',
              color: '#e2e8f0',
            }}
          />
          <Legend wrapperStyle={{ color: '#cbd5e1', paddingTop: 12 }} />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="spend"
            name="Daily Spend"
            stroke="#818cf8"
            fill="url(#costGradient)"
            strokeWidth={2.5}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cpu"
            name="Avg CPU"
            stroke="#34d399"
            dot={{ r: 3, fill: '#34d399' }}
            activeDot={{ r: 5 }}
            strokeWidth={2.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CostChart
