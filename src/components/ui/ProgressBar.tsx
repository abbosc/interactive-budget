interface ProgressBarProps {
  value: number
  max: number
  color?: string
  showPercentage?: boolean
  height?: string
  animated?: boolean
}

export function ProgressBar({
  value,
  max,
  color = '#3b82f6',
  showPercentage = false,
  height = 'h-2',
  animated = true,
}: ProgressBarProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0

  return (
    <div className="w-full">
      <div className={`w-full bg-slate-200 rounded-full overflow-hidden ${height}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            animated ? 'animate-pulse-slow' : ''
          }`}
          style={{
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>
      {showPercentage && (
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>{percentage.toFixed(1)}%</span>
          <span>
            {value.toLocaleString()} / {max.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  )
}
