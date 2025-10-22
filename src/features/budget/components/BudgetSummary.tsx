import { formatMln } from '../../../lib/formatters'
import { useBudgetStore } from '../../../stores/budgetStore'
import type { Category } from '../../../types/budget'

interface BudgetSummaryProps {
  categories: Category[]
  totalIncome: number
}

export function BudgetSummary({ categories, totalIncome }: BudgetSummaryProps) {
  const { changes } = useBudgetStore()

  // Calculate total expenses (default values + changes)
  const totalExpenses = categories.reduce((sum, category) => {
    return (
      sum +
      (category.subcategories?.reduce((catSum, sub) => {
        const value = changes[sub.id] ?? sub.default_value
        return catSum + value
      }, 0) || 0)
    )
  }, 0)

  const deficit = totalIncome - totalExpenses

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm sticky top-8">
      <h3 className="text-lg font-semibold mb-4">Budget Summary</h3>

      <div className="space-y-3">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
          <span className="text-slate-600">Total Income</span>
          <span className="text-lg font-semibold text-slate-900">
            {formatMln(totalIncome)}
          </span>
        </div>

        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
          <span className="text-slate-600">Total Expenses</span>
          <span className="text-lg font-semibold text-slate-900">
            {formatMln(totalExpenses)}
          </span>
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-slate-900 font-medium">Deficit</span>
          <span
            className={cn(
              'text-xl font-bold',
              deficit >= 0 ? 'text-green-600' : 'text-red-600'
            )}
          >
            {formatMln(deficit)}
          </span>
        </div>
      </div>

      {deficit < 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            Budget deficit detected. Reduce expenses or increase income.
          </p>
        </div>
      )}
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
