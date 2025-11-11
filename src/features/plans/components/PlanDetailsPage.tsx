import { useParams, Link, useNavigate } from 'react-router-dom'
import { Fragment } from 'react'
import { ArrowLeft, Calendar, User, Briefcase, Info, TrendingUp, TrendingDown, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useBudgetPlan, useDeleteBudgetPlan } from '../hooks/useBudgetPlans'
import { useBudgetData } from '../../budget/hooks/useBudgetData'
import { formatNumber } from '../../../lib/formatters'
import type { Impact, ThresholdType } from '../../../types/budget'
import '../../budget/components/RussianStyles.css'

export function PlanDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: plan, isLoading: planLoading, error: planError } = useBudgetPlan(id!)
  const { categories, config, isLoading: dataLoading, error: dataError } = useBudgetData()
  const deletePlan = useDeleteBudgetPlan()

  const isLoading = planLoading || dataLoading
  const error = planError || dataError

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this budget plan?')) {
      deletePlan.mutate(id!, {
        onSuccess: () => {
          toast.success('Budget plan deleted successfully')
          navigate('/plans')
        },
        onError: (error) => {
          console.error('Delete error:', error)
          toast.error('Failed to delete budget plan')
        },
      })
    }
  }

  if (isLoading) {
    return (
      <div className="russian-page russian-loading">
        <div className="text-white text-xl">Yuklanmoqda...</div>
      </div>
    )
  }

  if (error || !plan || !categories || !config) {
    return (
      <div className="russian-page russian-loading">
        <div className="text-white text-xl">Xatolik yuz berdi</div>
        <button
          onClick={() => navigate('/plans')}
          className="mt-4 px-4 py-2 bg-white text-primary rounded-lg"
        >
          Orqaga qaytish
        </button>
      </div>
    )
  }

  // Format to millions with European style
  const formatMillions = (value: number) => {
    const millions = value / 1_000_000
    return formatNumber(millions, 1)
  }

  // Get the value for a subcategory (changed or default)
  const getSubcategoryValue = (subcategoryId: string, defaultValue: number) => {
    return plan.changes[subcategoryId] ?? defaultValue
  }

  // Get the active impact message based on current value
  const getActiveImpact = (currentValue: number, defaultValue: number, impacts?: Impact[]): Impact | null => {
    if (!impacts || impacts.length === 0) return null

    const changePercent = ((currentValue - defaultValue) / defaultValue) * 100

    let targetThreshold: ThresholdType | null = null

    if (changePercent >= 7) {
      targetThreshold = 'increase_7'
    } else if (changePercent >= 3) {
      targetThreshold = 'increase_3'
    } else if (changePercent <= -7) {
      targetThreshold = 'decrease_7'
    } else if (changePercent <= -3) {
      targetThreshold = 'decrease_3'
    }

    if (!targetThreshold) return null

    return impacts.find(impact => impact.threshold_type === targetThreshold) || null
  }

  const date = new Date(plan.created_at || '')

  return (
    <div className="russian-page">
      {/* Header */}
      <header className="russian-header">
        <div className="russian-header__content">
          <div className="flex justify-between items-start mb-4">
            <Link
              to="/plans"
              className="inline-flex items-center gap-2 text-white hover:opacity-80"
            >
              <ArrowLeft size={20} />
              <span>Orqaga qaytish</span>
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={deletePlan.isPending}
            >
              <Trash2 size={18} />
              <span>{deletePlan.isPending ? "O'chirilmoqda..." : "Rejani o'chirish"}</span>
            </button>
          </div>
          <div className="russian-header__title">
            <div className="russian-header__main-title">Byudjet rejasi tafsilotlari</div>
            <div className="russian-header__subtitle">
              {date.toLocaleDateString()} - {date.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </header>

      {/* User Info Section */}
      {(plan.user_name || plan.user_age || plan.user_occupation) && (
        <div className="bg-white/10 backdrop-blur-sm">
          <div className="max-w-[1200px] mx-auto px-5 py-6">
            <div className="flex flex-wrap gap-6 text-white">
              {plan.user_name && (
                <div className="flex items-center gap-2">
                  <User size={18} className="opacity-80" />
                  <span className="font-medium">{plan.user_name}</span>
                  {plan.user_age && <span className="opacity-80">({plan.user_age} yosh)</span>}
                </div>
              )}
              {plan.user_occupation && (
                <div className="flex items-center gap-2">
                  <Briefcase size={18} className="opacity-80" />
                  <span className="font-medium">{plan.user_occupation}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar size={18} className="opacity-80" />
                <span className="font-medium">
                  {Object.keys(plan.changes).length} ta o'zgarish kiritilgan
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Budget Summary Boxes */}
      <div className="russian-total-budget">
        <div className="russian-total-budget__content">
          <div className="russian-total-budget__box russian-total-budget__box--income">
            <button className="russian-total-budget__info-btn">
              <Info size={18} />
            </button>
            <div className="russian-total-budget__title">Daromadlar</div>
            <div className="russian-total-budget__sum">
              {formatMillions(plan.total_income)}
              <span className="russian-total-budget__currency"> mlrd so'm</span>
            </div>
          </div>

          <div className="russian-total-budget__box russian-total-budget__box--expenses">
            <button className="russian-total-budget__info-btn">
              <Info size={18} />
            </button>
            <div className="russian-total-budget__title">Xarajatlar</div>
            <div className="russian-total-budget__sum">
              {formatMillions(plan.total_expenses)}
              <span className="russian-total-budget__currency"> mlrd so'm</span>
            </div>
          </div>

          <div className="russian-total-budget__box russian-total-budget__box--deficit">
            <button className="russian-total-budget__info-btn">
              <Info size={18} />
            </button>
            <div className="russian-total-budget__title">
              {plan.deficit >= 0 ? 'Ortiqcha:' : 'Kamomad:'}
            </div>
            <div className="russian-total-budget__sum">
              {formatMillions(Math.abs(plan.deficit))}
              <span className="russian-total-budget__currency"> mlrd so'm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Categories */}
      <div className="russian-content">
        <div className="russian-content__wrapper">
          <h1 className="russian-content__title">Toifa bo'yicha xarajatlar</h1>

          {/* Categories List */}
          <div className="space-y-6">
            {categories.map((category) => {
              const categoryTotal = category.subcategories?.reduce((sum, sub) => {
                const value = getSubcategoryValue(sub.id, sub.default_value)
                return sum + value
              }, 0) || 0

              const categoryDefault = category.subcategories?.reduce(
                (sum, sub) => sum + sub.default_value,
                0
              ) || 0

              const categoryChange = categoryTotal - categoryDefault

              return (
                <div key={category.id} className="bg-white rounded-2xl shadow-lg p-6">
                  {/* Category Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <span
                        className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl"
                        style={{ backgroundColor: category.color, fontFamily: 'FontAwesome' }}
                        dangerouslySetInnerHTML={{ __html: category.icon }}
                      />
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">{category.name}</h2>
                        <p className="text-sm text-slate-500 mt-1">
                          {category.subcategories?.length || 0} ta subkategoriya
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-slate-900">
                        {formatMillions(categoryTotal)}{' '}
                        <span className="text-base font-normal text-slate-500">mlrd so'm</span>
                      </div>
                      {Math.abs(categoryChange) > 1000 && (
                        <div
                          className={`text-sm font-semibold mt-1 ${
                            categoryChange >= 0 ? 'text-primary' : 'text-red-600'
                          }`}
                        >
                          {categoryChange > 0 ? '+' : ''}
                          {formatMillions(categoryChange)} mlrd so'm
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subcategories Table */}
                  {category.subcategories && category.subcategories.length > 0 && (
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                      <table className="w-full">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Subkategoriya
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Tasdiqlangan
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Joriy qiymat
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                              O'zgarish
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                          {category.subcategories.map((subcategory) => {
                            const currentValue = getSubcategoryValue(
                              subcategory.id,
                              subcategory.default_value
                            )
                            const change = currentValue - subcategory.default_value
                            const hasChange = Math.abs(change) > 1000
                            const activeImpact = getActiveImpact(currentValue, subcategory.default_value, subcategory.impacts)

                            return (
                              <Fragment key={subcategory.id}>
                                <tr
                                  className={hasChange ? 'bg-primary-light/10' : ''}
                                >
                                  <td className="px-6 py-4">
                                    <div className="flex items-center">
                                      <span
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3 flex-shrink-0"
                                        style={{
                                          color: category.color,
                                          fontFamily: 'FontAwesome',
                                        }}
                                        dangerouslySetInnerHTML={{ __html: category.icon }}
                                      />
                                      <span className="text-sm font-medium text-slate-900 break-words">
                                        {subcategory.name}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-600">
                                    {formatMillions(subcategory.default_value)} mlrd
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <span className="text-sm font-semibold text-slate-900">
                                      {formatMillions(currentValue)} mlrd
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right">
                                    {hasChange ? (
                                      <span
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                                          change >= 0
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}
                                      >
                                        {change > 0 ? '+' : ''}
                                        {formatMillions(change)} mlrd
                                      </span>
                                    ) : (
                                      <span className="text-sm text-slate-400">—</span>
                                    )}
                                  </td>
                                </tr>
                                {activeImpact && (
                                  <tr key={`${subcategory.id}-impact`} className={hasChange ? 'bg-primary-light/10' : ''}>
                                    <td colSpan={4} className="px-6 py-4">
                                      <div
                                        style={{
                                          padding: '12px 16px',
                                          borderRadius: '8px',
                                          backgroundColor: activeImpact.threshold_type.startsWith('increase') ? '#e8f5e9' : '#ffebee',
                                          border: `1px solid ${activeImpact.threshold_type.startsWith('increase') ? '#4caf50' : '#f44336'}`,
                                        }}
                                      >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                          {activeImpact.threshold_type.startsWith('increase') ? (
                                            <TrendingUp size={20} style={{ color: '#4caf50', flexShrink: 0, marginTop: '2px' }} />
                                          ) : (
                                            <TrendingDown size={20} style={{ color: '#f44336', flexShrink: 0, marginTop: '2px' }} />
                                          )}
                                          <div style={{ flex: 1 }}>
                                            <div
                                              style={{
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                color: activeImpact.threshold_type.startsWith('increase') ? '#2e7d32' : '#c62828',
                                                marginBottom: '4px',
                                              }}
                                            >
                                              {activeImpact.threshold_type === 'increase_7' ? '+7%' :
                                               activeImpact.threshold_type === 'increase_3' ? '+3%' :
                                               activeImpact.threshold_type === 'decrease_7' ? '-7%' : '-3%'} natijasi:
                                            </div>
                                            <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.5' }}>
                                              {activeImpact.message}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </Fragment>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
