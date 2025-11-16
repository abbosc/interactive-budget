import { useState } from 'react'
import { HelpCircle, MapPin, Sliders, Send, BarChart3 } from 'lucide-react'
import './HelpPageStyles.css'

export function HelpPage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const steps = [
    {
      id: 1,
      icon: <MapPin size={40} />,
      title: 'Ҳудудни танлаш',
      description: 'Асосий саҳифада Ўзбекистон харитасидан ўз вилоятингиз ёки шаҳрингизни танланг',
      image: '/images/help/1. map-page.png',
      tips: [
        'Харитада ҳар бир ҳудуд рангланган ҳолда кўрсатилган',
        'Ҳудуд устига курсорни олиб борсангиз, қисқача маълумот кўрасиз',
        'Танлаш учун ҳудудга босинг'
      ]
    },
    {
      id: 2,
      icon: <BarChart3 size={40} />,
      title: 'Бюджет маълумотларини кўриш',
      description: 'Танланган ҳудуднинг жорий бюджет тақсимотини соҳалар бўйича кўринг',
      image: '/images/help/2. region page.png',
      tips: [
        'Ҳар бир соҳа учун тасдиқланган ва таклиф этилган бюджет кўрсатилади',
        'Диаграммалар орқали тақсимотни визуал кўришингиз мумкин',
        'Маълумот тугмасига босиб, батафсил маълумот олишингиз мумкин'
      ]
    },
    {
      id: 3,
      icon: <Sliders size={40} />,
      title: 'Бюджетни созлаш',
      description: 'Ўзингиз муҳим деб ҳисоблаган соҳаларга бюджет маблағларини қайта тақсимланг',
      image: '/images/help/3. slayder.png',
      tips: [
        'Ҳар бир соҳа учун слайдерни силжитиш орқали бюджетни ўзгартиринг',
        'Умумий бюджет миқдори ўзгармайди, фақат тақсимот ўзгаради',
        'Ўзгаришлар дарҳол экранда акс етади'
      ]
    },
    {
      id: 4,
      icon: <Send size={40} />,
      title: 'Таклифни юбориш',
      description: 'Таклифларингизни тўлдириб, расмийларга юборинг',
      image: '/images/help/4. yuborish.png',
      tips: [
        'Шахсий маълумотларингизни киритинг (исм, электрон почта)',
        'Таклифингизни қисқача тушунтириб ёзинг',
        'Юбориш тугмасини босиб, таклифни тасдиқланг',
        'Тасдиқлаш хабарини кутинг'
      ]
    }
  ]

  return (
    <div className="help-page">
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
      <section className="help-hero">
        <div className="help-hero__content">
          <div className="help-hero__icon">
            <HelpCircle size={64} />
          </div>
          <h1 className="help-hero__title">Платформадан фойдаланиш бўйича йўриқнома</h1>
          <p className="help-hero__subtitle">
            Фуқаролар бюджети платформасидан қандай фойдаланишни қадам-ба-қадам ўрганинг
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="help-content">
        <div className="help-content__wrapper">
          {/* Introduction */}
          <section className="help-intro">
            <h2 className="help-intro__title">Қандай бошлаш керак?</h2>
            <p className="help-intro__text">
              Ушбу йўриқнома орқали сиз платформанинг барча имкониятларидан тўлиқ фойдаланишни ўрганасиз.
              Ҳар бир қадам учун батафсил тушунтириш ва визуал мисоллар тақдим етилган.
            </p>
          </section>

          {/* Steps */}
          <div className="help-steps">
            {steps.map((step, index) => (
              <section key={step.id} className="help-step">
                <div className="help-step__header">
                  <div className="help-step__number">
                    <span>{step.id}</span>
                  </div>
                  <div className="help-step__header-content">
                    <div className="help-step__icon">
                      {step.icon}
                    </div>
                    <h3 className="help-step__title">{step.title}</h3>
                  </div>
                </div>

                <div className="help-step__content">
                  <p className="help-step__description">{step.description}</p>

                  {/* Image Placeholder */}
                  <div className="help-step__image">
                    <img
                      src={step.image}
                      alt={step.title}
                      onError={(e) => {
                        // Fallback for missing images
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                    <div className="help-step__image-placeholder hidden">
                      <div className="help-step__image-placeholder-icon">
                        {step.icon}
                      </div>
                      <p className="help-step__image-placeholder-text">
                        Скриншот №{step.id}
                      </p>
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="help-step__tips">
                    <h4 className="help-step__tips-title">Фойдали маслаҳатлар:</h4>
                    <ul className="help-step__tips-list">
                      {step.tips.map((tip, i) => (
                        <li key={i} className="help-step__tips-item">{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            ))}
          </div>

          {/* Additional Help */}
          <section className="help-additional">
            <div className="help-additional__card">
              <h3 className="help-additional__title">Қўшимча ёрдам керакми?</h3>
              <p className="help-additional__text">
                Агар саволларингиз бўлса ёки муаммога дуч келсангиз, биз билан боғланинг:
              </p>
              <div className="help-additional__contacts">
                <div className="help-additional__contact">
                  <strong>Электрон почта:</strong> support@openbudget.uz
                </div>
                <div className="help-additional__contact">
                  <strong>Телефон:</strong> +998 (71) 123-45-67
                </div>
                <div className="help-additional__contact">
                  <strong>Иш вақти:</strong> Душанба-Жума, 9:00 - 18:00
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="help-cta">
            <div className="help-cta__content">
              <h2 className="help-cta__title">Тайёрмисиз?</h2>
              <p className="help-cta__text">
                Ҳозир платформадан фойдаланишни бошланг ва ўз таклифларингизни киритинг!
              </p>
              <a href="/map-page" className="help-cta__button">
                Бошлаш
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
