import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Info, Users, Target, Award } from 'lucide-react'
import './AboutPageStyles.css'

export function AboutPage() {
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  return (
    <div className="about-page">
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
                  <a href="/plans" className="region-navbar__dropdown-item">Натижалар</a>
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

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero__content">
          <h1 className="about-hero__title">Фуқаролар бюджети ҳақида</h1>
          <p className="about-hero__subtitle">
            Очиқлик, шаффофлик ва фуқароларнинг иштирокчилиги орқали давлат бюджетини шакллантириш
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="about-content">
        <div className="about-content__wrapper">
          {/* Introduction Section */}
          <section className="about-section">
            <div className="about-intro">
              <h2 className="about-section__title">Фуқаролар бюджети нима?</h2>
              <p className="about-intro__text">
                Фуқаролар бюджети - бу давлат бюджетини шакллантиришда фуқароларнинг бевосита иштирок етишларини
                таъминлайдиган замонавий демократик механизмдир. Ушбу платформа орқали сиз ўз ҳудудингиз учун
                муҳим бўлган соҳаларга бюджет маблағларини қандай тақсимлашни таклиф қилишингиз мумкин.
              </p>
              <p className="about-intro__text">
                Бизнинг мақсадимиз - давлат бюджети жараёнларини очиқ ва шаффоф қилиш, ҳар бир фуқарога
                ўз фикрини билдириш имкониятини бериш ва жамоа манфаатларини ҳисобга олган ҳолда қарорлар
                қабул қилишдир.
              </p>
            </div>
          </section>

          {/* Features Grid */}
          <section className="about-section">
            <h2 className="about-section__title">Асосий имкониятлар</h2>
            <div className="about-features">
              <div className="about-feature-card">
                <div className="about-feature-card__icon" style={{ background: '#35bfdc' }}>
                  <Info size={32} />
                </div>
                <h3 className="about-feature-card__title">Очиқлик ва шаффофлик</h3>
                <p className="about-feature-card__text">
                  Давлат бюджети ҳақида тўлиқ ва тушунарли маълумотлар. Барча маълумотлар очиқ ва
                  фуқаролар учун қулай форматда тақдим етилади.
                </p>
              </div>

              <div className="about-feature-card">
                <div className="about-feature-card__icon" style={{ background: '#28a745' }}>
                  <Users size={32} />
                </div>
                <h3 className="about-feature-card__title">Фуқароларнинг иштироки</h3>
                <p className="about-feature-card__text">
                  Ҳар бир фуқаро ўз ҳудуди учун бюджет тақсимотига доир таклифларини билдириш
                  имкониятига ега.
                </p>
              </div>

              <div className="about-feature-card">
                <div className="about-feature-card__icon" style={{ background: '#d33b52' }}>
                  <Target size={32} />
                </div>
                <h3 className="about-feature-card__title">Аниқ мақсадлар</h3>
                <p className="about-feature-card__text">
                  Бюджет маблағларининг қайси соҳаларга ва қандай мақсадларда ишлатилишини
                  кўриш ва таҳлил қилиш имкони.
                </p>
              </div>

              <div className="about-feature-card">
                <div className="about-feature-card__icon" style={{ background: '#ff9800' }}>
                  <Award size={32} />
                </div>
                <h3 className="about-feature-card__title">Самарадорлик</h3>
                <p className="about-feature-card__text">
                  Фуқаролар фикрини ҳисобга олган ҳолда қабул қилинган қарорлар янада самарали
                  ва жамият эҳтиёжларига мос келади.
                </p>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="about-section">
            <h2 className="about-section__title">Қандай ишлайди?</h2>
            <div className="about-steps">
              <div className="about-step">
                <div className="about-step__number">1</div>
                <div className="about-step__content">
                  <h3 className="about-step__title">Ҳудудни танланг</h3>
                  <p className="about-step__text">
                    Харитадан ўз вилоятингиз ёки шаҳрингизни танланг
                  </p>
                </div>
              </div>

              <div className="about-step">
                <div className="about-step__number">2</div>
                <div className="about-step__content">
                  <h3 className="about-step__title">Бюджетни кўриб чиқинг</h3>
                  <p className="about-step__text">
                    Жорий бюджет тақсимоти ва соҳалар бўйича маълумотларни ўрганинг
                  </p>
                </div>
              </div>

              <div className="about-step">
                <div className="about-step__number">3</div>
                <div className="about-step__content">
                  <h3 className="about-step__title">Таклифларни киритинг</h3>
                  <p className="about-step__text">
                    Ўз фикрларингизни билдиринг ва бюджет тақсимотини ўзгартиринг
                  </p>
                </div>
              </div>

              <div className="about-step">
                <div className="about-step__number">4</div>
                <div className="about-step__content">
                  <h3 className="about-step__title">Юборинг</h3>
                  <p className="about-step__text">
                    Таклифларингизни расмийларга юборинг ва натижаларни кузатинг
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="about-cta">
            <div className="about-cta__content">
              <h2 className="about-cta__title">Ҳозироқ иштирок етинг!</h2>
              <p className="about-cta__text">
                Сизнинг фикрингиз муҳим. Ўз ҳудудингиз учун бюджет тақсимотига таъсир қилинг.
              </p>
              <button
                className="about-cta__button"
                onClick={() => navigate('/map-page')}
              >
                Таклиф киритиш
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
