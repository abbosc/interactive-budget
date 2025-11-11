import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InteractiveMap } from './InteractiveMap'
import './HomePageStyles.css'

// Uzbekistan regions with their codes
const REGIONS = [
  { id: 'UZ-AN', name: 'Andijon', nameEn: 'Andijan' },
  { id: 'UZ-BU', name: 'Buxoro', nameEn: 'Bukhara' },
  { id: 'UZ-FA', name: "Farg'ona", nameEn: 'Fergana' },
  { id: 'UZ-JI', name: 'Jizzax', nameEn: 'Jizzakh' },
  { id: 'UZ-NG', name: 'Namangan', nameEn: 'Namangan' },
  { id: 'UZ-NW', name: 'Navoiy', nameEn: 'Navoiy' },
  { id: 'UZ-QA', name: 'Qashqadaryo', nameEn: 'Kashkadarya' },
  { id: 'UZ-QR', name: "Qoraqalpog'iston", nameEn: 'Karakalpakstan' },
  { id: 'UZ-SA', name: 'Samarqand', nameEn: 'Samarkand' },
  { id: 'UZ-SI', name: 'Sirdaryo', nameEn: 'Sirdarya' },
  { id: 'UZ-SU', name: 'Surxondaryo', nameEn: 'Surkhandarya' },
  { id: 'UZ-TK', name: 'Toshkent City', nameEn: 'Tashkent City' },
  { id: 'UZ-TO', name: 'Toshkent', nameEn: 'Tashkent Region' },
  { id: 'UZ-XO', name: 'Xorazm', nameEn: 'Khorezm' },
]

export function HomePage() {
  const navigate = useNavigate()
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  const handleRegionClick = (regionId: string) => {
    setSelectedRegion(regionId)
    // For now, we'll navigate to a Tashkent example
    // You can add region-specific routes later
    setTimeout(() => {
      navigate(`/region/${regionId}`)
    }, 300)
  }

  const getRegionInfo = (regionId: string) => {
    return REGIONS.find(r => r.id === regionId)
  }

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <div className="home-header__content">
          <h1 className="home-header__title">O'zbekiston Byudjeti</h1>
          <p className="home-header__subtitle">
            Hududingiz byudjetini ko'ring va takliflar bering
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="home-content">
        <div className="home-content__wrapper">
          <div className="home-map-section">
            <h2 className="home-map-section__title">Hududingizni tanlang</h2>
            <p className="home-map-section__description">
              Xaritada o'z hududingizni bosing
            </p>

            {/* Map Container */}
            <div className="home-map-container">
              <InteractiveMap
                onRegionClick={handleRegionClick}
                onRegionHover={setHoveredRegion}
              />

              {/* Tooltip */}
              {hoveredRegion && (
                <div className="home-map-tooltip">
                  {getRegionInfo(hoveredRegion)?.name}
                </div>
              )}
            </div>

            {/* Region List (Alternative to map) */}
            <div className="home-regions-list">
              <h3 className="home-regions-list__title">
                Yoki ro'yxatdan tanlang:
              </h3>
              <div className="home-regions-grid">
                {REGIONS.map((region) => (
                  <button
                    key={region.id}
                    onClick={() => handleRegionClick(region.id)}
                    className={`home-region-card ${
                      selectedRegion === region.id ? 'selected' : ''
                    }`}
                  >
                    <div className="home-region-card__name">{region.name}</div>
                    <div className="home-region-card__name-en">
                      {region.nameEn}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <p>© 2024 O'zbekiston Respublikasi Moliya Vazirligi</p>
      </footer>
    </div>
  )
}
