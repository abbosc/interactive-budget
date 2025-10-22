import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Settings, Save, RotateCcw, ListChecks } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { CategorySection } from './CategorySection'
import { BudgetSummary } from './BudgetSummary'
import { UserInfoDialog } from './UserInfoDialog'
import { useBudgetData } from '../hooks/useBudgetData'
import { useSaveBudgetPlan } from '../hooks/useSaveBudgetPlan'
import { useBudgetStore } from '../../../stores/budgetStore'

export function BudgetPage() {
  const navigate = useNavigate()
  const { categories, config, isLoading, error } = useBudgetData()
  const saveBudgetPlan = useSaveBudgetPlan()
  const { changes, clearChanges } = useBudgetStore()
  const [showUserDialog, setShowUserDialog] = useState(false)

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all changes?')) {
      clearChanges()
    }
  }

  const handleSave = () => {
    setShowUserDialog(true)
  }

  const handleUserInfoSubmit = (userInfo: {
    name?: string
    age?: number
    occupation?: string
  }) => {
    if (!categories || !config) return

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

    const deficit = config.total_income - totalExpenses

    saveBudgetPlan.mutate(
      {
        budget_config_id: config.id,
        user_name: userInfo.name,
        user_age: userInfo.age,
        user_occupation: userInfo.occupation,
        changes,
        total_income: config.total_income,
        total_expenses: totalExpenses,
        deficit,
      },
      {
        onSuccess: () => {
          setShowUserDialog(false)
          clearChanges()
          navigate('/plans')
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading budget data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">Failed to load budget data</p>
          <p className="text-sm text-slate-600">
            Please make sure the database schema is set up correctly
          </p>
        </div>
      </div>
    )
  }

  if (!categories || !config) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-600 mb-4">No budget data available</p>
          <Link to="/admin">
            <Button>Go to Admin Panel</Button>
          </Link>
        </div>
      </div>
    )
  }

  const hasChanges = Object.keys(changes).length > 0

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Budget Adjustment
            </h1>
            <p className="text-slate-600 mt-2">
              Adjust budget allocations using the sliders below
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/plans">
              <Button variant="outline">
                <ListChecks className="w-4 h-4 mr-2" />
                View Plans
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {categories.map((category) => (
              <CategorySection key={category.id} category={category} />
            ))}
          </div>

          <div className="lg:col-span-1">
            <BudgetSummary
              categories={categories}
              totalIncome={config.total_income}
            />

            <div className="mt-6 space-y-3">
              <Button
                onClick={handleSave}
                disabled={!hasChanges}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Budget Plan
              </Button>

              <Button
                onClick={handleReset}
                disabled={!hasChanges}
                variant="outline"
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      <UserInfoDialog
        open={showUserDialog}
        onOpenChange={setShowUserDialog}
        onSubmit={handleUserInfoSubmit}
        isLoading={saveBudgetPlan.isPending}
      />
    </div>
  )
}
