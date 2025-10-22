interface BudgetGaugeProps {
  current: number
  total: number
  title: string
  color: string
}

export function BudgetGauge({ current, total, title, color }: BudgetGaugeProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const getStatusColor = () => {
    if (percentage > 95) return '#ef4444'
    if (percentage > 80) return '#f59e0b'
    return color
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="transform -rotate-90 w-32 h-32">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="#e2e8f0"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke={getStatusColor()}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900">
            {percentage.toFixed(0)}%
          </span>
          <span className="text-xs text-slate-500">used</span>
        </div>
      </div>
      <p className="text-sm font-medium text-slate-700 mt-2 text-center">{title}</p>
    </div>
  )
}
