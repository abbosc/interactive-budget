import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Info, Download, Send, ChevronRight } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { NoUiSlider } from '../../../components/ui/NoUiSlider'
import { UserInfoDialog } from './UserInfoDialog'
import { useBudgetData } from '../hooks/useBudgetData'
import { useSaveBudgetPlan } from '../hooks/useSaveBudgetPlan'
import { useBudgetStore } from '../../../stores/budgetStore'
import { formatNumber } from '../../../lib/formatters'

export function RussianStyleBudgetPage() {
  const navigate = useNavigate()
  const { categories, config, isLoading, error } = useBudgetData()
  const saveBudgetPlan = useSaveBudgetPlan()
  const { changes, setChange, clearChanges } = useBudgetStore()
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

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

  if (isLoading || error || !categories || !config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 flex items-center justify-center">
        <div className="text-white text-xl">Yuklanmoqda...</div>
      </div>
    )
  }

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
  const hasChanges = Object.keys(changes).length > 0

  // Format to billions with comma decimal
  const formatBillions = (value: number) => {
    const billions = value / 1_000_000_000
    return formatNumber(billions, 3)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Top Summary Boxes */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {/* Income */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium opacity-90">Daromadlar</h3>
              <button className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <Info className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {formatBillions(config.total_income)}
              </span>
              <span className="text-lg opacity-90">mlrd so'm</span>
            </div>
          </div>

          {/* Expenses */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium opacity-90">Xarajatlar</h3>
              <button className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <Info className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {formatBillions(totalExpenses)}
              </span>
              <span className="text-lg opacity-90">mlrd so'm</span>
            </div>
          </div>

          {/* Deficit */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium opacity-90">Defitsit</h3>
              <button className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <Info className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {formatBillions(Math.abs(deficit))}
              </span>
              <span className="text-lg opacity-90">mlrd so'm</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-white text-2xl font-bold mb-6">Xarajatlarni o'zgartirish</h2>

        {/* Category Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {categories.map((category) => {
            const categoryTotal = category.subcategories?.reduce((sum, sub) => {
              const value = changes[sub.id] ?? sub.default_value
              return sum + value
            }, 0) || 0

            const categoryDefault = category.subcategories?.reduce(
              (sum, sub) => sum + sub.default_value,
              0
            ) || 0

            const percentage = categoryDefault > 0
              ? (categoryTotal / categoryDefault) * 100
              : 100

            const isExpanded = expandedCategory === category.id

            return (
              <div
                key={category.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
              >
                <div className="p-6">
                  {/* Icon and Title */}
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl shadow-md"
                      style={{
                        background: `linear-gradient(135deg, ${category.color} 0%, ${category.color}dd 100%)`,
                        fontFamily: 'FontAwesome',
                      }}
                      dangerouslySetInnerHTML={{ __html: category.icon }}
                    />
                    <h3 className="text-lg font-semibold text-slate-800 flex-1">
                      {category.name}
                    </h3>
                  </div>

                  {/* Amount */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-slate-900">
                        {formatBillions(categoryTotal)}
                      </span>
                      <span className="text-sm text-slate-500">mlrd so'm</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: category.color,
                        }}
                      />
                    </div>
                  </div>

                  {/* Expand Button */}
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
                  >
                    <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    Tafsilotlarni o'zgartirish
                  </button>
                </div>

                {/* Expanded Subcategories */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50 p-6 animate-fade-in">
                    <div className="space-y-6">
                      {category.subcategories?.map((subcategory) => {
                        const currentValue = changes[subcategory.id] ?? subcategory.default_value
                        const [min, max] = [
                          subcategory.default_value * 0.9,
                          subcategory.default_value * 1.1,
                        ]

                        return (
                          <div key={subcategory.id} className="bg-white p-4 rounded-lg border border-slate-200">
                            <div className="mb-2">
                              <h4 className="font-medium text-slate-800 mb-1">
                                {subcategory.name}
                              </h4>
                              <div className="flex items-baseline gap-2">
                                <span className="text-xl font-bold text-slate-900">
                                  {formatBillions(currentValue)}
                                </span>
                                <span className="text-xs text-slate-500">mlrd so'm</span>
                              </div>
                            </div>

                            <NoUiSlider
                              min={min}
                              max={max}
                              value={currentValue}
                              defaultValue={subcategory.default_value}
                              onChange={(value) => setChange(subcategory.id, value)}
                              color={category.color}
                              step={subcategory.default_value * 0.001}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 mr-2" />
            Barcha o'zgarishlarni yuborish
          </Button>
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
