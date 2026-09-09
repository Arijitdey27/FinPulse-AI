import { ArrowRight, BadgeDollarSign, Bot, CircleX, Sparkles } from 'lucide-react'

function AiRecommendationCard({ recommendation, onApply, onDismiss, isApplying = false }) {
  const actionTone =
    recommendation.recommendedAction === 'TERMINATE'
      ? 'bg-rose-400/15 text-rose-200'
      : 'bg-amber-400/15 text-amber-200'

  return (
    <article className="panel flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-slate-500">AI Optimization</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{recommendation.resourceName}</h3>
          <p className="mt-1 text-sm text-slate-400">{recommendation.recommendedInstanceType}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${actionTone}`}>
          {recommendation.recommendedAction}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="panel-muted p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Monthly cost</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            ${Number(recommendation.currentCostMonthly || 0).toLocaleString()}
          </p>
        </div>
        <div className="panel-muted border-emerald-400/20 bg-emerald-400/10 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-emerald-100/80">Estimated savings</p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-emerald-200">
            <BadgeDollarSign className="h-5 w-5" />
            ${Number(recommendation.estimatedMonthlySavings || 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-indigo-200">
          <Bot className="h-4 w-4" />
          Spring AI reasoning
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-300">{recommendation.reasoning}</p>
      </div>

      <div className="mt-5 flex flex-1 flex-col items-stretch gap-3 sm:flex-row sm:items-end">
        <button
          type="button"
          onClick={onApply}
          disabled={isApplying}
          className="app-button app-button-primary flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Sparkles className="h-4 w-4" />
          {isApplying ? 'Queueing...' : 'Apply Optimization'}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="app-button app-button-danger flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition"
        >
          <CircleX className="h-4 w-4" />
          Dismiss
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-slate-500">
        Automation lane
        <ArrowRight className="h-3.5 w-3.5" />
        Terraform / runbook hook
      </div>
    </article>
  )
}

export default AiRecommendationCard
