'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { track } from '@vercel/analytics'
import { useSiteAnimations } from '@/hooks/useAnimations'
import { executeRecaptchaAction } from '@/hooks/useRecaptcha'
import CICPRoulette from './components/CICPRoulette'
import Header from './components/Header'
import Footer from './components/Footer'
import {
  Scale,
  BarChart3,
  DollarSign,
  ClipboardList,
  PieChart,
  Building2,
  AlertTriangle,
  FileText,
  RefreshCw,
  Phone,
  Mail,
  Globe,
  Copy,
  UserPen
} from 'lucide-react'

export default function HomePage() {
  // Initialize site animations (hero, scroll, funnel interactions)
  useSiteAnimations()
  const [scrollProgress, setScrollProgress] = useState(0)
  const [heroStats, setHeroStats] = useState({ claims: 0, compensated: 0, rate: 0, vicp: 0 })
  const [calcValues, setCalcValues] = useState({ approval: 40, award: 300000, claims: 14046 })
  const [appropriation, setAppropriation] = useState(0)
  const [personalCalc, setPersonalCalc] = useState({
    medical: 50000,
    insurance: 80,
    wages: 20000,
    severity: 'moderate'
  })
  const [zipCode, setZipCode] = useState('')
  const [repsLoading, setRepsLoading] = useState(false)
  const [repsError, setRepsError] = useState('')
  const [representatives, setRepresentatives] = useState<Array<{
    name: string
    office: string
    party: string
    phone: string
    website: string
    contactForm: string
  }>>([])
  const [subscribeForm, setSubscribeForm] = useState({ name: '', email: '', phone: '', zip: '' })
  const [subscribeLoading, setSubscribeLoading] = useState(false)
  const [subscribeMessage, setSubscribeMessage] = useState({ type: '', text: '' })
    const [calcTracked, setCalcTracked] = useState({ main: false, personal: false })
  const [rouletteOpen, setRouletteOpen] = useState(false)
  const [rouletteTriggered, setRouletteTriggered] = useState(false)
  const heroRef = useRef<HTMLElement>(null)

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100
      setScrollProgress(scrollPercent)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Trigger roulette popup at 30% scroll (only once per session)
  useEffect(() => {
    if (scrollProgress >= 30 && !rouletteTriggered && !rouletteOpen) {
      // Check if user has already dismissed it this session
      const dismissed = sessionStorage.getItem('roulette_dismissed')
      if (!dismissed) {
        setRouletteOpen(true)
        setRouletteTriggered(true)
        track('roulette_auto_opened', { scroll_percent: Math.round(scrollProgress) })
      }
    }
  }, [scrollProgress, rouletteTriggered, rouletteOpen])

  // Close roulette handler
  const closeRoulette = () => {
    setRouletteOpen(false)
    sessionStorage.setItem('roulette_dismissed', 'true')
  }

  // Animated counters
  useEffect(() => {
    const duration = 2000
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)

      setHeroStats({
        claims: Math.floor(14046 * easeOutQuart),
        compensated: Math.floor(42 * easeOutQuart),
        rate: parseFloat((0.3 * easeOutQuart).toFixed(1)),
        vicp: Math.floor(48 * easeOutQuart)
      })

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    const timeout = setTimeout(() => requestAnimationFrame(animate), 400)
    return () => clearTimeout(timeout)
  }, [])

  // Calculator results
  const approvedClaims = Math.round(calcValues.claims * (calcValues.approval / 100))
  const totalCost = approvedClaims * calcValues.award
  const percentOfFund = (totalCost / 4500000000) * 100
  const totalFund = 4500000000 + appropriation
  const burdenPercent = (totalCost / totalFund) * 100
  const remaining = totalFund - totalCost

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    return `$${value.toLocaleString()}`
  }

  // Personal calculator logic
  const painSufferingMap: Record<string, number> = {
    mild: 50000,
    moderate: 100000,
    severe: 175000,
    permanent: 250000
  }

  const outOfPocket = personalCalc.medical * (1 - personalCalc.insurance / 100)
  const cappedWages = Math.min(personalCalc.wages, 50000) // CICP caps lost wages
  const cicpTotal = Math.round(outOfPocket + cappedWages)
  const painSuffering = painSufferingMap[personalCalc.severity]
  const vicpLow = personalCalc.medical + personalCalc.wages + 50000
  const vicpHigh = personalCalc.medical + personalCalc.wages + painSuffering
  const gapLow = Math.round(vicpLow - cicpTotal)
  const gapHigh = Math.round(vicpHigh - cicpTotal)

  // Representative lookup function
  const lookupRepresentatives = async () => {
    if (!/^\d{5}$/.test(zipCode)) {
      setRepsError('Please enter a valid 5-digit ZIP code')
      return
    }

    setRepsLoading(true)
    setRepsError('')
    setRepresentatives([])

    try {
      const response = await fetch(`/api/representatives?zip=${zipCode}`)
      const data = await response.json()

      if (!response.ok) {
        setRepsError(data.error || 'Unable to find representatives')
        return
      }

      setRepresentatives(data.representatives)
      track('rep_lookup', { zip: zipCode, count: data.representatives.length })
    } catch {
      setRepsError('Unable to look up representatives. Please try the official directories below.')
    } finally {
      setRepsLoading(false)
    }
  }

  const handleZipKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      lookupRepresentatives()
    }
  }

  // Calculator change handlers with tracking
  const handleMainCalcChange = (field: string, value: number) => {
    setCalcValues(prev => ({ ...prev, [field]: value }))
    if (!calcTracked.main) {
      track('calculator_used', { type: 'trust_fund' })
      setCalcTracked(prev => ({ ...prev, main: true }))
    }
  }

  const handlePersonalCalcChange = (field: string, value: string | number) => {
    setPersonalCalc(prev => ({ ...prev, [field]: value }))
    if (!calcTracked.personal) {
      track('calculator_used', { type: 'personal_estimate' })
      setCalcTracked(prev => ({ ...prev, personal: true }))
    }
  }

  const getPartyClass = (party: string) => {
    if (party.toLowerCase().includes('democrat')) return 'democrat'
    if (party.toLowerCase().includes('republican')) return 'republican'
    return 'independent'
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubscribeLoading(true)
    setSubscribeMessage({ type: '', text: '' })

    try {
      // Get reCAPTCHA token (returns null if not configured)
      const recaptchaToken = await executeRecaptchaAction('SUBSCRIBE')

      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...subscribeForm, recaptchaToken }),
      })

      const data = await response.json()

      if (!response.ok) {
        setSubscribeMessage({ type: 'error', text: data.error || 'Failed to subscribe' })
        return
      }

      setSubscribeMessage({ type: 'success', text: data.message || 'Thank you for subscribing!' })
      track('newsletter_signup')
      setSubscribeForm({ name: '', email: '', phone: '', zip: '' })
    } catch {
      setSubscribeMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setSubscribeLoading(false)
    }
  }

  return (
    <div>
      {/* Scroll Progress */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      {/* Navigation */}
      <Header activePage="home" onRouletteOpen={() => setRouletteOpen(true)} />

      {/* Hero */}
      <section className="hero" ref={heroRef}>
        <div className="hero-inner">
          <div className="hero-badge">
            <Scale size={18} /> The Compensation Gap
          </div>
          <h1 className="hero-title">
            <span className="hero-line line-1">14,046 Claims Filed.</span>
            <span className="hero-line line-2">42 Americans Compensated.</span>
            <span className="hero-line line-3">A 0.3% Approval Rate.</span>
          </h1>
          <p className="hero-subtitle">
            Americans injured by COVID-19 vaccines face a different compensation system than those injured by flu shots, MMR, or other routine vaccines. <strong>The result: a 0.3% approval rate vs. ~48%.</strong> This site explains why, and what can be done about it.
          </p>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-number">{heroStats.claims.toLocaleString()}</div>
              <div className="hero-stat-label">CICP Claims Filed</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number danger">{heroStats.compensated}</div>
              <div className="hero-stat-label">Americans Compensated</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number danger">{heroStats.rate}%</div>
              <div className="hero-stat-label">CICP Approval Rate</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number success">{heroStats.vicp}%</div>
              <div className="hero-stat-label">VICP Approval Rate</div>
            </div>
          </div>

          <div className="hero-ctas">
            <a href="#funnel" className="hero-btn primary" onClick={() => track('cta_clicked', { location: 'hero', type: 'see_data' })}>
              <BarChart3 size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />See the Data
            </a>
            <a href="#action" className="hero-btn secondary" onClick={() => track('cta_clicked', { location: 'hero', type: 'take_action' })}>
              <Scale size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Take Action
            </a>
          </div>
        </div>
      </section>

      {/* Funnel Section */}
      <section className="funnel-section" id="funnel">
        <div className="section-inner">
          <div className="funnel-container">
            <span className="section-label">The CICP Reality</span>
            <h2 className="section-title">What Happens to a Claim?</h2>
            <p className="section-desc">
              Over 14,000 Americans filed COVID-19 vaccine injury claims with CICP. Here&apos;s what happened to them.
            </p>

            <div className="waterfall-funnel">
              <div className="waterfall-stage">
                <div className="waterfall-label">
                  <h4>Claims Filed</h4>
                  <p>COVID-19 vaccine injury claims submitted</p>
                </div>
                <div className="waterfall-bar-container">
                  <div className="waterfall-bar vaers">14,046 Claims</div>
                </div>
                <div className="waterfall-stat">
                  <div className="number">100%</div>
                  <div className="percent">Starting point</div>
                </div>
              </div>

              <div className="waterfall-stage">
                <div className="waterfall-label">
                  <h4>Decisions Rendered</h4>
                  <p>Claims reviewed and decided</p>
                </div>
                <div className="waterfall-bar-container">
                  <div className="waterfall-bar claims">6,273</div>
                </div>
                <div className="waterfall-stat">
                  <div className="number" style={{ color: 'var(--warning)' }}>45%</div>
                  <div className="percent">of claims decided</div>
                </div>
              </div>

              <div className="waterfall-stage">
                <div className="waterfall-label">
                  <h4>Compensated</h4>
                  <p>Actually received payment</p>
                </div>
                <div className="waterfall-bar-container">
                  <div className="waterfall-bar compensated">42</div>
                </div>
                <div className="waterfall-stat">
                  <div className="number" style={{ color: 'var(--danger)' }}>0.3%</div>
                  <div className="percent">approval rate</div>
                </div>
              </div>
            </div>

            <div className="funnel-summary">
              <div className="funnel-summary-stat">
                <div className="stat-number">55%</div>
                <div className="stat-label">of claims still pending review</div>
              </div>
              <div className="funnel-summary-stat">
                <div className="stat-number danger">99.3%</div>
                <div className="stat-label">of decided claims were denied</div>
              </div>
              <div className="funnel-summary-stat">
                <div className="stat-number">24 mo</div>
                <div className="stat-label">average time to decision (GAO)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="comparison-section" id="comparison">
        <div className="section-inner">
          <span className="section-label">Two Systems</span>
          <h2 className="section-title">Same Injuries. Different Outcomes.</h2>
          <p className="section-desc">
            COVID-19 vaccines use CICP (Countermeasures Injury Compensation Program). Routine vaccines use VICP (Vaccine Injury Compensation Program). The difference in outcomes is staggering.
          </p>

          <div className="comparison-grid">
            <div className="comparison-card cicp">
              <span className="comparison-card-badge">CICP - COVID-19 Vaccines</span>
              <h3>42 Paid</h3>
              <p className="comparison-card-subtitle">of 14,046 claims filed since 2020</p>

              <div className="comparison-stats">
                <div className="comparison-stat">
                  <div className="comparison-stat-number">0.3%</div>
                  <div className="comparison-stat-label">Approval Rate</div>
                </div>
                <div className="comparison-stat">
                  <div className="comparison-stat-number">$6.5M</div>
                  <div className="comparison-stat-label">Total Paid</div>
                </div>
              </div>

              <div className="comparison-features">
                <div className="comparison-feature"><span className="icon">✗</span> No judicial review or appeal</div>
                <div className="comparison-feature"><span className="icon">✗</span> No pain &amp; suffering damages</div>
                <div className="comparison-feature"><span className="icon">✗</span> Attorney fees not covered</div>
                <div className="comparison-feature"><span className="icon">✗</span> 1-year filing deadline</div>
                <div className="comparison-feature"><span className="icon">✗</span> HHS is judge, jury, and defendant</div>
              </div>
            </div>

            <div className="comparison-card vicp">
              <span className="comparison-card-badge">VICP - Routine Vaccines</span>
              <h3>12,300+ Paid</h3>
              <p className="comparison-card-subtitle">of ~29,000 claims since 1988</p>

              <div className="comparison-stats">
                <div className="comparison-stat">
                  <div className="comparison-stat-number">~48%</div>
                  <div className="comparison-stat-label">Approval Rate</div>
                </div>
                <div className="comparison-stat">
                  <div className="comparison-stat-number">$5.4B</div>
                  <div className="comparison-stat-label">Total Paid</div>
                </div>
              </div>

              <div className="comparison-features">
                <div className="comparison-feature"><span className="icon">✓</span> Federal court with Special Masters</div>
                <div className="comparison-feature"><span className="icon">✓</span> Up to $250K pain &amp; suffering</div>
                <div className="comparison-feature"><span className="icon">✓</span> Attorney fees covered separately</div>
                <div className="comparison-feature"><span className="icon">✓</span> 3-year filing deadline</div>
                <div className="comparison-feature"><span className="icon">✓</span> Independent judicial review</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Outlier Section */}
      <section className="outlier-section" id="outlier">
        <div className="section-inner">
          <div className="outlier-hero">
            <span className="section-label">The Real Story</span>
            <div className="big-number">$6.5<span>M</span></div>
            <p>CICP reports $6.5 million in total COVID compensation. But one payment tells a very different story.</p>
          </div>

          <div className="outlier-bar-visual">
            <div className="outlier-bar-header">
              <h4>Total CICP COVID-19 Vaccine Compensation</h4>
              <div className="total">$6.52 Million</div>
            </div>

            <div className="outlier-stacked-bar">
              <div className="outlier-segment single">
                <span className="amount">$5.94M</span>
                <span className="label">ONE Payment (91%)</span>
              </div>
              <div className="outlier-segment others">
                <span className="amount">$575K</span>
                <span className="label">41 Others</span>
              </div>
            </div>

            <div className="outlier-legend">
              <div className="outlier-legend-item">
                <div className="legend-dot gold"></div>
                <div className="legend-info">
                  <h5>Single TTS Case</h5>
                  <p>One case (Thrombosis with Thrombocytopenia Syndrome) received 91% of all COVID compensation</p>
                  <div className="highlight">$5.94 Million</div>
                </div>
              </div>
              <div className="outlier-legend-item">
                <div className="legend-dot navy"></div>
                <div className="legend-info">
                  <h5>Everyone Else Combined</h5>
                  <p>41 other compensated individuals split the remaining 9%</p>
                  <div className="highlight">$575,442</div>
                </div>
              </div>
            </div>
          </div>

          <div className="reality-callout">
            <h3><AlertTriangle size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Without the Outlier</h3>
            <p>Remove that single $5.94M payment and the typical CICP compensation becomes clear. Here&apos;s what most injured Americans can actually expect:</p>
            <div className="reality-stats">
              <div className="reality-stat-card cicp">
                <div className="label">Typical CICP Payment</div>
                <div className="number">$4,132</div>
                <div className="note">COVID-19 median (HRSA Table 4)</div>
              </div>
              <div className="reality-stat-card vicp">
                <div className="label">Average VICP Award</div>
                <div className="number">$450,000</div>
                <div className="note">2006-2020 average (HRSA)</div>
              </div>
            </div>
          </div>

          <div className="median-comparison">
            <h4>Payment Comparison</h4>
            <div className="median-bar-row">
              <div className="median-bar-label">Typical CICP</div>
              <div className="median-bar-track">
                <div className="median-bar-fill cicp"></div>
              </div>
              <div className="median-bar-value">$4,132</div>
            </div>
            <div className="median-bar-row">
              <div className="median-bar-label">Average VICP</div>
              <div className="median-bar-track">
                <div className="median-bar-fill vicp"></div>
              </div>
              <div className="median-bar-value">$450,000</div>
            </div>
            <div className="median-multiplier">
              Average VICP award is <span>109× higher</span> than typical CICP payment
            </div>
          </div>
        </div>
      </section>

      {/* Personal Calculator Section */}
      <section className="personal-calculator-section" id="personal-calculator">
        <div className="section-inner" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <span className="section-label">Personal Calculator</span>
          <h2 className="section-title">What Would You Get?</h2>
          <p className="section-desc">
            See the difference in compensation between CICP and VICP for your situation.
          </p>

          <div className="personal-calc-container">
            <div className="personal-calc-inputs">
              <h3>Enter Your Details</h3>
              <p>Adjust the sliders to see your estimated compensation under each program.</p>

              <div className="personal-calc-field">
                <label>
                  Total Medical Expenses
                  <span>${personalCalc.medical.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  className="personal-calc-slider"
                  min="0"
                  max="500000"
                  step="5000"
                  value={personalCalc.medical}
                  onChange={(e) => handlePersonalCalcChange('medical', parseInt(e.target.value))}
                />
              </div>

              <div className="personal-calc-field">
                <label>
                  Insurance Coverage
                  <span>{personalCalc.insurance}%</span>
                </label>
                <input
                  type="range"
                  className="personal-calc-slider"
                  min="0"
                  max="100"
                  value={personalCalc.insurance}
                  onChange={(e) => handlePersonalCalcChange('insurance', parseInt(e.target.value))}
                />
              </div>

              <div className="personal-calc-field">
                <label>
                  Lost Wages
                  <span>${personalCalc.wages.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  className="personal-calc-slider"
                  min="0"
                  max="100000"
                  step="1000"
                  value={personalCalc.wages}
                  onChange={(e) => handlePersonalCalcChange('wages', parseInt(e.target.value))}
                />
              </div>

              <div className="personal-calc-field">
                <label>Injury Severity</label>
                <select
                  className="personal-calc-select"
                  value={personalCalc.severity}
                  onChange={(e) => handlePersonalCalcChange('severity', e.target.value)}
                >
                  <option value="mild">Mild - Temporary symptoms</option>
                  <option value="moderate">Moderate - Extended recovery</option>
                  <option value="severe">Severe - Long-term effects</option>
                  <option value="permanent">Permanent - Lasting disability</option>
                </select>
              </div>
            </div>

            <div className="personal-calc-results">
              <div className="personal-result-card cicp">
                <div className="personal-result-card-header">
                  <span className="personal-result-card-badge">CICP (COVID)</span>
                </div>
                <div className="personal-result-amount">${cicpTotal.toLocaleString()}</div>
                <p className="personal-result-subtitle">Estimated Maximum Award</p>
                <div className="personal-result-features">
                  <div className="personal-result-feature"><span>✗</span> Pain &amp; Suffering: $0</div>
                  <div className="personal-result-feature"><span>✗</span> Attorney Fees: Not covered</div>
                  <div className="personal-result-feature"><span>✗</span> Only unreimbursed expenses</div>
                </div>
              </div>

              <div className="personal-result-card vicp">
                <div className="personal-result-card-header">
                  <span className="personal-result-card-badge">VICP (If Covered)</span>
                </div>
                <div className="personal-result-amount">${vicpLow.toLocaleString()} - ${vicpHigh.toLocaleString()}</div>
                <p className="personal-result-subtitle">Estimated Award Range</p>
                <div className="personal-result-features">
                  <div className="personal-result-feature"><span>✓</span> Pain &amp; Suffering: Up to $250,000</div>
                  <div className="personal-result-feature"><span>✓</span> Attorney Fees: Covered separately</div>
                  <div className="personal-result-feature"><span>✓</span> Full medical + lost wages</div>
                </div>
              </div>

              <div className="personal-result-gap">
                <div className="personal-result-gap-label">You Could Be Losing</div>
                <div className="personal-result-gap-amount">${gapLow.toLocaleString()} - ${gapHigh.toLocaleString()}</div>
                <a href="#action" className="personal-result-gap-cta" onClick={() => track('cta_clicked', { location: 'personal_calculator', type: 'take_action' })}>
                  Tell Congress: Cover COVID Fairly →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="calculator-section" id="calculator">
        <div className="section-inner">
          <div className="calculator-container">
            <div className="calculator-intro">
              <span className="section-label">Quantify The Impact</span>
              <h2 className="section-title">Projected VICP Burden</h2>
              <p className="section-desc" style={{ marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}>
                What would it cost if COVID-19 vaccines were covered under VICP? Adjust the assumptions to see the projected impact.
              </p>
            </div>

            <div className="calculator-grid">
              <div className="calculator-inputs">
                <h3>Adjust Assumptions</h3>
                <p>Based on historical VICP averages and current CICP claim volume</p>

                <div className="calc-field">
                  <label>
                    Estimated Approval Rate
                    <span>{calcValues.approval}%</span>
                  </label>
                  <input
                    type="range"
                    className="calc-slider"
                    min="20"
                    max="60"
                    value={calcValues.approval}
                    onChange={(e) => handleMainCalcChange('approval', parseInt(e.target.value))}
                  />
                  <div className="calc-note">VICP historical average: ~48%</div>
                </div>

                <div className="calc-field">
                  <label>
                    Average Award per Claim
                    <span>${calcValues.award.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    className="calc-slider"
                    min="100000"
                    max="500000"
                    step="25000"
                    value={calcValues.award}
                    onChange={(e) => handleMainCalcChange('award', parseInt(e.target.value))}
                  />
                  <div className="calc-note">VICP historical average: ~$450,000</div>
                </div>

                <div className="calc-field">
                  <label>
                    Total Eligible Claims
                    <span>{calcValues.claims.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    className="calc-slider"
                    min="5000"
                    max="25000"
                    step="500"
                    value={calcValues.claims}
                    onChange={(e) => handleMainCalcChange('claims', parseInt(e.target.value))}
                  />
                  <div className="calc-note">Current CICP claims filed to date</div>
                </div>
              </div>

              <div className="calculator-results">
                <div className="calc-result-card">
                  <div className="icon"><ClipboardList size={32} /></div>
                  <div className="number">{approvedClaims.toLocaleString()}</div>
                  <div className="label">Estimated Approved Claims</div>
                </div>
                <div className="calc-result-card highlight">
                  <div className="icon"><DollarSign size={32} /></div>
                  <div className="number">{formatCurrency(totalCost)}</div>
                  <div className="label">Estimated Total Cost</div>
                </div>
                <div className="calc-result-card">
                  <div className="icon"><PieChart size={32} /></div>
                  <div className="number">{percentOfFund.toFixed(0)}%</div>
                  <div className="label">% of Trust Fund</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Fund Section */}
      <section className="trustfund-section" id="trustfund">
        <div className="section-inner">
          <div className="trustfund-container">
            <div className="trustfund-header">
              <span className="section-label">Fiscal Impact</span>
              <h2 className="section-title">Can the Trust Fund Handle It?</h2>
              <p className="section-desc" style={{ margin: '0 auto' }}>
                The primary concern about migrating COVID vaccine injuries from CICP to VICP is whether the trust fund can absorb the additional claims without breaking the program.
              </p>
            </div>

            <div className="fund-visual">
              <div className="fund-visual-header">
                <h4>VICP Vaccine Injury Trust Fund</h4>
                <div className="balance">{formatCurrency(totalFund)}</div>
              </div>

              <div className="fund-tank">
                <div className="fund-burden" style={{ height: `${Math.min(burdenPercent, 100)}%` }}>
                  <div className="burden-label">Est. COVID Claims</div>
                  <div className="burden-amount">{formatCurrency(totalCost)}</div>
                </div>
                <div className="fund-available">
                  <div className="available-label">Available Funds</div>
                  <div className="available-amount">{formatCurrency(Math.max(remaining, 0))}</div>
                </div>
                <div className="fund-scale">
                  <div className="fund-scale-mark">{formatCurrency(totalFund)}</div>
                  <div className="fund-scale-mark">{formatCurrency(totalFund * 0.75)}</div>
                  <div className="fund-scale-mark">{formatCurrency(totalFund * 0.5)}</div>
                  <div className="fund-scale-mark">{formatCurrency(totalFund * 0.25)}</div>
                  <div className="fund-scale-mark">$0</div>
                </div>
              </div>
            </div>

            <div className="appropriation-section">
              <h4><Building2 size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />What If Congress Appropriates Additional Funds?</h4>
              <p>Congress could inject liquidity into the VICP Trust Fund to ensure stability. Adjust the slider to see the impact.</p>

              <div className="appropriation-slider-container">
                <label>
                  Congressional Appropriation
                  <span>{formatCurrency(appropriation)}</span>
                </label>
                <input
                  type="range"
                  className="calc-slider"
                  min="0"
                  max="5000000000"
                  step="100000000"
                  value={appropriation}
                  onChange={(e) => setAppropriation(parseInt(e.target.value))}
                />
              </div>

              <div className="appropriation-result">
                <div className="appropriation-result-card">
                  <div className="label">New Total Fund Balance</div>
                  <div className="number">{formatCurrency(totalFund)}</div>
                </div>
                <div className="appropriation-result-card">
                  <div className="label">Remaining After COVID Claims</div>
                  <div className="number">{formatCurrency(Math.max(remaining, 0))}</div>
                </div>
              </div>
            </div>

            <div className="fund-insight">
              <h4>The Fund Can Handle This</h4>
              <p>The math works. Even with conservative projections, the trust fund can absorb COVID claims, especially with modest congressional support. Money isn&apos;t the barrier to fair compensation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Action Section */}
      <section className="action-section" id="action">
        <div className="action-inner">
          <span className="section-label">Take Action</span>
          <h2 className="section-title">Contact Your Representatives</h2>
          <p className="section-desc">
            Americans injured by COVID-19 vaccines deserve the same fair compensation process as those injured by routine vaccines. Find and contact your representatives.
          </p>

          <div className="rep-finder">
            <h3>Find Your Representatives</h3>
            <p>Enter your ZIP code to find your U.S. Representative and Senators</p>

            <div className="zip-input-container">
              <input
                type="text"
                className="zip-input"
                placeholder="Enter ZIP Code"
                maxLength={5}
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
                onKeyPress={handleZipKeyPress}
              />
              <button
                className="zip-submit"
                onClick={lookupRepresentatives}
                disabled={repsLoading}
              >
                {repsLoading ? 'Searching...' : 'Find Reps'}
              </button>
            </div>

            {repsError && (
              <div className="rep-error">
                {repsError}
              </div>
            )}

            {representatives.length > 0 && (
              <div className="rep-results">
                <h4>Your Congressional Representatives</h4>
                <div className="rep-cards">
                  {representatives.map((rep, index) => (
                    <div key={index} className={`rep-card ${getPartyClass(rep.party)}`}>
                      <div className="rep-card-header">
                        <div className="rep-photo-placeholder">
                          <UserPen size={24} />
                        </div>
                        <div className="rep-info">
                          <h5>{rep.name}</h5>
                          <p className="rep-office">{rep.office}</p>
                          <span className={`rep-party ${getPartyClass(rep.party)}`}>
                            {rep.party}
                          </span>
                        </div>
                      </div>
                      <div className="rep-contact">
                        {rep.phone && (
                          <a href={`tel:${rep.phone}`} className="rep-contact-btn phone">
                            <Phone size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />{rep.phone}
                          </a>
                        )}
                        {rep.contactForm && (
                          <a href={rep.contactForm} target="_blank" rel="noopener noreferrer" className="rep-contact-btn email">
                            <Mail size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />Send Message
                          </a>
                        )}
                        {rep.website && (
                          <a href={rep.website} target="_blank" rel="noopener noreferrer" className="rep-contact-btn website">
                            <Globe size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />Website
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="message-template">
                  <h4><FileText size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Sample Message</h4>
                  <div className="message-box">
                    <p>Dear [Representative/Senator],</p>
                    <p>I am writing to urge you to support legislation that would add COVID-19 vaccines to the National Vaccine Injury Compensation Program (VICP).</p>
                    <p>Currently, Americans injured by COVID-19 vaccines must file claims through the Countermeasures Injury Compensation Program (CICP), which has a 0.3% approval rate compared to VICP&apos;s ~48%. CICP offers no judicial review, no pain and suffering damages, and requires claimants to pay their own attorney fees.</p>
                    <p>Fair compensation for vaccine injuries is not a partisan issue. It&apos;s about keeping our promise to Americans who did their part during a public health emergency.</p>
                    <p>Thank you for your consideration.</p>
                  </div>
                  <button
                    className="copy-message-btn"
                    onClick={(e) => {
                      const message = `Dear [Representative/Senator],\n\nI am writing to urge you to support legislation that would add COVID-19 vaccines to the National Vaccine Injury Compensation Program (VICP).\n\nCurrently, Americans injured by COVID-19 vaccines must file claims through the Countermeasures Injury Compensation Program (CICP), which has a 0.3% approval rate compared to VICP's ~48%. CICP offers no judicial review, no pain and suffering damages, and requires claimants to pay their own attorney fees.\n\nFair compensation for vaccine injuries is not a partisan issue. It's about keeping our promise to Americans who did their part during a public health emergency.\n\nThank you for your consideration.`
                      navigator.clipboard.writeText(message)
                      track('message_copied')
                      const btn = e.currentTarget
                      btn.classList.add('copied')
                      setTimeout(() => btn.classList.remove('copied'), 2000)
                    }}
                  >
                    <Copy size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />Copy Message
                  </button>
                </div>
              </div>
            )}

            <div className="action-fallback">
              <p>Or use these official directories:</p>
              <div className="action-fallback-links">
                <a href="https://www.house.gov/representatives/find-your-representative" target="_blank" rel="noopener noreferrer" onClick={() => track('external_link_clicked', { destination: 'house_directory' })}>House Directory →</a>
                <a href="https://www.senate.gov/senators/senators-contact.htm" target="_blank" rel="noopener noreferrer" onClick={() => track('external_link_clicked', { destination: 'senate_directory' })}>Senate Directory →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview Section */}
      <section className="faq-preview-section" id="faq-preview">
        <div className="faq-preview-inner">
          <div className="faq-preview-header">
            <span className="section-label">Learn More</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-desc" style={{ margin: '0 auto' }}>
              Understand the programs, the history, and why reform matters.
            </p>
          </div>

          <div className="faq-preview-grid">
            <Link href="/faq#vicp" className="faq-preview-card">
              <div className="icon"><Building2 size={28} /></div>
              <h4>What is VICP?</h4>
              <p>The Vaccine Injury Compensation Program since 1988</p>
            </Link>
            <Link href="/faq#cicp" className="faq-preview-card">
              <div className="icon"><AlertTriangle size={28} /></div>
              <h4>What is CICP?</h4>
              <p>The Countermeasures Injury Compensation Program</p>
            </Link>
            <Link href="/faq#prep-act" className="faq-preview-card">
              <div className="icon"><FileText size={28} /></div>
              <h4>What is the PREP Act?</h4>
              <p>Why COVID vaccines are handled differently</p>
            </Link>
            <Link href="/faq#reform" className="faq-preview-card">
              <div className="icon"><RefreshCw size={28} /></div>
              <h4>Why Add to VICP?</h4>
              <p>The case for covering COVID vaccines under VICP</p>
            </Link>
          </div>

          <div className="faq-preview-cta">
            <Link href="/faq">
              View Full FAQ
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="subscribe-section">
        <div className="subscribe-inner">
          <div className="subscribe-content">
            <h2 className="subscribe-title">Stay Informed</h2>
            <p className="subscribe-desc">
              Get updates on legislation, advocacy efforts, and news about vaccine injury compensation reform.
            </p>
          </div>
          <form className="subscribe-form" onSubmit={handleSubscribe}>
            <div className="subscribe-row">
              <input
                type="text"
                placeholder="Full Name *"
                value={subscribeForm.name}
                onChange={(e) => setSubscribeForm(prev => ({ ...prev, name: e.target.value }))}
                className="subscribe-input"
                required
              />
              <input
                type="email"
                placeholder="Email Address *"
                value={subscribeForm.email}
                onChange={(e) => setSubscribeForm(prev => ({ ...prev, email: e.target.value }))}
                className="subscribe-input"
                required
              />
            </div>
            <div className="subscribe-row">
              <input
                type="tel"
                placeholder="Phone (Optional)"
                value={subscribeForm.phone}
                onChange={(e) => setSubscribeForm(prev => ({ ...prev, phone: e.target.value }))}
                className="subscribe-input"
              />
              <input
                type="text"
                placeholder="ZIP Code (Optional)"
                value={subscribeForm.zip}
                onChange={(e) => setSubscribeForm(prev => ({ ...prev, zip: e.target.value.replace(/\D/g, '').slice(0, 5) }))}
                className="subscribe-input"
                maxLength={5}
              />
            </div>
            {subscribeMessage.text && (
              <div className={`subscribe-message ${subscribeMessage.type}`}>
                {subscribeMessage.text}
              </div>
            )}
            <button type="submit" className="subscribe-btn" disabled={subscribeLoading}>
              {subscribeLoading ? 'Subscribing...' : 'Subscribe for Updates'}
            </button>
            <p className="subscribe-privacy">We respect your privacy. Unsubscribe at any time.</p>
          </form>
        </div>
      </section>

      {/* Footer */}
      <Footer showDataSources />

      {/* CICP Roulette Modal */}
      {rouletteOpen && (
        <div className="modal-overlay" onClick={closeRoulette}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeRoulette} aria-label="Close modal">
              ✕
            </button>
            <CICPRoulette compact onClose={closeRoulette} />
          </div>
        </div>
      )}
    </div>
  )
}
