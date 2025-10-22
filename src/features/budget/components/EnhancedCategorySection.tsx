import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { EnhancedSubcategoryCard } from './EnhancedSubcategoryCard'
import { formatMln } from '../../../lib/formatters'
import { useBudgetStore } from '../../../stores/budgetStore'
import type { Category } from '../../../types/budget'

interface EnhancedCategorySectionProps {
  category: Category
}

export function EnhancedCategorySection({ category }: EnhancedCategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const { changes } = useBudgetStore()

  // Calculate category total
  const categoryTotal = category.subcategories?.reduce((sum, sub) => {
    const value = changes[sub.id] ?? sub.default_value
    return sum + value
  }, 0) || 0

  const categoryDefaultTotal = category.subcategories?.reduce(
    (sum, sub) => sum + sub.default_value,
    0
  ) || 0

  const categoryChange = categoryTotal - categoryDefaultTotal
  const categoryChangePercent = categoryDefaultTotal > 0
    ? ((categoryChange / categoryDefaultTotal) * 100)
    : 0

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white">
      {/* Category Header */}
      <div
        className="p-6 cursor-pointer transition-all duration-200 hover:opacity-90"
        style={{
          background: `linear-gradient(135deg, ${category.color}15 0%, ${category.color}05 100%)`,
          borderBottom: `3px solid ${category.color}`,
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg transform transition-transform hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${category.color} 0%, ${category.color}dd 100%)`,
                fontFamily: 'FontAwesome',
              }}
              dangerouslySetInnerHTML={{ __html: category.icon }}
            />

            {/* Info */}
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">
                {category.name}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">
                  {category.subcategories?.length || 0} subcategories
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-sm font-semibold text-slate-700">
                  Total: {formatMln(categoryTotal)}
                </span>
                {Math.abs(categoryChangePercent) > 0.1 && (
                  <>
                    <span className="text-slate-400">•</span>
                    <span
                      className={`text-sm font-bold ${
                        categoryChange > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {categoryChange > 0 ? '+' : ''}
                      {categoryChangePercent.toFixed(1)}%
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Expand/Collapse */}
          <button className="p-2 rounded-full hover:bg-white/50 transition-colors">
            {isExpanded ? (
              <ChevronUp className="w-6 h-6 text-slate-600" />
            ) : (
              <ChevronDown className="w-6 h-6 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      {/* Subcategories */}
      {isExpanded && (
        <div className="p-6 grid gap-4 animate-fade-in">
          {category.subcategories?.map((subcategory) => (
            <EnhancedSubcategoryCard
              key={subcategory.id}
              subcategory={subcategory}
              categoryColor={category.color}
            />
          ))}
          {(!category.subcategories || category.subcategories.length === 0) && (
            <div className="text-center py-8">
              <p className="text-slate-500 italic">No subcategories available</p>
              <p className="text-sm text-slate-400 mt-1">
                Add subcategories in the admin panel
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
