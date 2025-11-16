import { useState } from 'react'
import './MaktabimPageStyles.css'

export function MaktabimPage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  return (
    <div className="maktabim-page">
      {/* Header */}
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
            <a href="#" className="maktabim-header__nav-link">Портал</a>
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

      {/* Main Content */}
      <main className="maktabim-main">
        <div className="maktabim-content">
          {/* Left Column - School illustration and title */}
          <div className="maktabim-left-column">
            <div className="maktabim-illustration">
              <img src="/images/image-png-1.png" alt="School Building" />
            </div>
            <div className="maktabim-title">
              <h1 className="maktabim-title__text">
                Mening maktabim<br />2025/2026
              </h1>
            </div>
          </div>

          {/* Right Column - Cards and button */}
          <div className="maktabim-right-column">
            <div className="maktabim-cards">
              <div className="maktabim-card">
                <img src="/images/image-png-2.png" alt="Coins" className="maktabim-card__icon" />
                <h3 className="maktabim-card__title">Loyiha haqida</h3>
              </div>

              <div className="maktabim-card">
                <img src="/images/image-png-3.png" alt="Notebook" className="maktabim-card__icon" />
                <h3 className="maktabim-card__title">Shartlar</h3>
              </div>

              <div className="maktabim-card">
                <img src="/images/image-png-4.png" alt="Trophy" className="maktabim-card__icon" />
                <h3 className="maktabim-card__title">Loyiha namunalari</h3>
              </div>

              <div className="maktabim-card">
                <img src="/images/image-png-5.png" alt="Phone" className="maktabim-card__icon" />
                <h3 className="maktabim-card__title">Tanlovda ishtirok etish</h3>
              </div>
            </div>

            <div className="maktabim-cta">
              <button className="maktabim-cta__button">
                ISHTIROK ETISH
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
