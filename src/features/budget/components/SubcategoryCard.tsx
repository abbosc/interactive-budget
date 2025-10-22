import { Slider } from '../../../components/ui/Slider'
import { formatMln, formatNumber } from '../../../lib/formatters'
import { calcPercent, getSliderRange } from '../../../lib/calculations'
import { useBudgetStore } from '../../../stores/budgetStore'
import type { Subcategory } from '../../../types/budget'

interface SubcategoryCardProps {
  subcategory: Subcategory
}

export function SubcategoryCard({ subcategory }: SubcategoryCardProps) {
  const { changes, setChange } = useBudgetStore()
  const currentValue = changes[subcategory.id] ?? subcategory.default_value
  const [min, max] = getSliderRange(subcategory.default_value)
  const percentChange = calcPercent(subcategory.default_value, currentValue)

  const handleValueChange = (values: number[]) => {
    setChange(subcategory.id, values[0])
  }

  const isChanged = currentValue !== subcategory.default_value

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-slate-900">{subcategory.name}</h4>
        {isChanged && (
          <span
            className={cn(
              'text-sm font-medium px-2 py-1 rounded',
              percentChange > 0
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            )}
          >
            {percentChange > 0 ? '+' : ''}
            {formatNumber(percentChange, 1)}%
          </span>
        )}
      </div>

      <div className="space-y-2">
        <Slider
          min={min}
          max={max}
          step={subcategory.default_value * 0.001}
          value={[currentValue]}
          onValueChange={handleValueChange}
        />

        <div className="flex justify-between text-sm">
          <span className="text-slate-500">
            Default: {formatMln(subcategory.default_value)}
          </span>
          <span className="font-medium text-slate-900">
            Current: {formatMln(currentValue)}
          </span>
        </div>
      </div>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
