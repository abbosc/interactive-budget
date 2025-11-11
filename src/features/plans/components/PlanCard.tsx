import { Link } from 'react-router-dom'
import { Calendar, User, Briefcase, TrendingDown, TrendingUp, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatMln } from '../../../lib/formatters'
import { useDeleteBudgetPlan } from '../hooks/useBudgetPlans'
import type { BudgetPlan } from '../../../types/budget'

interface PlanCardProps {
  plan: BudgetPlan
}

export function PlanCard({ plan }: PlanCardProps) {
  const date = new Date(plan.created_at || '')
  const isDeficit = plan.deficit < 0
  const deletePlan = useDeleteBudgetPlan()

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation
    e.stopPropagation() // Stop event from bubbling

    console.log('🔴 Delete button clicked for plan:', plan.id)

    if (window.confirm('Are you sure you want to delete this budget plan?')) {
      console.log('🔴 User confirmed deletion, calling mutate...')
      deletePlan.mutate(plan.id, {
        onSuccess: () => {
          console.log('🔴 Component-level onSuccess called')
          toast.success('Budget plan deleted successfully')
        },
        onError: (error) => {
          console.error('🔴 Component-level onError called:', error)
          toast.error('Failed to delete budget plan')
        },
      })
      console.log('🔴 Mutate called, isPending:', deletePlan.isPending)
    } else {
      console.log('🔴 User cancelled deletion')
    }
  }

  return (
    <Link
      to={`/plans/${plan.id}`}
      className="block bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all hover:border-primary cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Calendar className="w-4 h-4" />
          <span>{date.toLocaleDateString()}</span>
          <span className="text-slate-300">•</span>
          <span>{date.toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              isDeficit
                ? 'bg-red-100 text-red-700'
                : 'bg-primary-light/20 text-primary-dark'
            )}
          >
            {isDeficit ? (
              <span className="flex items-center gap-1">
                <TrendingDown className="w-4 h-4" />
                Deficit
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Balanced
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete plan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {(plan.user_name || plan.user_age || plan.user_occupation) && (
        <div className="mb-4 space-y-2">
          {plan.user_name && (
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700">{plan.user_name}</span>
              {plan.user_age && (
                <span className="text-slate-500">({plan.user_age} years old)</span>
              )}
            </div>
          )}
          {plan.user_occupation && (
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700">{plan.user_occupation}</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
        <div>
          <p className="text-xs text-slate-500 mb-1">Income</p>
          <p className="font-semibold text-slate-900">
            {formatMln(plan.total_income)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Expenses</p>
          <p className="font-semibold text-slate-900">
            {formatMln(plan.total_expenses)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Deficit</p>
          <p
            className={cn(
              'font-semibold',
              isDeficit ? 'text-red-600' : 'text-primary'
            )}
          >
            {formatMln(plan.deficit)}
          </p>
        </div>
      </div>

      {Object.keys(plan.changes).length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            {Object.keys(plan.changes).length} budget adjustment
            {Object.keys(plan.changes).length !== 1 ? 's' : ''} made
          </p>
        </div>
      )}
    </Link>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
