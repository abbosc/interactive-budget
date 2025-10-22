import { Link } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { PlanCard } from './PlanCard'
import { useBudgetPlans } from '../hooks/useBudgetPlans'

export function PlansPage() {
  const { data: plans, isLoading, error } = useBudgetPlans()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading budget plans...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">Failed to load budget plans</p>
          <p className="text-sm text-slate-600">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <Link to="/budget">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Budget
            </Button>
          </Link>
        </div>

        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Budget Plans</h1>
            <p className="text-slate-600 mt-2">
              View all saved budget plans from the community
            </p>
          </div>
          <Link to="/budget">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create New Plan
            </Button>
          </Link>
        </div>

        {!plans || plans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-slate-500 mb-4">No budget plans yet</p>
            <p className="text-sm text-slate-400 mb-6">
              Create your first budget plan to get started
            </p>
            <Link to="/budget">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Budget Plan
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}

        {plans && plans.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Showing {plans.length} budget plan{plans.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
