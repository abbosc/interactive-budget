import { Link } from 'react-router-dom'
import {
  DollarSign,
  FolderTree,
  FileText,
  Users,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { StatCard } from './StatCard'
import { formatMln } from '../../../lib/formatters'
import { useSummaryData } from '../hooks/useSummaryData'

export function SummaryPage() {
  const { categories, config, recentPlans, isLoading, error } = useSummaryData()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading summary...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">Failed to load summary</p>
          <p className="text-sm text-slate-600">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }

  const totalCategories = categories?.length || 0
  const totalSubcategories =
    categories?.reduce(
      (sum, cat) => sum + (cat.subcategories?.length || 0),
      0
    ) || 0
  const totalPlans = recentPlans?.length || 0
  const totalIncome = config?.total_income || 0

  // Calculate default total expenses
  const defaultExpenses =
    categories?.reduce((sum, cat) => {
      return (
        sum +
        (cat.subcategories?.reduce(
          (catSum, sub) => catSum + sub.default_value,
          0
        ) || 0)
      )
    }, 0) || 0

  const defaultDeficit = totalIncome - defaultExpenses

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Budget Summary</h1>
          <p className="text-slate-600 mt-2">
            Overview of your budget configuration and activity
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Income"
            value={formatMln(totalIncome)}
            icon={DollarSign}
            color="#197790"
            description="Configured budget income"
          />
          <StatCard
            title="Categories"
            value={totalCategories.toString()}
            icon={FolderTree}
            color="#3b82f6"
            description={`${totalSubcategories} subcategories`}
          />
          <StatCard
            title="Saved Plans"
            value={totalPlans.toString()}
            icon={FileText}
            color="#8b5cf6"
            description="Community submissions"
          />
          <StatCard
            title="Default Deficit"
            value={formatMln(defaultDeficit)}
            icon={defaultDeficit >= 0 ? TrendingUp : TrendingDown}
            color={defaultDeficit >= 0 ? '#197790' : '#ef4444'}
            description="Without adjustments"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Budget Categories
              </h2>
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  Manage
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                        style={{ backgroundColor: category.color, fontFamily: 'FontAwesome' }}
                        dangerouslySetInnerHTML={{ __html: category.icon }}
                      />
                      <span className="font-medium text-slate-900">
                        {category.name}
                      </span>
                    </div>
                    <span className="text-sm text-slate-500">
                      {category.subcategories?.length || 0} subcategories
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 italic">
                  No categories configured
                </p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Recent Budget Plans
              </h2>
              <Link to="/plans">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {recentPlans && recentPlans.length > 0 ? (
                recentPlans.map((plan) => {
                  const date = new Date(plan.created_at || '')
                  const isDeficit = plan.deficit < 0

                  return (
                    <div
                      key={plan.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded"
                    >
                      <div>
                        {plan.user_name ? (
                          <p className="font-medium text-slate-900">
                            {plan.user_name}
                          </p>
                        ) : (
                          <p className="font-medium text-slate-500 italic">
                            Anonymous
                          </p>
                        )}
                        <p className="text-xs text-slate-500">
                          {date.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            'font-semibold text-sm',
                            isDeficit ? 'text-red-600' : 'text-primary'
                          )}
                        >
                          {formatMln(plan.deficit)}
                        </p>
                        <p className="text-xs text-slate-500">deficit</p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-slate-500 italic">
                  No budget plans submitted yet
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link to="/budget" className="block">
              <div className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-slate-600" />
                  <h3 className="font-medium text-slate-900">
                    Adjust Budget
                  </h3>
                </div>
                <p className="text-sm text-slate-600">
                  Create and save a new budget plan
                </p>
              </div>
            </Link>

            <Link to="/admin" className="block">
              <div className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <FolderTree className="w-5 h-5 text-slate-600" />
                  <h3 className="font-medium text-slate-900">
                    Manage Categories
                  </h3>
                </div>
                <p className="text-sm text-slate-600">
                  Edit budget categories and subcategories
                </p>
              </div>
            </Link>

            <Link to="/plans" className="block">
              <div className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-slate-600" />
                  <h3 className="font-medium text-slate-900">View Plans</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Browse all community budget submissions
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
