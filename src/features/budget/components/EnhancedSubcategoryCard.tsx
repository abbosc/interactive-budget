import { useState } from 'react'
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react'
import { NoUiSlider } from '../../../components/ui/NoUiSlider'
import { ProgressBar } from '../../../components/ui/ProgressBar'
import { AnimatedNumber } from '../../../components/ui/AnimatedNumber'
import { formatMln, formatNumber } from '../../../lib/formatters'
import { calcPercent, getSliderRange } from '../../../lib/calculations'
import { useBudgetStore } from '../../../stores/budgetStore'
import type { Subcategory } from '../../../types/budget'

interface EnhancedSubcategoryCardProps {
  subcategory: Subcategory
  categoryColor: string
}

export function EnhancedSubcategoryCard({
  subcategory,
  categoryColor,
}: EnhancedSubcategoryCardProps) {
  const { changes, setChange } = useBudgetStore()
  const currentValue = changes[subcategory.id] ?? subcategory.default_value
  const [min, max] = getSliderRange(subcategory.default_value)
  const percentChange = calcPercent(subcategory.default_value, currentValue)
  const [isHovered, setIsHovered] = useState(false)

  const handleValueChange = (value: number) => {
    setChange(subcategory.id, value)
  }

  const isChanged = currentValue !== subcategory.default_value
  const isIncreased = percentChange > 0

  const getStatusIcon = () => {
    if (Math.abs(percentChange) < 1) return <CheckCircle className="w-4 h-4 text-green-500" />
    if (Math.abs(percentChange) > 8) return <AlertCircle className="w-4 h-4 text-amber-500" />
    if (isIncreased) return <TrendingUp className="w-4 h-4 text-green-500" />
    return <TrendingDown className="w-4 h-4 text-emerald-500" />
  }

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border transition-all duration-300
        ${isHovered ? 'shadow-xl scale-[1.02] border-slate-300' : 'shadow-sm border-slate-200'}
        ${isChanged ? 'bg-gradient-to-br from-white to-slate-50' : 'bg-white'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(90deg, ${categoryColor}, ${categoryColor}dd)`,
        }}
      />

      <div className="p-5 pt-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {getStatusIcon()}
              <h4 className="font-semibold text-slate-900 text-base">
                {subcategory.name}
              </h4>
            </div>
            <p className="text-xs text-slate-500">
              Default: {formatMln(subcategory.default_value)}
            </p>
          </div>

          {isChanged && (
            <div
              className={`
                px-3 py-1.5 rounded-full text-sm font-bold
                animate-pulse-slow
                ${
                  isIncreased
                    ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-200'
                    : 'bg-gradient-to-r from-red-100 to-red-50 text-red-700 border border-red-200'
                }
              `}
            >
              {isIncreased ? '+' : ''}
              {formatNumber(percentChange, 1)}%
            </div>
          )}
        </div>

        {/* Current Value Display */}
        <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Current Value</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">
                <AnimatedNumber value={currentValue} formatter={formatMln} />
              </div>
              {isChanged && (
                <div className={`text-xs ${isIncreased ? 'text-green-600' : 'text-red-600'}`}>
                  {isIncreased ? '+' : ''}
                  {formatMln(currentValue - subcategory.default_value)} change
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar showing position in range */}
        <div className="mb-4">
          <ProgressBar
            value={currentValue - min}
            max={max - min}
            color={categoryColor}
            height="h-3"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>-10%</span>
            <span>Range</span>
            <span>+10%</span>
          </div>
        </div>

        {/* Enhanced Slider */}
        <div className={`transition-transform duration-200 ${isHovered ? 'scale-[1.02]' : ''}`}>
          <NoUiSlider
            min={min}
            max={max}
            value={currentValue}
            defaultValue={subcategory.default_value}
            onChange={handleValueChange}
            color={categoryColor}
            step={subcategory.default_value * 0.001}
          />
        </div>

        {/* Quick Actions (shown on hover) */}
        {isHovered && isChanged && (
          <div className="mt-4 pt-4 border-t border-slate-200 animate-fade-in">
            <button
              onClick={() => setChange(subcategory.id, subcategory.default_value)}
              className="text-xs text-slate-600 hover:text-slate-900 underline"
            >
              Reset to default
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
