import { Wallet, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { AnimatedNumber } from '../../../components/ui/AnimatedNumber'
import { BudgetGauge } from '../../../components/ui/BudgetGauge'
import { ProgressBar } from '../../../components/ui/ProgressBar'
import { formatMln } from '../../../lib/formatters'
import { useBudgetStore } from '../../../stores/budgetStore'
import type { Category } from '../../../types/budget'

interface EnhancedBudgetSummaryProps {
  categories: Category[]
  totalIncome: number
}

export function EnhancedBudgetSummary({
  categories,
  totalIncome,
}: EnhancedBudgetSummaryProps) {
  const { changes } = useBudgetStore()

  // Calculate totals
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
  const utilizationRate = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0
  const changesCount = Object.keys(changes).length

  const getHealthStatus = () => {
    if (deficit < 0) return { label: 'Over Budget', color: 'text-red-600', icon: AlertTriangle }
    if (utilizationRate > 95) return { label: 'Critical', color: 'text-amber-600', icon: AlertTriangle }
    if (utilizationRate > 80) return { label: 'Warning', color: 'text-yellow-600', icon: AlertTriangle }
    return { label: 'Healthy', color: 'text-primary', icon: CheckCircle2 }
  }

  const status = getHealthStatus()
  const StatusIcon = status.icon

  return (
    <div className="space-y-4">
      {/* Main Summary Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Budget Overview
          </h3>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${status.color} bg-white/10`}>
            <StatusIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{status.label}</span>
          </div>
        </div>

        {/* Main Stats */}
        <div className="space-y-4">
          <div>
            <p className="text-slate-400 text-sm mb-1">Total Income</p>
            <p className="text-3xl font-bold">
              <AnimatedNumber value={totalIncome} formatter={formatMln} />
            </p>
          </div>

          <div>
            <p className="text-slate-400 text-sm mb-1">Total Expenses</p>
            <p className="text-3xl font-bold text-primary-light">
              <AnimatedNumber value={totalExpenses} formatter={formatMln} />
            </p>
            <ProgressBar
              value={totalExpenses}
              max={totalIncome}
              color="#35bfdc"
              height="h-2"
            />
          </div>

          <div className="pt-4 border-t border-slate-700">
            <p className="text-slate-400 text-sm mb-1">Remaining Budget</p>
            <p className={`text-3xl font-bold ${deficit >= 0 ? 'text-primary-light' : 'text-red-400'}`}>
              <AnimatedNumber value={deficit} formatter={formatMln} />
            </p>
          </div>
        </div>
      </div>

      {/* Budget Utilization Gauge */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
        <h4 className="text-sm font-semibold text-slate-700 mb-4 text-center">
          Budget Utilization
        </h4>
        <div className="flex justify-center">
          <BudgetGauge
            current={totalExpenses}
            total={totalIncome}
            title={`${utilizationRate.toFixed(1)}% Used`}
            color="#197790"
          />
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
        <h4 className="text-sm font-semibold text-slate-700 mb-4">
          Category Breakdown
        </h4>
        <div className="space-y-3">
          {categories.map((category) => {
            const categoryTotal = category.subcategories?.reduce((sum, sub) => {
              const value = changes[sub.id] ?? sub.default_value
              return sum + value
            }, 0) || 0
            const percentage = totalExpenses > 0 ? (categoryTotal / totalExpenses) * 100 : 0

            return (
              <div key={category.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700 font-medium">{category.name}</span>
                  <span className="text-slate-600">{percentage.toFixed(1)}%</span>
                </div>
                <ProgressBar
                  value={categoryTotal}
                  max={totalExpenses}
                  color={category.color}
                  height="h-2"
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Changes Summary */}
      {changesCount > 0 && (
        <div className="bg-gradient-to-r from-primary-light/10 to-primary-light/5 p-4 rounded-xl border border-primary-light/30">
          <div className="flex items-center gap-2 text-primary-dark">
            <TrendingDown className="w-5 h-5" />
            <span className="text-sm font-semibold">
              {changesCount} adjustment{changesCount !== 1 ? 's' : ''} made
            </span>
          </div>
          <p className="text-xs text-primary mt-1">
            Don't forget to save your budget plan
          </p>
        </div>
      )}
    </div>
  )
}
