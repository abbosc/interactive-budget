import { useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Info, X } from 'lucide-react'
import { InteractiveDistrictMap } from './InteractiveDistrictMap'
import { useCategories } from '../../admin/hooks/useCategories'
import './RegionPageStyles.css'

// Tashkent City districts with their IDs from the SVG and static budget amounts
const TASHKENT_DISTRICTS = [
  { id: 'almazarskiy-rayon', name: 'Олмазор тумани', nameUz: 'Olmazor tumani', approved: 45, proposed: 58 },
  { id: 'chilonzarskiy-rayon', name: 'Чилонзор тумани', nameUz: 'Chilonzor tumani', approved: 52, proposed: 68 },
  { id: 'yashnabadskiy-rayon', name: 'Яшнобод тумани', nameUz: 'Yashnobod tumani', approved: 38, proposed: 49 },
  { id: 'mirabadskiy-rayon', name: 'Миробод тумани', nameUz: 'Mirobod tumani', approved: 48, proposed: 62 },
  { id: 'bektemirskiy-rayon', name: 'Бектемир тумани', nameUz: 'Bektemir tumani', approved: 42, proposed: 55 },
  { id: 'yakasarayskiy-rayon', name: 'Яккасарой тумани', nameUz: 'Yakkasaroy tumani', approved: 41, proposed: 52 },
  { id: 'uchtepinskiy-rayon', name: 'Учтепа тумани', nameUz: 'Uchtepa tumani', approved: 46, proposed: 61 },
  { id: 'shayhantaurskiy-rayon', name: 'Шайхонтоҳур тумани', nameUz: 'Shayxontohur tumani', approved: 39, proposed: 50 },
  { id: 'yunusabadskiy-rayon', name: 'Юнусобод тумани', nameUz: 'Yunusobod tumani', approved: 50, proposed: 66 },
  { id: 'mirzo-ulugbekskiy-rayon', name: 'Мирзо Улуғбек тумани', nameUz: "Mirzo Ulug'bek tumani", approved: 44, proposed: 59 },
  { id: 'sergely-rayon', name: 'Сергели тумани', nameUz: 'Sergeli tumani', approved: 47, proposed: 63 },
  { id: 'yangihayot-rayon', name: 'Янгиҳаёт тумани', nameUz: 'Yangihayot tumani', approved: 40, proposed: 53 },
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

export function RegionPage() {
  const { regionId: _regionId } = useParams<{ regionId: string }>()
  const navigate = useNavigate()
  const [, setSelectedDistrict] = useState<string | null>(null)
  const [, setHoveredDistrict] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<'districts' | 'sectors'>('districts')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [infoType, setInfoType] = useState<'income' | 'expenses' | 'deficit' | null>(null)
  const { data: categories, isLoading } = useCategories()

  // Use _regionId to display region-specific content (currently showing Tashkent as example)
  // TODO: Add region-specific maps for other regions

  // Calculate sorted districts with differences
  const sortedDistricts = useMemo(() => {
    const districtsWithDiff = TASHKENT_DISTRICTS.map(district => ({
      ...district,
      difference: district.proposed - district.approved
    }))
    return districtsWithDiff.sort((a, b) => b.difference - a.difference)
  }, [])

  const maxDifference = useMemo(() => {
    return Math.max(...sortedDistricts.map(d => d.difference))
  }, [sortedDistricts])

  const minDifference = useMemo(() => {
    return Math.min(...sortedDistricts.map(d => d.difference))
  }, [sortedDistricts])

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
        const approved = Math.floor(Math.random() * 30) + 50
        const proposed = approved - (Math.floor(Math.random() * 10) + 3) // 3-12 less
        return { ...cat, approved, proposed }
      } else {
        // Positive difference
        return {
          ...cat,
          approved: Math.floor(Math.random() * 30) + 50,
          proposed: Math.floor(Math.random() * 30) + 60
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

  const handleDistrictClick = useCallback((districtId: string) => {
    setSelectedDistrict(districtId)
    // Navigate to budget page for this district
    setTimeout(() => {
      navigate('/budget')
    }, 300)
  }, [navigate])

  const handleDistrictHover = useCallback((districtId: string | null) => {
    setHoveredDistrict(districtId)
  }, [])

  const handleBackClick = () => {
    navigate('/map-page')
  }

  // Calculate regional totals for Tashkent
  const regionalTotals = useMemo(() => {
    const totalApproved = TASHKENT_DISTRICTS.reduce((sum, district) => sum + district.approved, 0)
    const totalProposed = TASHKENT_DISTRICTS.reduce((sum, district) => sum + district.proposed, 0)
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
            { name: 'Солиқ тушумлари', amount: Math.floor(regionalTotals.totalApproved * 0.42), percent: '42%' },
            { name: 'Божхона йиғимлари', amount: Math.floor(regionalTotals.totalApproved * 0.25), percent: '25%' },
            { name: 'Давлат мулки ижараси', amount: Math.floor(regionalTotals.totalApproved * 0.18), percent: '18%' },
            { name: 'Бошқа даромадлар', amount: Math.floor(regionalTotals.totalApproved * 0.15), percent: '15%' },
          ]
        }
      case 'expenses':
        return {
          title: 'Харажатлар тафсилоти',
          items: [
            { name: 'Таълим', amount: Math.floor(regionalTotals.totalProposed * 0.30), percent: '30%' },
            { name: 'Соғлиқни сақлаш', amount: Math.floor(regionalTotals.totalProposed * 0.28), percent: '28%' },
            { name: 'Инфратузилма', amount: Math.floor(regionalTotals.totalProposed * 0.24), percent: '24%' },
            { name: 'Ижтимоий ҳимоя', amount: Math.floor(regionalTotals.totalProposed * 0.18), percent: '18%' },
          ]
        }
      case 'deficit':
        return {
          title: 'Дефицит ёпиш манбалари',
          items: [
            { name: 'Ички қарзлар', amount: Math.floor(Math.abs(regionalTotals.deficit) * 0.52), percent: '52%' },
            { name: 'Ташқи қарзлар', amount: Math.floor(Math.abs(regionalTotals.deficit) * 0.33), percent: '33%' },
            { name: 'Грантлар', amount: Math.floor(Math.abs(regionalTotals.deficit) * 0.15), percent: '15%' },
          ]
        }
      default:
        return null
    }
  }

  const modalData = getInfoModalData()

  return (
    <div className="region-page">
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

      {/* Page Header */}
      <header className="region-header">
        <div className="region-header__content">
          <button onClick={handleBackClick} className="region-back-button">
            <ArrowLeft size={20} />
            <span>Orqaga</span>
          </button>
          <h1 className="region-header__title">Тошкент шаҳри</h1>
          <p className="region-header__subtitle">
            Туман ёки шаҳар туманини танланг
          </p>
        </div>
      </header>

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
              <span className="budget-summary-card__value">{regionalTotals.totalApproved}</span>
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
              <span className="budget-summary-card__value">{regionalTotals.totalProposed}</span>
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
              <span className="budget-summary-card__value">{Math.abs(regionalTotals.deficit)}</span>
              <span className="budget-summary-card__currency">mlrd so'm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="region-content">
        <div className="region-content__wrapper">
          <div className="region-two-column">
            {/* Left Column - Budget Table */}
            <div className="region-table-column">
              <div className="budget-table-container">
                <h2 className="budget-table-title">Бюджет Маълумотлари</h2>

                {/* Tab Headers */}
                <div className="budget-table-tabs">
                  <button
                    className={`budget-tab ${activeView === 'districts' ? 'active' : ''}`}
                    onClick={() => setActiveView('districts')}
                  >
                    Туманлар бўйича
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
                    {activeView === 'districts' ? (
                      <table className="budget-table">
                        <thead>
                          <tr>
                            <th className="col-number">№</th>
                            <th className="col-name">Туман номи</th>
                            <th className="col-amount">Тасдиқланган</th>
                            <th className="col-amount">Таклиф етилйотган</th>
                            <th className="col-amount">Фарқ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedDistricts.map((district, index) => (
                            <tr
                              key={district.id}
                              onClick={() => handleDistrictClick(district.id)}
                              className="budget-table-row--clickable"
                              style={{ cursor: 'pointer' }}
                            >
                              <td className="col-number">{index + 1}</td>
                              <td className="col-name">{district.name}</td>
                              <td className="col-amount">{district.approved} млрд.</td>
                              <td className="col-amount">{district.proposed} млрд.</td>
                              <td
                                className="col-amount col-difference"
                                style={{
                                  backgroundColor: getDifferenceColor(district.difference, maxDifference, minDifference),
                                  color: '#1f2c40',
                                  fontWeight: '700'
                                }}
                              >
                                {district.difference > 0 ? '+' : ''}{district.difference}
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
                                <td className="col-name">{category.name}</td>
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
            <div className="region-map-column">
              <div className="region-map-container">
                <h2 className="region-map-section__title">Туманни танланг</h2>
                <InteractiveDistrictMap
                  onDistrictClick={handleDistrictClick}
                  onDistrictHover={handleDistrictHover}
                  districtsData={TASHKENT_DISTRICTS}
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
