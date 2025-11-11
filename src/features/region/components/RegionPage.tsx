import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { InteractiveDistrictMap } from './InteractiveDistrictMap'
import './RegionPageStyles.css'

// Tashkent City districts with their IDs from the SVG
const TASHKENT_DISTRICTS = [
  { id: 'almazarskiy-rayon', name: 'Алмазарский район', nameUz: 'Olmazor tumani' },
  { id: 'chilonzarskiy-rayon', name: 'Чиланзарский район', nameUz: 'Chilonzor tumani' },
  { id: 'yashnabadskiy-rayon', name: 'Яшнабадский район', nameUz: 'Yashnobod tumani' },
  { id: 'mirabadskiy-rayon', name: 'Мирабадский район', nameUz: 'Mirobod tumani' },
  { id: 'bektemirskiy-rayon', name: 'Бектемирский район', nameUz: 'Bektemir tumani' },
  { id: 'yakasarayskiy-rayon', name: 'Яккасарайский район', nameUz: 'Yakkasaroy tumani' },
  { id: 'uchtepinskiy-rayon', name: 'Учтепинский район', nameUz: 'Uchtepa tumani' },
  { id: 'shayhantaurskiy-rayon', name: 'Шайхантахурский район', nameUz: 'Shayxontohur tumani' },
  { id: 'yunusabadskiy-rayon', name: 'Юнусабадский район', nameUz: 'Yunusobod tumani' },
  { id: 'mirzo-ulugbekskiy-rayon', name: 'Мирзо-Улугбекский район', nameUz: "Mirzo Ulug'bek tumani" },
  { id: 'sergely-rayon', name: 'Сергелийский район', nameUz: 'Sergeli tumani' },
  { id: 'yangihayot-rayon', name: 'Янгихаётский район', nameUz: 'Yangihayot tumani' },
]

export function RegionPage() {
  const { regionId: _regionId } = useParams<{ regionId: string }>()
  const navigate = useNavigate()
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null)

  // Use _regionId to display region-specific content (currently showing Tashkent as example)
  // TODO: Add region-specific maps for other regions

  const handleDistrictClick = (districtId: string) => {
    setSelectedDistrict(districtId)
    // Navigate to budget page for this district
    setTimeout(() => {
      navigate('/budget')
    }, 300)
  }

  const handleBackClick = () => {
    navigate('/')
  }

  const getDistrictInfo = (districtId: string) => {
    return TASHKENT_DISTRICTS.find(d => d.id === districtId)
  }

  return (
    <div className="region-page">
      {/* Header */}
      <header className="region-header">
        <div className="region-header__content">
          <button onClick={handleBackClick} className="region-back-button">
            <ArrowLeft size={20} />
            <span>Orqaga</span>
          </button>
          <h1 className="region-header__title">Toshkent shahri</h1>
          <p className="region-header__subtitle">
            Tuman yoki shahar tumanini tanlang
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="region-content">
        <div className="region-content__wrapper">
          {/* District Map */}
          <div className="region-map-section">
            <div className="region-map-container">
              <InteractiveDistrictMap
                onDistrictClick={handleDistrictClick}
                onDistrictHover={setHoveredDistrict}
              />

              {/* Tooltip */}
              {hoveredDistrict && (
                <div className="home-map-tooltip">
                  {getDistrictInfo(hoveredDistrict)?.nameUz}
                </div>
              )}
            </div>
          </div>

          {/* Districts List */}
          <div className="region-districts-section">
            <h2 className="region-districts-section__title">
              Tumanlar ro'yxati:
            </h2>
            <div className="region-districts-grid">
              {TASHKENT_DISTRICTS.map((district) => (
                <button
                  key={district.id}
                  onClick={() => handleDistrictClick(district.id)}
                  className={`region-district-card ${
                    selectedDistrict === district.id ? 'selected' : ''
                  }`}
                >
                  <div className="region-district-card__name">
                    {district.nameUz}
                  </div>
                  <div className="region-district-card__name-en">
                    {district.name}
                  </div>
                  <div className="region-district-card__arrow">→</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="region-footer">
        <p>© 2024 O'zbekiston Respublikasi Moliya Vazirligi</p>
      </footer>
    </div>
  )
}
