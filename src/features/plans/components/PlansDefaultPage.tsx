import { useState } from 'react'
import { Info, Users } from 'lucide-react'
import { useAggregatedPlansData } from '../hooks/useAggregatedPlansData'
import { formatNumber } from '../../../lib/formatters'
import '../../maktabim/components/MaktabimPageStyles.css'
import './PlansDefaultPageStyles.css'

export function PlansDefaultPage() {
  const { data, isLoading, error } = useAggregatedPlansData()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const formatMln = (value: number) => {
    return formatNumber(value / 1_000_000, 1)
  }

  if (isLoading) {
    return (
      <div className="plans-default-page">
        <div className="plans-default-loading">
          <div className="plans-default-spinner"></div>
          <p>Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="plans-default-page">
        <div className="plans-default-error">
          <p>Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="plans-default-page">
      {/* Navbar - Exact copy from HomePage */}
      <header className="maktabim-header">
        <div className="maktabim-header__container">
          <div className="maktabim-header__logo">
            <img src="/images/image-svg+xml-1.svg" alt="OpenBudget Logo" className="maktabim-header__logo-img" />
            <div className="maktabim-header__logo-text">
              <div className="maktabim-header__logo-title">OpenBudget</div>
              <div className="maktabim-header__logo-subtitle">O'zbekiston Respublikasi<br/>Ochiq Budjet Portali</div>
            </div>
          </div>
          <nav className="maktabim-header__nav">
            <a href="/" className="maktabim-header__nav-link">Портал</a>
            <a href="#" className="maktabim-header__nav-link">Бюджет тизими</a>
            <a href="#" className="maktabim-header__nav-link">Бюджет ижроси</a>
            <div
              className={`maktabim-header__nav-dropdown ${isDropdownOpen ? 'active' : ''}`}
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <span className="maktabim-header__nav-link maktabim-header__nav-link--dropdown">
                Фуқаролар бюджети
              </span>
              {isDropdownOpen && (
                <div className="maktabim-header__dropdown-menu">
                  <a href="/about" className="maktabim-header__dropdown-item">Тўғрисида</a>
                  <a href="/map-page" className="maktabim-header__dropdown-item">Таклиф киритиш</a>
                  <a href="/plans-default" className="maktabim-header__dropdown-item">Умумий натижалар</a>
                  <a href="/plans" className="maktabim-header__dropdown-item">Барча режалар</a>
                  <a href="/help" className="maktabim-header__dropdown-item">Ёрдам</a>
                </div>
              )}
            </div>
            <a href="#" className="maktabim-header__nav-link">
              Маҳалла бюджети
              <span className="maktabim-header__badge">New</span>
            </a>
            <a href="#" className="maktabim-header__nav-link">Ташаббусли бюджет</a>
          </nav>
        </div>
      </header>

      {/* Stats Card */}
      <div className="plans-default-stats">
        <div className="plans-default-stats__container">
          <div className="plans-default-stats-card">
            <div className="plans-default-stats-card__header">
              <Users size={20} className="plans-default-stats-card__header-icon" />
              <span className="plans-default-stats-card__header-text">Nashr qilgan Byudjet: {data.totalPlans}</span>
            </div>
            <div className="plans-default-stats-card__header">
              <Info size={20} className="plans-default-stats-card__header-icon" />
              <span className="plans-default-stats-card__header-text">Ishtirokchilar so'rovnomalari:</span>
            </div>
            <div className="plans-default-stats-card__sections">
              <div className="plans-default-stats-card__section">
                <div className="plans-default-stats-card__section-title">Yashash joyi:</div>
                <div className="plans-default-stats-card__items">
                  <div className="plans-default-stats-card__item">
                    <span className="plans-default-stats-card__item-label">Bizning shaharimiz:</span>
                    <span className="plans-default-stats-card__item-value">3</span>
                  </div>
                  <div className="plans-default-stats-card__item">
                    <span className="plans-default-stats-card__item-label">Boshqa mintaqa:</span>
                    <span className="plans-default-stats-card__item-value">1</span>
                  </div>
                </div>
              </div>
              <div className="plans-default-stats-card__section">
                <div className="plans-default-stats-card__section-title">Yoshi:</div>
                <div className="plans-default-stats-card__items">
                  <div className="plans-default-stats-card__item">
                    <span className="plans-default-stats-card__item-label">18 yoshgacha:</span>
                    <span className="plans-default-stats-card__item-value">2</span>
                  </div>
                  <div className="plans-default-stats-card__item">
                    <span className="plans-default-stats-card__item-label">18 dan 25 yoshgacha:</span>
                    <span className="plans-default-stats-card__item-value">1</span>
                  </div>
                  <div className="plans-default-stats-card__item">
                    <span className="plans-default-stats-card__item-label">40 dan 55 yoshgacha:</span>
                    <span className="plans-default-stats-card__item-value">1</span>
                  </div>
                </div>
              </div>
              <div className="plans-default-stats-card__section">
                <div className="plans-default-stats-card__section-title">Ta'lim:</div>
                <div className="plans-default-stats-card__items">
                  <div className="plans-default-stats-card__item">
                    <span className="plans-default-stats-card__item-label">To'liq bo'lmagan ixslamodmts:</span>
                    <span className="plans-default-stats-card__item-value">1</span>
                  </div>
                  <div className="plans-default-stats-card__item">
                    <span className="plans-default-stats-card__item-label">O'rta va o'rta ixslamodmts:</span>
                    <span className="plans-default-stats-card__item-value">2</span>
                  </div>
                  <div className="plans-default-stats-card__item">
                    <span className="plans-default-stats-card__item-label">Yuqoriroq, to'liq bo'lmagan yuqori:</span>
                    <span className="plans-default-stats-card__item-value">1</span>
                  </div>
                </div>
              </div>
              <div className="plans-default-stats-card__section">
                <div className="plans-default-stats-card__section-title">Ishlari:</div>
                <div className="plans-default-stats-card__items">
                  <div className="plans-default-stats-card__item">
                    <span className="plans-default-stats-card__item-label">Men shtat (munitsipaliati) tashkilotda ishlayman:</span>
                    <span className="plans-default-stats-card__item-value">1</span>
                  </div>
                  <div className="plans-default-stats-card__item">
                    <span className="plans-default-stats-card__item-label">Men nodavlat tashkilotda ishlayman:</span>
                    <span className="plans-default-stats-card__item-value">3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Summary Section */}
      <div className="plans-default-summary">
        <div className="plans-default-summary__container">
          <h2 className="plans-default-summary__title">Budjet tahrirlash natijalari</h2>

          <div className="plans-default-budget-cards">
            {/* Income Card */}
            <div className="plans-default-budget-card plans-default-budget-card--income">
              <div className="plans-default-budget-card__header">
                <h3 className="plans-default-budget-card__title">Daromadlar</h3>
              </div>
              <div className="plans-default-budget-card__original">
                <span className="plans-default-budget-card__value">{formatMln(data.originalIncome)}</span>
                <span className="plans-default-budget-card__currency">mlrd so'm</span>
              </div>
              <div className="plans-default-budget-card__proposed">
                <Users size={16} className="plans-default-budget-card__icon" />
                <span className="plans-default-budget-card__value">{formatMln(data.proposedIncome)}</span>
                <span className="plans-default-budget-card__currency">mlrd so'm</span>
                <span className="plans-default-budget-card__change">
                  ({data.incomeChange >= 0 ? '+' : ''}{((data.incomeChange / data.originalIncome) * 100).toFixed(2)}%)
                </span>
              </div>
            </div>

            {/* Expenses Card */}
            <div className="plans-default-budget-card plans-default-budget-card--expenses">
              <div className="plans-default-budget-card__header">
                <h3 className="plans-default-budget-card__title">Xarajatlar</h3>
              </div>
              <div className="plans-default-budget-card__original">
                <span className="plans-default-budget-card__value">{formatMln(data.originalExpenses)}</span>
                <span className="plans-default-budget-card__currency">mlrd so'm</span>
              </div>
              <div className="plans-default-budget-card__proposed">
                <Users size={16} className="plans-default-budget-card__icon" />
                <span className="plans-default-budget-card__value">{formatMln(data.proposedExpenses)}</span>
                <span className="plans-default-budget-card__currency">mlrd so'm</span>
                <span className="plans-default-budget-card__change">
                  ({data.expensesChange >= 0 ? '+' : ''}{((data.expensesChange / data.originalExpenses) * 100).toFixed(2)}%)
                </span>
              </div>
            </div>

            {/* Deficit Card */}
            <div className="plans-default-budget-card plans-default-budget-card--deficit">
              <div className="plans-default-budget-card__header">
                <h3 className="plans-default-budget-card__title">
                  {data.originalDeficit >= 0 ? 'Ortiqcha' : 'Defitsit'}
                </h3>
              </div>
              <div className="plans-default-budget-card__original">
                <span className="plans-default-budget-card__value">{formatMln(Math.abs(data.originalDeficit))}</span>
                <span className="plans-default-budget-card__currency">mlrd so'm</span>
              </div>
              <div className="plans-default-budget-card__proposed">
                <Users size={16} className="plans-default-budget-card__icon" />
                <span className="plans-default-budget-card__value">{formatMln(Math.abs(data.proposedDeficit))}</span>
                <span className="plans-default-budget-card__currency">mlrd so'm</span>
                <span className="plans-default-budget-card__change">
                  ({data.deficitChange >= 0 ? '+' : ''}{data.originalDeficit !== 0 ? ((data.deficitChange / Math.abs(data.originalDeficit)) * 100).toFixed(2) : '0.00'}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Table Section */}
      <div className="plans-default-categories">
        <div className="plans-default-categories__container">
          <table className="plans-default-table">
            <tbody>
              {data.categories.map((category) => (
                category.subcategories.map((subcat, index) => (
                  <tr key={subcat.subcategoryId} className="plans-default-table__row">
                    <td className="plans-default-table__cell plans-default-table__cell--category">
                      {index === 0 && (
                        <div className="plans-default-table__category-header">
                          <div
                            className="plans-default-table__category-icon"
                            style={{
                              backgroundColor: category.categoryColor,
                              fontFamily: 'FontAwesome',
                            }}
                            dangerouslySetInnerHTML={{ __html: category.categoryIcon }}
                          />
                          <span className="plans-default-table__category-name">{category.categoryName}</span>
                        </div>
                      )}
                      <div className="plans-default-table__subcat-name">{subcat.subcategoryName}</div>
                    </td>
                    <td className="plans-default-table__cell plans-default-table__cell--change">
                      <span style={{ color: subcat.percentChange >= 0 ? '#4caf50' : '#f44336' }}>
                        {subcat.percentChange >= 0 ? '+' : ''}{subcat.percentChange.toFixed(1)}%
                      </span>
                    </td>
                    <td className="plans-default-table__cell plans-default-table__cell--people">
                      <div className="plans-default-table__progress-container">
                        <div
                          className="plans-default-table__progress-bar"
                          style={{
                            width: `${Math.min(Math.abs(subcat.percentChange), 100)}%`,
                            background: subcat.percentChange >= 0 ? '#4caf50' : '#f44336',
                          }}
                        />
                        <div className="plans-default-table__participants">
                          <Users size={14} />
                          <span>{subcat.participantCount}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
