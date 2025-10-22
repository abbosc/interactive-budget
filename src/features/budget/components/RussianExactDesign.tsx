// Budget page with row-based category expansion
import { useState, useMemo, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { Info, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react'
import { NoUiSlider } from '../../../components/ui/NoUiSlider'
import { UserInfoDialog } from './UserInfoDialog'
import { useBudgetData } from '../hooks/useBudgetData'
import { useSaveBudgetPlan } from '../hooks/useSaveBudgetPlan'
import { useBudgetStore } from '../../../stores/budgetStore'
import { formatNumber } from '../../../lib/formatters'
import { useGridColumns } from '../../../lib/hooks/useMediaQuery'
import type { Category, Impact, ThresholdType } from '../../../types/budget'
import './RussianStyles.css'

export function RussianExactDesign() {
  const navigate = useNavigate()
  const { categories, config, isLoading, error } = useBudgetData()
  const saveBudgetPlan = useSaveBudgetPlan()
  const { changes, setChange, removeChange, clearChanges } = useBudgetStore()
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null)
  const gridColumns = useGridColumns()

  // Helper function to chunk array into rows
  const chunkArray = <T,>(array: T[], size: number): T[][] => {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  // Group categories into rows based on screen size
  const categoryRows = useMemo(() => {
    if (!categories) return []
    return chunkArray(categories, gridColumns)
  }, [categories, gridColumns])

  const toggleCategory = (categoryId: string) => {
    // Accordion behavior: close if already open, otherwise open and close others
    setExpandedCategoryId(prev => prev === categoryId ? null : categoryId)
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

  // Calculate totals with memoization (must be before early returns to follow Rules of Hooks)
  const totalExpenses = useMemo(() => {
    if (!categories) return 0
    return categories.reduce((sum, category) => {
      return (
        sum +
        (category.subcategories?.reduce((catSum, sub) => {
          const value = changes[sub.id] ?? sub.default_value
          return catSum + value
        }, 0) || 0)
      )
    }, 0)
  }, [categories, changes])

  const deficit = useMemo(() => {
    if (!config) return 0
    return config.total_income - totalExpenses
  }, [config, totalExpenses])

  if (isLoading || error || !categories || !config) {
    return (
      <div className="russian-page russian-loading">
        <div className="text-white text-xl">Yuklanmoqda...</div>
      </div>
    )
  }

  const hasChanges = Object.keys(changes).length > 0

  // Format to millions with European style (space separator, comma decimal)
  const formatMillions = (value: number) => {
    const millions = value / 1_000_000
    return formatNumber(millions, 1)
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

  return (
    <div className="russian-page">
      {/* Header */}
      <header className="russian-header">
        <div className="russian-header__content">
          <div className="russian-header__title">
            <div className="russian-header__main-title">Fuqarolar uchun interaktiv byudjet</div>
            <div className="russian-header__subtitle">Andijon viloyati Andijon shahri shahar okrugi</div>
          </div>
        </div>
      </header>

      {/* Top Budget Summary Boxes */}
      <div className="russian-total-budget">
        <div className="russian-total-budget__content">
          <div className="russian-total-budget__box russian-total-budget__box--income">
            <button className="russian-total-budget__info-btn">
              <Info size={18} />
            </button>
            <div className="russian-total-budget__title">Daromadlar</div>
            <div className="russian-total-budget__sum">
              {formatMillions(config.total_income)}
              <span className="russian-total-budget__currency"> mlrd so'm</span>
            </div>
          </div>

          <div className="russian-total-budget__box russian-total-budget__box--expenses">
            <button className="russian-total-budget__info-btn">
              <Info size={18} />
            </button>
            <div className="russian-total-budget__title">Xarajatlar</div>
            <div className="russian-total-budget__sum">
              {formatMillions(totalExpenses)}
              <span className="russian-total-budget__currency"> mlrd so'm</span>
            </div>
          </div>

          <div className="russian-total-budget__box russian-total-budget__box--deficit">
            <button className="russian-total-budget__info-btn">
              <Info size={18} />
            </button>
            <div className="russian-total-budget__title">
              {deficit >= 0 ? 'Ortiqcha:' : 'Kamomad:'}
            </div>
            <div className="russian-total-budget__sum">
              {formatMillions(Math.abs(deficit))}
              <span className="russian-total-budget__currency"> mlrd so'm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="russian-content">
        <div className="russian-content__wrapper">
          <h1 className="russian-content__title">O'zgartirish Xarajatlar</h1>

          {/* Category Cards Grid */}
          <div className="russian-spending-layout">
            {categoryRows.map((row, rowIndex) => {
              // Find expanded category in this row
              const expandedCategory = row.find(cat => cat.id === expandedCategoryId)

              return (
                <Fragment key={`row-${rowIndex}`}>
                  {/* Render all category cards in this row */}
                  {row.map((category) => {
                    const categoryTotal = category.subcategories?.reduce((sum, sub) => {
                      const value = changes[sub.id] ?? sub.default_value
                      return sum + value
                    }, 0) || 0

                    const categoryDefault = category.subcategories?.reduce(
                      (sum, sub) => sum + sub.default_value,
                      0
                    ) || 0

                    const categoryChange = categoryTotal - categoryDefault
                    const percentage = totalExpenses > 0 ? (categoryTotal / totalExpenses) * 100 : 0
                    const isExpanded = category.id === expandedCategoryId

                    return (
                      <div key={category.id} className={`russian-spending ${isExpanded ? 'russian-spending--expanded' : ''}`}>
                        <div className="russian-spending__inner">
                          {/* Category Header */}
                          <div className="russian-spending__group">
                            <div className="russian-spending__title">
                              <span
                                className="russian-spending__icon"
                                style={{
                                  backgroundColor: category.color,
                                  fontFamily: 'FontAwesome',
                                }}
                                dangerouslySetInnerHTML={{ __html: category.icon }}
                              />
                              <span className="russian-spending__title-text">{category.name}</span>
                            </div>

                            <div className="russian-spending__sum">
                              {formatMillions(categoryTotal)} <span className="russian-spending__currency">mlrd so'm</span>
                            </div>

                            {/* Percentage Progress Bar */}
                            <div className="russian-percentages-view">
                              <div
                                className="russian-percentages-view__bar"
                                style={{
                                  backgroundColor: `${category.color}4f`,
                                }}
                              >
                                <span
                                  className="russian-percentages-view__fill"
                                  style={{
                                    width: `${Math.min(percentage, 100)}%`,
                                    backgroundColor: category.color,
                                  }}
                                >
                                  <span className="russian-percentages-view__percentage">
                                    {formatNumber(percentage, 1)}%
                                  </span>
                                  <span className="russian-percentages-view__delta">
                                    {Math.abs(categoryChange) > 1000 && (
                                      categoryChange > 0 ? `+${formatMillions(categoryChange)}` : `${formatMillions(categoryChange)}`
                                    )}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Budget Info - Always reserve space, show text only when there's a change */}
                          <div className="russian-spending__group russian-spending__sum-description-block">
                            {Math.abs(categoryChange) > 1000 && (
                              <div className="russian-spending__sum-description">
                                <div className="russian-spending__sum-description-col">
                                  <span className="russian-spending__sum-description-title">
                                    Tasdiqlangan byudjetda:
                                  </span>
                                  <span>{formatMillions(categoryDefault)} mlrd so'm</span>
                                </div>
                                <div className="russian-spending__sum-description-col">
                                  <span className="russian-spending__sum-description-title">
                                    Kiritilgan o'zgarishlar:
                                  </span>
                                  <span>
                                    {categoryChange > 0 ? '+' : ''}
                                    {formatMillions(categoryChange)} mlrd so'm
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Expand Button */}
                          <div className="russian-spending__group russian-spending__button-block">
                            <button
                              className="russian-button"
                              onClick={() => toggleCategory(category.id)}
                            >
                              <ChevronDown
                                className={`russian-button__icon ${isExpanded ? 'russian-button__icon--rotated' : ''}`}
                                size={20}
                              />
                              <span className="russian-button__title">
                                Batafsil ma'lumot olish va o'zgartirish
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {/* Render subcategories panel after complete row if any category in row is expanded */}
                  {expandedCategory && (
                    <div key={`row-${rowIndex}-expanded`} className="russian-spending__sub-wrapper">
                      {/* Category Header in Subcategory Panel */}
                      <div className="russian-spending__sub-header" style={{ borderLeftColor: expandedCategory.color }}>
                        <span
                          className="russian-spending__icon russian-spending__icon--large"
                          style={{
                            backgroundColor: expandedCategory.color,
                            fontFamily: 'FontAwesome',
                          }}
                          dangerouslySetInnerHTML={{ __html: expandedCategory.icon }}
                        />
                        <h3 className="russian-spending__sub-header-title">{expandedCategory.name}</h3>
                      </div>
                      <ul>
                        {expandedCategory.subcategories?.map((subcategory) => {
                          const currentValue = changes[subcategory.id] ?? subcategory.default_value
                          const [min, max] = [
                            subcategory.default_value * 0.9,
                            subcategory.default_value * 1.1,
                          ]

                          return (
                            <li key={subcategory.id} className="russian-spending__sub">
                              <div className="russian-spending__name-wrapper">
                                <div className="russian-spending__title russian-spending__title--small">
                                  <span
                                    className="russian-spending__icon"
                                    style={{
                                      color: expandedCategory.color,
                                      fontFamily: 'FontAwesome',
                                    }}
                                    dangerouslySetInnerHTML={{ __html: expandedCategory.icon }}
                                  />
                                  <span className="russian-spending__title-text">{expandedCategory.name}</span>
                                  <span className="russian-spending__title-slash">{'\u00A0/\u00A0'}</span>
                                  <span className="russian-spending__name">{subcategory.name}</span>
                                </div>
                              </div>

                              <div className="russian-spending__control">
                                <div className="russian-spending__resume">
                                  <div className="russian-spending__sum russian-spending__sum--slider">
                                    {formatMillions(currentValue)} mlrd so'm
                                  </div>
                                  <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                                    {(() => {
                                      const change = currentValue - subcategory.default_value
                                      const changeMln = change / 1_000_000
                                      if (Math.abs(changeMln) < 0.01) return 'O\'zgarish: 0 mlrd so\'m'
                                      const formatted = formatNumber(Math.abs(changeMln), 1)
                                      return change >= 0
                                        ? `O'zgarish: +${formatted} mlrd so'm`
                                        : `O'zgarish: −${formatted} mlrd so'm`
                                    })()}
                                  </div>
                                </div>

                                <div className="russian-spending__slider-wrapper">
                                  <NoUiSlider
                                    min={min}
                                    max={max}
                                    value={currentValue}
                                    defaultValue={subcategory.default_value}
                                    onChange={(value) => {
                                      const threshold = 1000 // 1000 som threshold
                                      // If value is within threshold from default, consider it as no change
                                      if (Math.abs(value - subcategory.default_value) < threshold) {
                                        removeChange(subcategory.id)
                                      } else {
                                        setChange(subcategory.id, value)
                                      }
                                    }}
                                    color={expandedCategory.color}
                                    step={1}
                                  />
                                </div>

                                {/* Impact Message */}
                                {(() => {
                                  const activeImpact = getActiveImpact(currentValue, subcategory.default_value, subcategory.impacts)
                                  if (!activeImpact) return null

                                  const isIncrease = activeImpact.threshold_type.startsWith('increase')
                                  const thresholdLabel = activeImpact.threshold_type === 'increase_7' ? '+7%' :
                                                        activeImpact.threshold_type === 'increase_3' ? '+3%' :
                                                        activeImpact.threshold_type === 'decrease_7' ? '-7%' : '-3%'

                                  return (
                                    <div
                                      className={`russian-spending__impact ${isIncrease ? 'russian-spending__impact--positive' : 'russian-spending__impact--negative'}`}
                                      style={{
                                        padding: '12px 16px',
                                        marginTop: '16px',
                                        borderRadius: '8px',
                                        backgroundColor: isIncrease ? '#e8f5e9' : '#ffebee',
                                        border: `1px solid ${isIncrease ? '#4caf50' : '#f44336'}`,
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                        {isIncrease ? (
                                          <TrendingUp size={20} style={{ color: '#4caf50', flexShrink: 0, marginTop: '2px' }} />
                                        ) : (
                                          <TrendingDown size={20} style={{ color: '#f44336', flexShrink: 0, marginTop: '2px' }} />
                                        )}
                                        <div style={{ flex: 1 }}>
                                          <div
                                            style={{
                                              fontSize: '13px',
                                              fontWeight: 600,
                                              color: isIncrease ? '#2e7d32' : '#c62828',
                                              marginBottom: '4px',
                                            }}
                                          >
                                            {thresholdLabel} natijasi:
                                          </div>
                                          <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.5' }}>
                                            {activeImpact.message}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })()}
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                </Fragment>
              )
            })}
          </div>

          {/* Bottom Action Buttons */}
          <div className="russian-actions">
            <button
              className="russian-actions__button russian-actions__button--primary"
              onClick={handleSave}
              disabled={!hasChanges}
            >
              <span className="russian-actions__button-icon">&#xf1d8;</span>
              <span className="russian-actions__button-title">
                Barcha o'zgarishlarni yuborish
              </span>
            </button>

            {hasChanges && (
              <button
                className="russian-actions__button russian-actions__button--reset"
                onClick={clearChanges}
              >
                <span className="russian-actions__button-icon">&#xf021;</span>
                <span className="russian-actions__button-title">
                  Barcha o'zgarishlarni bekor qilish
                </span>
              </button>
            )}
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
