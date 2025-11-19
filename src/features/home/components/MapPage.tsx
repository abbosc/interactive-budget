import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Info, X } from 'lucide-react'
import { InteractiveMap } from './InteractiveMap'
import { useCategories } from '../../admin/hooks/useCategories'
import './HomePageStyles.css'

// Uzbekistan regions with their codes and static budget amounts
const REGIONS = [
  { id: 'UZ-AN', name: 'Андижон', approved: 125, proposed: 148 },
  { id: 'UZ-BU', name: 'Бухоро', approved: 110, proposed: 132 },
  { id: 'UZ-FA', name: 'Фарғона', approved: 138, proposed: 145 },
  { id: 'UZ-JI', name: 'Жиззах', approved: 105, proposed: 128 },
  { id: 'UZ-NG', name: 'Наманган', approved: 118, proposed: 142 },
  { id: 'UZ-NW', name: 'Навоий', approved: 142, proposed: 151 },
  { id: 'UZ-QA', name: 'Қашқадарё', approved: 128, proposed: 147 },
  { id: 'UZ-QR', name: 'Қорақалпоғистон', approved: 115, proposed: 126 },
  { id: 'UZ-SA', name: 'Самарқанд', approved: 135, proposed: 149 },
  { id: 'UZ-SI', name: 'Сирдарё', approved: 108, proposed: 119 },
  { id: 'UZ-SU', name: 'Сурхондарё', approved: 112, proposed: 135 },
  { id: 'UZ-TK', name: 'Тошкент шаҳри', approved: 145, proposed: 168 },
  { id: 'UZ-TO', name: 'Тошкент вилояти', approved: 132, proposed: 155 },
  { id: 'UZ-XO', name: 'Хоразм', approved: 120, proposed: 138 },
]

// Helper function to get color based on difference value
const getDifferenceColor = (difference: number, maxDiff: number, minDiff: number) => {
  if (difference < 0) {
    // Red shades for negative differences
    const intensity = Math.abs(difference) / Math.abs(minDiff)
    return `hsl(0, ${70 + intensity * 30}%, ${85 - intensity * 20}%)`
  } else if (difference === 0) {
    return `hsl(0, 0%, 95%)`
  } else {
    // Green to yellow gradient for positive differences
    const ratio = difference / maxDiff
    const hue = 120 - (ratio * 60) // 120 (green) to 60 (yellow/orange)
    const saturation = 60 + (ratio * 30) // More saturation for higher values
    const lightness = 75 - (ratio * 15) // Darker for higher values
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }
}

export function MapPage() {
  const navigate = useNavigate()
  const [, setHoveredRegion] = useState<string | null>(null)
  const [, setSelectedRegion] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<'regions' | 'sectors'>('regions')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [infoType, setInfoType] = useState<'income' | 'expenses' | 'deficit' | null>(null)
  const { data: categories, isLoading } = useCategories()

  // Calculate sorted regions with differences
  const sortedRegions = useMemo(() => {
    const regionsWithDiff = REGIONS.map(region => ({
      ...region,
      difference: region.proposed - region.approved
    }))
    return regionsWithDiff.sort((a, b) => b.difference - a.difference)
  }, [])

  const maxDifference = useMemo(() => {
    return Math.max(...sortedRegions.map(r => r.difference))
  }, [sortedRegions])

  const minDifference = useMemo(() => {
    return Math.min(...sortedRegions.map(r => r.difference))
  }, [sortedRegions])

  // Calculate sorted categories with differences
  const sortedCategories = useMemo(() => {
    if (!categories) return []
    // Randomly select 2-4 categories to have negative differences
    const negativeCount = Math.floor(Math.random() * 3) + 2 // 2-4
    const negativeIndices = new Set<number>()
    while (negativeIndices.size < Math.min(negativeCount, categories.length)) {
      negativeIndices.add(Math.floor(Math.random() * categories.length))
    }

    const categoriesWithBudget = categories.map((cat, index) => {
      if (negativeIndices.has(index)) {
        // Negative difference: approved > proposed
        const approved = Math.floor(Math.random() * 50) + 100
        const proposed = approved - (Math.floor(Math.random() * 15) + 5) // 5-20 less
        return { ...cat, approved, proposed }
      } else {
        // Positive difference
        return {
          ...cat,
          approved: Math.floor(Math.random() * 50) + 100,
          proposed: Math.floor(Math.random() * 50) + 120
        }
      }
    })
    const withDiff = categoriesWithBudget.map(cat => ({
      ...cat,
      difference: cat.proposed - cat.approved
    }))
    return withDiff.sort((a, b) => b.difference - a.difference)
  }, [categories])

  const maxCategoryDifference = useMemo(() => {
    if (sortedCategories.length === 0) return 1
    return Math.max(...sortedCategories.map(c => c.difference))
  }, [sortedCategories])

  const minCategoryDifference = useMemo(() => {
    if (sortedCategories.length === 0) return 0
    return Math.min(...sortedCategories.map(c => c.difference))
  }, [sortedCategories])

  const handleRegionClick = useCallback((regionId: string) => {
    setSelectedRegion(regionId)
    setTimeout(() => {
      navigate(`/region/${regionId}`)
    }, 300)
  }, [navigate])

  const handleRegionHover = useCallback((regionId: string | null) => {
    setHoveredRegion(regionId)
  }, [])

  // Calculate country-level totals
  const countryTotals = useMemo(() => {
    const totalApproved = REGIONS.reduce((sum, region) => sum + region.approved, 0)
    const totalProposed = REGIONS.reduce((sum, region) => sum + region.proposed, 0)
    const deficit = totalApproved - totalProposed
    return { totalApproved, totalProposed, deficit }
  }, [])

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
            { name: 'Солиқ тушумлари', amount: Math.floor(countryTotals.totalApproved * 0.45), percent: '45%' },
            { name: 'Божхона йиғимлари', amount: Math.floor(countryTotals.totalApproved * 0.28), percent: '28%' },
            { name: 'Давлат мулки ижараси', amount: Math.floor(countryTotals.totalApproved * 0.15), percent: '15%' },
            { name: 'Бошқа даромадлар', amount: Math.floor(countryTotals.totalApproved * 0.12), percent: '12%' },
          ]
        }
      case 'expenses':
        return {
          title: 'Харажатлар тафсилоти',
          items: [
            { name: 'Таълим', amount: Math.floor(countryTotals.totalProposed * 0.32), percent: '32%' },
            { name: 'Соғлиқни сақлаш', amount: Math.floor(countryTotals.totalProposed * 0.26), percent: '26%' },
            { name: 'Инфратузилма', amount: Math.floor(countryTotals.totalProposed * 0.22), percent: '22%' },
            { name: 'Ижтимоий ҳимоя', amount: Math.floor(countryTotals.totalProposed * 0.20), percent: '20%' },
          ]
        }
      case 'deficit':
        return {
          title: 'Дефицит ёпиш манбалари',
          items: [
            { name: 'Ички қарзлар', amount: Math.floor(Math.abs(countryTotals.deficit) * 0.55), percent: '55%' },
            { name: 'Ташқи қарзлар', amount: Math.floor(Math.abs(countryTotals.deficit) * 0.30), percent: '30%' },
            { name: 'Грантлар', amount: Math.floor(Math.abs(countryTotals.deficit) * 0.15), percent: '15%' },
          ]
        }
      default:
        return null
    }
  }

  const modalData = getInfoModalData()

  return (
    <div className="home-page">
      {/* Navbar */}
      <header className="home-navbar">
        <div className="home-navbar__container">
          <div className="home-navbar__logo">
            <img src="/images/image-svg+xml-1.svg" alt="OpenBudget Logo" className="home-navbar__logo-img" />
            <div className="home-navbar__logo-text">
              <div className="home-navbar__logo-title">OpenBudget</div>
              <div className="home-navbar__logo-subtitle">O'zbekiston Respublikasi<br/>Ochiq Budjet Portali</div>
            </div>
          </div>
          <nav className="home-navbar__nav">
            <a href="/" className="home-navbar__nav-link">Портал</a>
            <a href="#" className="home-navbar__nav-link">Бюджет тизими</a>
            <a href="#" className="home-navbar__nav-link">Бюджет ижроси</a>
            <div
              className={`home-navbar__nav-dropdown ${isDropdownOpen ? 'active' : ''}`}
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <span className="home-navbar__nav-link home-navbar__nav-link--dropdown">
                Фуқаролар бюджети
              </span>
              {isDropdownOpen && (
                <div className="home-navbar__dropdown-menu">
                  <a href="/about" className="home-navbar__dropdown-item">Тўғрисида</a>
                  <a href="/map-page" className="home-navbar__dropdown-item">Таклиф киритиш</a>
                  <a href="/plans-default" className="home-navbar__dropdown-item">Умумий натижалар</a>
                  <a href="/plans" className="home-navbar__dropdown-item">Баъча режалар</a>
                  <a href="/help" className="home-navbar__dropdown-item">Ёрдам</a>
                </div>
              )}
            </div>
            <a href="#" className="home-navbar__nav-link">
              Маҳалла бюджети
              <span className="home-navbar__badge">New</span>
            </a>
            <a href="#" className="home-navbar__nav-link">Ташаббусли бюджет</a>
          </nav>
        </div>
      </header>

      {/* Page Title */}
      <div className="home-page-title">
        <h1 className="home-page-title__text">Фуқаролар Бюджети</h1>
        <p className="home-page-title__subtitle">
          Ҳудудингизни танланг ва таклифларингизни киритинг
        </p>
      </div>

      {/* Budget Summary Cards */}
      <div className="budget-summary-cards">
        <div className="budget-summary-cards__container">
          {/* Daromadlar (Income) */}
          <div className="budget-summary-card budget-summary-card--income">
            <div className="budget-summary-card__header">
              <h3 className="budget-summary-card__title">Daromadlar</h3>
              <button className="budget-summary-card__info-btn" onClick={() => handleInfoClick('income')}>
                <Info className="budget-summary-card__info-icon" />
              </button>
            </div>
            <div className="budget-summary-card__amount">
              <span className="budget-summary-card__value">{countryTotals.totalApproved}</span>
              <span className="budget-summary-card__currency">mlrd so'm</span>
            </div>
          </div>

          {/* Xarajatlar (Expenses) */}
          <div className="budget-summary-card budget-summary-card--expenses">
            <div className="budget-summary-card__header">
              <h3 className="budget-summary-card__title">Xarajatlar</h3>
              <button className="budget-summary-card__info-btn" onClick={() => handleInfoClick('expenses')}>
                <Info className="budget-summary-card__info-icon" />
              </button>
            </div>
            <div className="budget-summary-card__amount">
              <span className="budget-summary-card__value">{countryTotals.totalProposed}</span>
              <span className="budget-summary-card__currency">mlrd so'm</span>
            </div>
          </div>

          {/* Defitsit (Deficit) */}
          <div className="budget-summary-card budget-summary-card--deficit">
            <div className="budget-summary-card__header">
              <h3 className="budget-summary-card__title">Defitsit</h3>
              <button className="budget-summary-card__info-btn" onClick={() => handleInfoClick('deficit')}>
                <Info className="budget-summary-card__info-icon" />
              </button>
            </div>
            <div className="budget-summary-card__amount">
              <span className="budget-summary-card__value">{Math.abs(countryTotals.deficit)}</span>
              <span className="budget-summary-card__currency">mlrd so'm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <main className="home-content">
        <div className="home-content__wrapper">
          <div className="home-two-column">
            {/* Left Column - Budget Table */}
            <div className="home-table-column">
              <div className="budget-table-container">
                <h2 className="budget-table-title">Бюджет Маълумотлари</h2>

                {/* Tab Headers */}
                <div className="budget-table-tabs">
                  <button
                    className={`budget-tab ${activeView === 'regions' ? 'active' : ''}`}
                    onClick={() => setActiveView('regions')}
                  >
                    Вилоятлар бўйича
                  </button>
                  <button
                    className={`budget-tab ${activeView === 'sectors' ? 'active' : ''}`}
                    onClick={() => setActiveView('sectors')}
                  >
                    Соҳалар бўйича
                  </button>
                </div>

                {/* Table Content */}
                <div className="budget-table-section">
                  <div className="budget-table-wrapper">
                    {activeView === 'regions' ? (
                      <table className="budget-table">
                        <thead>
                          <tr>
                            <th className="col-number">№</th>
                            <th className="col-name">Вилоят номи</th>
                            <th className="col-amount">Тасдиқланган</th>
                            <th className="col-amount">Таклиф етилйотган</th>
                            <th className="col-amount">Фарқ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedRegions.map((region, index) => (
                            <tr
                              key={region.id}
                              onClick={() => handleRegionClick(region.id)}
                              className="budget-table-row--clickable"
                              style={{ cursor: 'pointer' }}
                            >
                              <td className="col-number">{index + 1}</td>
                              <td className="col-name">
                                {region.name}
                              </td>
                              <td className="col-amount">{region.approved} млрд.</td>
                              <td className="col-amount">{region.proposed} млрд.</td>
                              <td
                                className="col-amount col-difference"
                                style={{
                                  backgroundColor: getDifferenceColor(region.difference, maxDifference, minDifference),
                                  color: '#1f2c40',
                                  fontWeight: '700'
                                }}
                              >
                                {region.difference > 0 ? '+' : ''}{region.difference}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <table className="budget-table">
                        <thead>
                          <tr>
                            <th className="col-number">№</th>
                            <th className="col-name">Соҳа номи</th>
                            <th className="col-amount">Тасдиқланган</th>
                            <th className="col-amount">Таклиф етилйотган</th>
                            <th className="col-amount">Фарқ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {isLoading ? (
                            <tr>
                              <td colSpan={5} className="loading-cell">
                                <div className="loading-spinner"></div>
                                <span>Юкланмоқда...</span>
                              </td>
                            </tr>
                          ) : (
                            sortedCategories.map((category, index) => (
                              <tr key={category.id}>
                                <td className="col-number">{index + 1}</td>
                                <td className="col-name">
                                  {category.name}
                                </td>
                                <td className="col-amount">{category.approved} млрд.</td>
                                <td className="col-amount">{category.proposed} млрд.</td>
                                <td
                                  className="col-amount col-difference"
                                  style={{
                                    backgroundColor: getDifferenceColor(category.difference, maxCategoryDifference, minCategoryDifference),
                                    color: '#1f2c40',
                                    fontWeight: '700'
                                  }}
                                >
                                  {category.difference > 0 ? '+' : ''}{category.difference}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Interactive Map */}
            <div className="home-map-column">
              <div className="home-map-container">
                <h2 className="home-map-section__title">Ҳудудни танланг</h2>
                <InteractiveMap
                  onRegionClick={handleRegionClick}
                  onRegionHover={handleRegionHover}
                  regionsData={REGIONS}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

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
                    <div className="info-modal__item-amount">{item.amount} млрд сўм</div>
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
    </div>
  )
}
