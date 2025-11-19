// Budget page with row-based category expansion
import { useState, useMemo, Fragment, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Info, ChevronDown, X, HelpCircle } from 'lucide-react'
import { NoUiSlider } from '../../../components/ui/NoUiSlider'
import { UserInfoDialog } from './UserInfoDialog'
import { useBudgetData } from '../hooks/useBudgetData'
import { useSaveBudgetPlan } from '../hooks/useSaveBudgetPlan'
import { useBudgetStore } from '../../../stores/budgetStore'
import { formatNumber } from '../../../lib/formatters'
import { useGridColumns } from '../../../lib/hooks/useMediaQuery'
import type { Impact, ThresholdType, Category } from '../../../types/budget'
import './RussianStyles.css'
import '../../region/components/RegionPageStyles.css'

// Helper to format millions
const formatMillions = (value: number) => {
  const millions = value / 1_000_000
  return formatNumber(millions, 1)
}

// Memoized CategoryCard component to prevent unnecessary re-renders
interface CategoryCardProps {
  category: Category
  changes: Record<string, number>
  expandedCategoryId: string | null
  totalExpenses: number
  toggleCategory: (id: string) => void
}

const CategoryCard = memo(({ category, changes, expandedCategoryId, totalExpenses, toggleCategory }: CategoryCardProps) => {
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
                  Tasdiqlangan budjetda:
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
})

CategoryCard.displayName = 'CategoryCard'

export function RussianExactDesign() {
  const navigate = useNavigate()
  const { categories, config, isLoading, error } = useBudgetData()
  const saveBudgetPlan = useSaveBudgetPlan()
  const { changes, setChange, removeChange, clearChanges } = useBudgetStore()
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [infoType, setInfoType] = useState<'income' | 'expenses' | 'deficit' | null>(null)
  const [showCategoryInfo, setShowCategoryInfo] = useState(false)
  const [categoryInfoData, setCategoryInfoData] = useState<{ title: string; description: string } | null>(null)
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

    // Round all numeric values to integers to avoid floating point precision issues
    const roundedChanges: Record<string, number> = {}
    Object.keys(changes).forEach(key => {
      roundedChanges[key] = Math.round(changes[key])
    })

    saveBudgetPlan.mutate(
      {
        budget_config_id: config.id,
        user_name: userInfo.name,
        user_age: userInfo.age,
        user_occupation: userInfo.occupation,
        changes: roundedChanges,
        total_income: Math.round(config.total_income),
        total_expenses: Math.round(totalExpenses),
        deficit: Math.round(deficit),
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

  // Handle info button click
  const handleInfoClick = (type: 'income' | 'expenses' | 'deficit') => {
    setInfoType(type)
    setShowInfoModal(true)
  }

  // Generate random budget breakdown data
  const getInfoModalData = () => {
    if (!infoType) return null

    switch (infoType) {
      case 'income':
        return {
          title: 'Даромадлар тафсилоти',
          items: [
            { name: 'Солиқ тушумлари', amount: Math.floor(config.total_income * 0.45), percent: '45%' },
            { name: 'Божхона йиғимлари', amount: Math.floor(config.total_income * 0.28), percent: '28%' },
            { name: 'Давлат мулки ижараси', amount: Math.floor(config.total_income * 0.15), percent: '15%' },
            { name: 'Бошқа даромадлар', amount: Math.floor(config.total_income * 0.12), percent: '12%' },
          ]
        }
      case 'expenses':
        return {
          title: 'Харажатлар тафсилоти',
          items: [
            { name: 'Таълим', amount: Math.floor(totalExpenses * 0.32), percent: '32%' },
            { name: 'Соғлиқни сақлаш', amount: Math.floor(totalExpenses * 0.26), percent: '26%' },
            { name: 'Инфратузилма', amount: Math.floor(totalExpenses * 0.22), percent: '22%' },
            { name: 'Ижтимоий ҳимоя', amount: Math.floor(totalExpenses * 0.20), percent: '20%' },
          ]
        }
      case 'deficit':
        return {
          title: 'Дефицит ёпиш манбалари',
          items: [
            { name: 'Ички қарзлар', amount: Math.floor(Math.abs(deficit) * 0.55), percent: '55%' },
            { name: 'Ташқи қарзлар', amount: Math.floor(Math.abs(deficit) * 0.30), percent: '30%' },
            { name: 'Грантлар', amount: Math.floor(Math.abs(deficit) * 0.15), percent: '15%' },
          ]
        }
      default:
        return null
    }
  }

  const modalData = getInfoModalData()

  // Handle category/subcategory info button click
  const handleCategoryInfoClick = (categoryName: string, subcategoryName?: string) => {
    const title = subcategoryName
      ? `${categoryName} / ${subcategoryName}`
      : categoryName

    const descriptions = [
      "Ushbu bo'lim mamlakatning umumiy boshqaruvi va xavfsizligini ta'minlashga qaratilgan.",
      "Ushbu xizmatlar aholining hayot sifatini oshirish va ijtimoiy himoya tizimini mustahkamlashga yo'naltirilgan.",
      "Mamlakatning iqtisodiy rivojlanishi va infratuzilmasini takomillashtirish maqsadida ajratilgan.",
      "Ta'lim va sog'liqni saqlash sohasidagi xizmatlar sifatini oshirish uchun mo'ljallangan.",
      "Madaniyat, sport va yoshlar siyosatini qo'llab-quvvatlash hamda rivojlantirish maqsadida ajratilgan.",
    ]

    const description = descriptions[Math.floor(Math.random() * descriptions.length)]

    setCategoryInfoData({ title, description })
    setShowCategoryInfo(true)
  }

  return (
    <div className="russian-page">
      {/* Navbar */}
      <header className="region-navbar">
        <div className="region-navbar__container">
          <div className="region-navbar__logo">
            <img src="/images/image-svg+xml-1.svg" alt="OpenBudget Logo" className="region-navbar__logo-img" />
            <div className="region-navbar__logo-text">
              <div className="region-navbar__logo-title">OpenBudget</div>
              <div className="region-navbar__logo-subtitle">O'zbekiston Respublikasi<br/>Ochiq Budjet Portali</div>
            </div>
          </div>
          <nav className="region-navbar__nav">
            <a href="/" className="region-navbar__nav-link">Портал</a>
            <a href="#" className="region-navbar__nav-link">Бюджет тизими</a>
            <a href="#" className="region-navbar__nav-link">Бюджет ижроси</a>
            <div
              className={`region-navbar__nav-dropdown ${isDropdownOpen ? 'active' : ''}`}
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <span className="region-navbar__nav-link region-navbar__nav-link--dropdown">
                Фуқаролар бюджети
              </span>
              {isDropdownOpen && (
                <div className="region-navbar__dropdown-menu">
                  <a href="/about" className="region-navbar__dropdown-item">Тўғрисида</a>
                  <a href="/map-page" className="region-navbar__dropdown-item">Таклиф киритиш</a>
                  <a href="/plans-default" className="region-navbar__dropdown-item">Натижалар</a>
                  <a href="/help" className="region-navbar__dropdown-item">Ёрдам</a>
                </div>
              )}
            </div>
            <a href="#" className="region-navbar__nav-link">
              Маҳалла бюджети
              <span className="region-navbar__badge">New</span>
            </a>
            <a href="#" className="region-navbar__nav-link">Ташаббусли бюджет</a>
          </nav>
        </div>
      </header>

      {/* Top Budget Summary Boxes */}
      <div className="russian-total-budget">
        <div className="russian-total-budget__content">
          <div className="russian-total-budget__box russian-total-budget__box--income">
            <button className="russian-total-budget__info-btn" onClick={() => handleInfoClick('income')}>
              <Info size={18} />
            </button>
            <div className="russian-total-budget__title">Daromadlar</div>
            <div className="russian-total-budget__sum">
              {formatMillions(config.total_income)}
              <span className="russian-total-budget__currency"> mlrd so'm</span>
            </div>
          </div>

          <div className="russian-total-budget__box russian-total-budget__box--expenses">
            <button className="russian-total-budget__info-btn" onClick={() => handleInfoClick('expenses')}>
              <Info size={18} />
            </button>
            <div className="russian-total-budget__title">Xarajatlar</div>
            <div className="russian-total-budget__sum">
              {formatMillions(totalExpenses)}
              <span className="russian-total-budget__currency"> mlrd so'm</span>
            </div>
          </div>

          <div className="russian-total-budget__box russian-total-budget__box--deficit">
            <button className="russian-total-budget__info-btn" onClick={() => handleInfoClick('deficit')}>
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
          <h1 className="russian-content__title">O'zgartirish</h1>

          {/* Category Cards Grid */}
          <div className="russian-spending-layout">
            {categoryRows.map((row, rowIndex) => {
              // Find expanded category in this row
              const expandedCategory = row.find(cat => cat.id === expandedCategoryId)

              return (
                <Fragment key={`row-${rowIndex}`}>
                  {/* Render all category cards in this row */}
                  {row.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      changes={changes}
                      expandedCategoryId={expandedCategoryId}
                      totalExpenses={totalExpenses}
                      toggleCategory={toggleCategory}
                    />
                  ))}

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
                        <button
                          className="russian-spending__category-info-btn"
                          onClick={() => handleCategoryInfoClick(expandedCategory.name)}
                          title="Ma'lumot olish"
                        >
                          <HelpCircle size={20} />
                        </button>
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
                                  <button
                                    className="russian-spending__subcategory-info-btn"
                                    onClick={() => handleCategoryInfoClick(expandedCategory.name, subcategory.name)}
                                    title="Ma'lumot olish"
                                  >
                                    <HelpCircle size={16} />
                                  </button>
                                </div>
                              </div>

                              <div className="russian-spending__control">
                                <div className="russian-spending__resume">
                                  <div className="russian-spending__sum russian-spending__sum--slider">
                                    {formatMillions(currentValue)} mlrd so'm
                                  </div>
                                </div>

                                {/* Impact Message - Column 2 */}
                                <div className="russian-spending__impact-wrapper">
                                  {(() => {
                                    const activeImpact = getActiveImpact(currentValue, subcategory.default_value, subcategory.impacts)
                                    if (!activeImpact) return null

                                    const isIncrease = activeImpact.threshold_type.startsWith('increase')

                                    return (
                                      <div
                                        style={{
                                          fontSize: '15px',
                                          color: isIncrease ? '#4caf50' : '#f44336',
                                          lineHeight: '1.5',
                                        }}
                                      >
                                        {activeImpact.message}
                                      </div>
                                    )
                                  })()}
                                </div>

                                <div className="russian-spending__slider-wrapper">
                                  <NoUiSlider
                                    min={min}
                                    max={max}
                                    value={currentValue}
                                    defaultValue={subcategory.default_value}
                                    onChange={(value) => {
                                      // Only update store when slider is released
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
                                  <div style={{ fontSize: '13px', color: '#666', marginTop: '8px', textAlign: 'center' }}>
                                    Tasdiqlangan summa: {formatMillions(subcategory.default_value)} mlrd so'm
                                  </div>
                                </div>
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

      {/* Info Modal */}
      {showInfoModal && modalData && (
        <div className="info-modal-overlay" onClick={() => setShowInfoModal(false)}>
          <div className="info-modal" onClick={(e) => e.stopPropagation()}>
            <div className="info-modal__header">
              <h3 className="info-modal__title">{modalData.title}</h3>
              <button className="info-modal__close" onClick={() => setShowInfoModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="info-modal__content">
              <div className="info-modal__list">
                {modalData.items.map((item, index) => (
                  <div key={index} className="info-modal__item">
                    <div className="info-modal__item-header">
                      <span className="info-modal__item-name">{item.name}</span>
                      <span className="info-modal__item-percent">{item.percent}</span>
                    </div>
                    <div className="info-modal__item-amount">{formatMillions(item.amount)} млрд сўм</div>
                    <div className="info-modal__item-bar">
                      <div
                        className="info-modal__item-bar-fill"
                        style={{ width: item.percent }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category/Subcategory Info Modal */}
      {showCategoryInfo && categoryInfoData && (
        <div className="info-modal-overlay" onClick={() => setShowCategoryInfo(false)}>
          <div className="info-modal" onClick={(e) => e.stopPropagation()}>
            <div className="info-modal__header">
              <h3 className="info-modal__title">{categoryInfoData.title}</h3>
              <button className="info-modal__close" onClick={() => setShowCategoryInfo(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="info-modal__content">
              <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
                {categoryInfoData.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
