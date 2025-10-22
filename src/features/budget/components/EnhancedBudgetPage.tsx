import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Settings,
  Save,
  RotateCcw,
  ListChecks,
  Sparkles,
  Info,
  PieChart,
} from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { EnhancedCategorySection } from './EnhancedCategorySection'
import { EnhancedBudgetSummary } from './EnhancedBudgetSummary'
import { UserInfoDialog } from './UserInfoDialog'
import { useBudgetData } from '../hooks/useBudgetData'
import { useSaveBudgetPlan } from '../hooks/useSaveBudgetPlan'
import { useBudgetStore } from '../../../stores/budgetStore'

export function EnhancedBudgetPage() {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg text-slate-600 font-medium">Loading budget data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-lg text-red-600 mb-4 font-semibold">Failed to load budget data</p>
          <p className="text-sm text-slate-600 mb-6">
            Please make sure the database schema is set up correctly
          </p>
          <Link to="/admin">
            <Button>Go to Admin Panel</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!categories || !config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PieChart className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-lg text-slate-600 mb-4 font-semibold">No budget data available</p>
          <p className="text-sm text-slate-500 mb-6">
            Set up your budget categories and configuration first
          </p>
          <Link to="/admin">
            <Button>
              <Settings className="w-4 h-4 mr-2" />
              Go to Admin Panel
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const hasChanges = Object.keys(changes).length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">Budget Adjustment</h1>
                  <p className="text-green-100 text-lg">
                    Fine-tune your budget allocations with precision
                  </p>
                </div>
              </div>
              {hasChanges && (
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 animate-pulse">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                  <span className="text-sm font-medium">
                    {Object.keys(changes).length} unsaved change{Object.keys(changes).length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <Link to="/plans">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <ListChecks className="w-4 h-4 mr-2" />
                  View Plans
                </Button>
              </Link>
              <Link to="/admin">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Categories Section */}
          <div className="lg:col-span-2 space-y-6">
            {categories.map((category) => (
              <EnhancedCategorySection key={category.id} category={category} />
            ))}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <EnhancedBudgetSummary
                categories={categories}
                totalIncome={config.total_income}
              />

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed h-12 text-base font-semibold"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Budget Plan
                </Button>

                <Button
                  onClick={handleReset}
                  disabled={!hasChanges}
                  variant="outline"
                  className="w-full h-12 border-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset All Changes
                </Button>
              </div>

              {/* Help Text */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">
                      How to adjust
                    </h4>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Use the sliders to adjust each subcategory by ±10% from its default value.
                      Watch the summary panel for real-time budget updates.
                    </p>
                  </div>
                </div>
              </div>
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
