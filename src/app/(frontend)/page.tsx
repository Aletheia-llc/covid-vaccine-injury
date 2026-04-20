'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import Link from 'next/link'
import { track } from '@vercel/analytics'
import { useSiteAnimations } from '@/hooks/useAnimations'
import { executeRecaptchaAction } from '@/hooks/useRecaptcha'
import { useStatistics } from '@/hooks/useStatistics'
import { fetchWithCsrf } from '@/lib/csrf-client'
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

  // Fetch statistics from CMS
  const { statistics, getNumeric } = useStatistics()

  const [scrollProgress, setScrollProgress] = useState(0)
  const [heroStats, setHeroStats] = useState({ claims: 0, compensated: 0, rate: 0, vicp: 0 })
  const [calcValues, setCalcValues] = useState({ approval: 45, award: 325000, claims: getNumeric('cicp_claims_filed') || 14075 })
  const [fundParams, setFundParams] = useState({ approvalRate: 45, avgAward: 325000, specialMasters: 10 })
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
  const [funnelAnimated, setFunnelAnimated] = useState(false)
  const [fundAnimated, setFundAnimated] = useState(false)
  const heroRef = useRef<HTMLElement>(null)
  const funnelRef = useRef<HTMLDivElement>(null)
  const fundTankRef = useRef<HTMLDivElement>(null)
  const heroAnimationComplete = useRef(false)

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

  // Funnel animation trigger on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !funnelAnimated) {
            setFunnelAnimated(true)
          }
        })
      },
      { threshold: 0.3 }
    )

    if (funnelRef.current) {
      observer.observe(funnelRef.current)
    }

    return () => observer.disconnect()
  }, [funnelAnimated])

  // Fund tank animation trigger on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !fundAnimated) {
            setFundAnimated(true)
          }
        })
      },
      { threshold: 0.3 }
    )

    if (fundTankRef.current) {
      observer.observe(fundTankRef.current)
    }

    return () => observer.disconnect()
  }, [fundAnimated])

  // Roulette auto-popup disabled — users can still open it from nav or /roulette page

  // Close roulette handler
  const closeRoulette = () => {
    setRouletteOpen(false)
    sessionStorage.setItem('roulette_dismissed', 'true')
  }

  // Animated counters - run once on mount
  useEffect(() => {
    // Only run animation once
    if (heroAnimationComplete.current) return

    const claimsTarget = 14075
    const compensatedTarget = 44
    const rateTarget = 0.3
    const vicpTarget = 49

    const duration = 2000
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)

      setHeroStats({
        claims: Math.floor(claimsTarget * easeOutQuart),
        compensated: Math.floor(compensatedTarget * easeOutQuart),
        rate: parseFloat((rateTarget * easeOutQuart).toFixed(1)),
        vicp: Math.floor(vicpTarget * easeOutQuart)
      })

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        heroAnimationComplete.current = true
      }
    }

    const timeout = setTimeout(() => requestAnimationFrame(animate), 400)
    return () => clearTimeout(timeout)
  }, [])

  // Calculator results
  const approvedClaims = Math.round(calcValues.claims * (calcValues.approval / 100))
  const totalCost = approvedClaims * calcValues.award
  const percentOfFund = (totalCost / 4500000000) * 100

  // 10-Year Trust Fund Projection (dynamic based on sliders)
  const fundProjection = useMemo(() => {
    const results: Array<{ year: number; balance: number; covidBacklog: number; vicpBacklog: number; covidProcessed: number; covidCostM: number; surplusM: number; totalCapacity: number }> = []
    let balance = 4.5 // billions
    let covidBacklog = 14075
    let vicpBacklog = 3600
    const masterRate = 162.5 // adjudications per master per year
    const totalCapacity = Math.round(fundParams.specialMasters * masterRate)
    const ongoingVicp = 1200 // existing VICP filings per year
    const newVaccineClaims = 218 // RSV ~150 + Shingles ~43 + Dengue ~5 + future ~20
    const totalNewFilings = ongoingVicp + newVaccineClaims // ~1,418/yr
    const excessCapacity = Math.max(totalCapacity - totalNewFilings, 0)
    const doses = 0.375 // billions of doses
    const excise = 2.20
    const cpi = 1.03
    const masterOverheadB = fundParams.specialMasters * 0.00125 // ~$1.25M per master (CRS IF12625: $10M OSM budget / 8 masters)

    for (let yr = 0; yr <= 10; yr++) {
      if (yr === 0) {
        results.push({ year: yr, balance, covidBacklog, vicpBacklog, covidProcessed: 0, covidCostM: 0, surplusM: 0, totalCapacity })
        continue
      }
      const cpiFactor = Math.pow(cpi, yr - 1)

      // Inflows
      const exciseRevenue = doses * excise * cpiFactor
      const interest = balance * 0.019
      const inflows = exciseRevenue + interest

      // Allocate excess capacity proportionally between backlogs
      const totalBacklog = vicpBacklog + covidBacklog
      let vicpProcessed = 0
      let covidProcessed = 0
      if (totalBacklog > 0 && excessCapacity > 0) {
        const vicpShare = vicpBacklog / totalBacklog
        vicpProcessed = Math.min(vicpBacklog, Math.floor(excessCapacity * vicpShare))
        covidProcessed = Math.min(covidBacklog, Math.floor(excessCapacity * (1 - vicpShare)))
      }
      vicpBacklog = Math.max(vicpBacklog - vicpProcessed, 0)
      covidBacklog = Math.max(covidBacklog - covidProcessed, 0)

      // Outflows
      const existingVicp = 0.275 * cpiFactor
      const covidCostB = (covidProcessed * (fundParams.approvalRate / 100) * fundParams.avgAward) / 1e9
      const newVaccine = 0.055 * cpiFactor
      const overhead = masterOverheadB * cpiFactor
      const outflows = existingVicp + covidCostB + newVaccine + overhead

      const surplus = inflows - outflows
      balance += surplus

      results.push({
        year: yr,
        balance,
        covidBacklog,
        vicpBacklog,
        covidProcessed,
        covidCostM: covidCostB * 1000,
        surplusM: surplus * 1000,
        totalCapacity,
      })
    }
    return results
  }, [fundParams])

  const yr10 = fundProjection[10]
  const yr1 = fundProjection[1]
  const totalCapacityDerived = Math.round(fundParams.specialMasters * 162.5)
  const netCovidCapacity = Math.max(totalCapacityDerived - 1200 - 218, 0) // total - VICP filings - new vaccine filings
  const yearsToComplete = netCovidCapacity > 0 ? Math.ceil(14075 / netCovidCapacity) : null
  const masterOverheadM = fundParams.specialMasters * 1.25
  // COVID annual cost at base assumptions using net capacity
  const baseCovidCostM = Math.round(netCovidCapacity * (fundParams.approvalRate / 100) * fundParams.avgAward / 1000000)
  const baseTotalOutflowsM = 275 + baseCovidCostM + 55 + Math.round(masterOverheadM)
  const baseSurplusM = 910 - baseTotalOutflowsM

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

      const response = await fetchWithCsrf('/api/subscribe', {
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
            <span className="hero-line line-1">14,075 Claims Filed.</span>
            <span className="hero-line line-2">44 Americans Compensated.</span>
            <span className="hero-line line-3">A 0.3% Approval Rate.</span>
          </h1>
          <p className="hero-subtitle">
            Americans injured by COVID-19 vaccines face a different compensation system than those injured by flu shots, MMR, or other routine vaccines. <strong>The result: a 0.3% approval rate vs. ~49%.</strong> This site explains why, and what can be done about it.
          </p>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-number">{heroStats.claims.toLocaleString()}</div>
              <div className="hero-stat-label">CICP Claims Filed<sup><a href="#citations" className="citation-link">1</a></sup></div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number danger">{heroStats.compensated}</div>
              <div className="hero-stat-label">Americans Compensated<sup><a href="#citations" className="citation-link">1</a></sup></div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number danger">{heroStats.rate}%</div>
              <div className="hero-stat-label">CICP Approval Rate<sup><a href="#citations" className="citation-link">1</a></sup></div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number success">{heroStats.vicp}%</div>
              <div className="hero-stat-label">VICP Approval Rate<sup><a href="#citations" className="citation-link">2</a></sup></div>
            </div>
          </div>

          <div className="hero-ctas">
            <a href="#funnel" className="hero-btn primary" onClick={() => track('cta_clicked', { location: 'hero', type: 'see_data' })}>
              <BarChart3 size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />See the Evidence
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
              Over {(getNumeric('cicp_claims_filed') || 14075).toLocaleString()} Americans have filed COVID-19 vaccine injury claims with Countermeasures Injury Compensation Program (CICP). Here&apos;s what&apos;s happened to them so far.
            </p>

            <div ref={funnelRef} className={`waterfall-funnel${funnelAnimated ? ' animate' : ''}`}>
              <div className="waterfall-stage">
                <div className="waterfall-label">
                  <h4>Claims Filed</h4>
                  <p>COVID-19 vaccine injury claims submitted</p>
                </div>
                <div className="waterfall-bar-container">
                  <div className="waterfall-bar vaers">{statistics.cicp_claims_filed?.value || '14,075'} Claims</div>
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
                  <div className="waterfall-bar claims">{statistics.cicp_decisions_rendered?.value || '6,421'}</div>
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
                  <div className="waterfall-bar compensated" data-label={statistics.cicp_compensated?.value || '44'}></div>
                </div>
                <div className="waterfall-stat">
                  <div className="number" style={{ color: 'var(--danger)' }}>{statistics.cicp_approval_rate?.value || '0.3%'}</div>
                  <div className="percent">approval rate</div>
                </div>
              </div>
            </div>

            <div className="funnel-summary">
              <div className="funnel-summary-stat">
                <div className="stat-number">{statistics.cicp_pending_percent?.value || '54%'}</div>
                <div className="stat-label">of claims still pending review<sup><a href="#citations" className="citation-link">1</a></sup></div>
              </div>
              <div className="funnel-summary-stat">
                <div className="stat-number danger">{statistics.cicp_denial_rate?.value || '98.6%'}</div>
                <div className="stat-label">of decided claims were denied<sup><a href="#citations" className="citation-link">1</a></sup></div>
              </div>
              <div className="funnel-summary-stat">
                <div className="stat-number">{statistics.cicp_avg_decision_time?.value || '24 mo'}</div>
                <div className="stat-label">average time to decision<sup><a href="#citations" className="citation-link">3</a></sup></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Denial Breakdown Section */}
      <section className="denial-breakdown-section" id="denials">
        <div className="section-inner">
          <span className="section-label">Why So Low?</span>
          <h2 className="section-title">75% of Denials Were Procedural</h2>
          <p className="section-desc">
            CICP denied over 6,300 claims. But most weren&apos;t denied because the injury wasn&apos;t real — they were denied for paperwork reasons that VICP&apos;s structure directly solves.
          </p>

          <div className="denial-bars">
            {[
              { reason: 'Missed 1-year filing deadline', pct: 39.4, count: '2,533', color: 'var(--warning)', fix: 'VICP allows 5 years + 8-year lookback' },
              { reason: 'Records not submitted', pct: 35.7, count: '2,291', color: 'var(--slate-gray)', fix: 'VICP covers attorney fees for documentation' },
              { reason: 'Standard of proof not met', pct: 19.5, count: '1,251', color: 'var(--danger)', fix: 'VICP uses lower standard + table injuries' },
              { reason: 'Not a covered product', pct: 4.0, count: '259', color: 'var(--primary-light)', fix: 'Wrong vaccine category' },
              { reason: 'Found eligible', pct: 1.4, count: '87', color: 'var(--success)', fix: '44 actually received payment' },
            ].map((d, i) => (
              <div key={i} className="denial-bar-row">
                <div className="denial-bar-info">
                  <span className="denial-bar-reason">{d.reason}</span>
                  <span className="denial-bar-count">{d.count} ({d.pct}%)</span>
                </div>
                <div className="denial-bar-track">
                  <div className="denial-bar-fill" style={{ width: `${(d.pct / 40) * 100}%`, backgroundColor: d.color }} />
                </div>
                <div className="denial-bar-fix">{d.fix}</div>
              </div>
            ))}
          </div>

          <div className="denial-insight">
            <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <p>Only <strong>19.5%</strong> of CICP denials were on the actual medical merits. The rest were procedural barriers — missed deadlines, missing documentation — that VICP eliminates through longer filing windows, attorney representation, and fee coverage.<sup><a href="#citations" className="citation-link">1</a></sup> <a href="/model#denials" onClick={() => track('cta_clicked', { location: 'denial_breakdown', type: 'view_model' })}>See full analysis →</a></p>
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
              <h3>{statistics.cicp_compensated?.value || '44'} Paid</h3>
              <p className="comparison-card-subtitle">of {statistics.cicp_claims_filed?.value || '14,075'} claims filed since 2020</p>

              <div className="comparison-stats">
                <div className="comparison-stat">
                  <div className="comparison-stat-number">{statistics.cicp_approval_rate?.value || '0.3%'}</div>
                  <div className="comparison-stat-label">Approval Rate<sup><a href="#citations" className="citation-link">1</a></sup></div>
                </div>
                <div className="comparison-stat">
                  <div className="comparison-stat-number">{statistics.cicp_total_paid?.value || '$6.5M'}</div>
                  <div className="comparison-stat-label">Total Paid<sup><a href="#citations" className="citation-link">1</a></sup></div>
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
              <h3>{statistics.vicp_total_compensated?.value || '12,889'} Paid</h3>
              <p className="comparison-card-subtitle">of {statistics.vicp_total_claims?.value || '~29,670'} claims since 1988</p>

              <div className="comparison-stats">
                <div className="comparison-stat">
                  <div className="comparison-stat-number">{statistics.vicp_approval_rate?.value || '~49%'}</div>
                  <div className="comparison-stat-label">Approval Rate<sup><a href="#citations" className="citation-link">2</a></sup></div>
                </div>
                <div className="comparison-stat">
                  <div className="comparison-stat-number">{statistics.vicp_total_paid?.value || '$4.97B'}</div>
                  <div className="comparison-stat-label">Total Paid<sup><a href="#citations" className="citation-link">2</a></sup></div>
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

      {/* Attorney Callout */}
      <section className="attorney-callout-section">
        <div className="section-inner">
          <div className="attorney-callout">
            <div className="attorney-callout-icon">⚖️</div>
            <div className="attorney-callout-content">
              <h3>Under VICP, You Get a Lawyer — and the Program Pays for It</h3>
              <p>CICP claimants must navigate the system alone. VICP covers reasonable attorney fees separately from your award — meaning legal representation doesn&apos;t cost you anything, even if your case is denied. This is the single biggest structural advantage for injured individuals.<sup><a href="#citations" className="citation-link">2</a></sup></p>
            </div>
          </div>
        </div>
      </section>

      {/* Outlier Section */}
      <section className="outlier-section" id="outlier">
        <div className="section-inner">
          <div className="outlier-hero">
            <span className="section-label">The Real Story</span>
            <div className="big-number">{statistics.cicp_total_paid?.value || '$6.5M'}</div>
            <p>CICP reports {statistics.cicp_total_paid?.value || '$6.5 million'} in total COVID compensation. But one payment tells a very different story.</p>
          </div>

          <div className="outlier-bar-visual">
            <div className="outlier-bar-header">
              <h4>Total CICP COVID-19 Vaccine Compensation</h4>
              <div className="total">$6.52 Million</div>
            </div>

            <div className="outlier-stacked-bar">
              <div className="outlier-segment single">
                <span className="amount">{statistics.cicp_outlier_payment?.value || '$5.94M'}</span>
                <span className="label">ONE Payment (91%)</span>
              </div>
              <div className="outlier-segment others">
                <span className="amount">9%</span>
              </div>
            </div>

            <div className="outlier-legend">
              <div className="outlier-legend-item">
                <div className="legend-dot gold"></div>
                <div className="legend-info">
                  <h5>Single TTS Case</h5>
                  <p>One case (Thrombosis with Thrombocytopenia Syndrome) received 91% of all COVID compensation</p>
                  <div className="highlight">{statistics.cicp_outlier_payment?.value || '$5.94 Million'}</div>
                </div>
              </div>
              <div className="outlier-legend-item">
                <div className="legend-dot navy"></div>
                <div className="legend-info">
                  <h5>Everyone Else Combined</h5>
                  <p>{(getNumeric('cicp_compensated') || 44) - 1} other compensated individuals split the remaining 9%</p>
                  <div className="highlight">{statistics.cicp_others_total?.value || '$575,442'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="reality-callout">
            <h3><AlertTriangle size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Without the Outlier</h3>
            <p>Remove that single {statistics.cicp_outlier_payment?.value || '$5.94M'} payment and the typical CICP compensation becomes clear. Here&apos;s what most injured Americans can actually expect:</p>
            <div className="reality-stats">
              <div className="reality-stat-card cicp">
                <div className="label">Typical CICP Payment</div>
                <div className="number">{statistics.cicp_median_payment?.value || '$4,132'}</div>
                <div className="note">COVID-19 median (HRSA Table 4)<sup><a href="#citations" className="citation-link">4</a></sup></div>
              </div>
              <div className="reality-stat-card vicp">
                <div className="label">Average VICP Award</div>
                <div className="number">{statistics.vicp_average_award?.value || '$386,000'}</div>
                <div className="note">Lifetime average 1988–2026 (HRSA)<sup><a href="#citations" className="citation-link">2</a></sup></div>
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
              <div className="median-bar-value">{statistics.cicp_median_payment?.value || '$4,132'}</div>
            </div>
            <div className="median-bar-row">
              <div className="median-bar-label">Average VICP</div>
              <div className="median-bar-track">
                <div className="median-bar-fill vicp"></div>
              </div>
              <div className="median-bar-value">{statistics.vicp_average_award?.value || '$386,000'}</div>
            </div>
            <div className="median-multiplier">
              Average VICP award is <span>93× higher</span> than typical CICP payment<sup><a href="#citations" className="citation-link">2,4</a></sup>
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
                  <div className="calc-note">VICP historical average: ~49%<sup><a href="#citations" className="citation-link">2</a></sup></div>
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
                    max="650000"
                    step="25000"
                    value={calcValues.award}
                    onChange={(e) => handleMainCalcChange('award', parseInt(e.target.value))}
                  />
                  <div className="calc-note">VICP lifetime average: ~$386,000<sup><a href="#citations" className="citation-link">2</a></sup></div>
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

      {/* Trust Fund Section — Interactive 10-Year Projection */}
      <section className="trustfund-section" id="trustfund">
        <div className="section-inner">
          <div className="trustfund-container">
            <div className="trustfund-header">
              <span className="section-label">Fiscal Impact</span>
              <h2 className="section-title">Can the Trust Fund Handle It?</h2>
              <p className="section-desc" style={{ margin: '0 auto', textAlign: 'center' }}>
                Not only can it handle it — it <strong>grows</strong>. Adjust the assumptions below to see for yourself.
              </p>
            </div>

            {/* Row 1: Backlog Overview */}
            <div className="fund-info-row">
              <div className="fund-info-card">
                <div className="fund-info-number">14,075</div>
                <div className="fund-info-label">COVID claims eligible to refile<sup><a href="#citations" className="citation-link" style={{ color: 'var(--accent)' }}>1</a></sup></div>
              </div>
              <div className="fund-info-card">
                <div className="fund-info-number">3,600</div>
                <div className="fund-info-label">Existing VICP pending cases<sup><a href="#citations" className="citation-link" style={{ color: 'var(--accent)' }}>2</a></sup></div>
              </div>
              <div className="fund-info-card">
                <div className="fund-info-number">17,675</div>
                <div className="fund-info-label">Total combined backlog</div>
              </div>
              <div className="fund-info-card">
                <div className="fund-info-number">
                  {yearsToComplete ? <span>~{yearsToComplete}<span className="fund-info-unit"> yrs</span></span> : <span style={{ color: 'var(--danger)', fontSize: '24px' }}>Need more masters</span>}
                </div>
                <div className="fund-info-label">To clear COVID backlog</div>
              </div>
            </div>

            {/* Row 2: Annual Throughput */}
            <div className="fund-info-row secondary">
              <div className="fund-info-card light">
                <div className="fund-info-number">{totalCapacityDerived.toLocaleString()}<span className="fund-info-unit">/yr</span></div>
                <div className="fund-info-label">Total capacity ({fundParams.specialMasters} masters × ~163 cases)<sup><a href="#citations" className="citation-link">2</a></sup></div>
              </div>
              <div className="fund-info-card light">
                <div className="fund-info-number">1,200<span className="fund-info-unit">/yr</span></div>
                <div className="fund-info-label">Ongoing VICP filings (FY24: 1,185 / FY25: 1,301)<sup><a href="#citations" className="citation-link">2</a></sup></div>
              </div>
              <div className="fund-info-card light">
                <div className="fund-info-number">218<span className="fund-info-unit">/yr</span></div>
                <div className="fund-info-label">New vaccine claims (RSV 150 + Shingles 43 + other)<sup><a href="#citations" className="citation-link">5,6</a></sup></div>
              </div>
              <div className="fund-info-card light">
                <div className="fund-info-number" style={{ color: netCovidCapacity > 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {netCovidCapacity > 0 ? netCovidCapacity.toLocaleString() : '0'}<span className="fund-info-unit">/yr</span>
                </div>
                <div className="fund-info-label">{netCovidCapacity > 0 ? 'Net capacity for backlog clearance' : 'No excess capacity — increase masters ↑'}</div>
              </div>
            </div>

            {/* Adjustable Parameters */}
            <div className="fund-sliders">
              <h4>Adjust Assumptions</h4>
              <div className="fund-slider-grid three">
                <div className="fund-slider-field">
                  <label>
                    Special Masters
                    <span>{fundParams.specialMasters}</span>
                  </label>
                  <input
                    type="range"
                    className="calc-slider"
                    min="8"
                    max="30"
                    value={fundParams.specialMasters}
                    onChange={(e) => setFundParams(p => ({ ...p, specialMasters: parseInt(e.target.value) }))}
                  />
                  <div className="calc-note">Current: 8 — Bill requires 10+ — Cost: ~${masterOverheadM.toFixed(1)}M/yr (CRS)</div>
                </div>
                <div className="fund-slider-field">
                  <label>
                    COVID Approval Rate
                    <span>{fundParams.approvalRate}%</span>
                  </label>
                  <input
                    type="range"
                    className="calc-slider"
                    min="20"
                    max="65"
                    value={fundParams.approvalRate}
                    onChange={(e) => setFundParams(p => ({ ...p, approvalRate: parseInt(e.target.value) }))}
                  />
                  <div className="calc-note">Validated estimate: 45%</div>
                </div>
                <div className="fund-slider-field">
                  <label>
                    Average COVID Award
                    <span>${fundParams.avgAward.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    className="calc-slider"
                    min="100000"
                    max="650000"
                    step="25000"
                    value={fundParams.avgAward}
                    onChange={(e) => setFundParams(p => ({ ...p, avgAward: parseInt(e.target.value) }))}
                  />
                  <div className="calc-note">Validated estimate: $325K</div>
                </div>
              </div>
            </div>

            {/* Current vs Proposed Comparison */}
            <div className="fund-current-vs-proposed">
              <div className="fund-comparison-card current">
                <div className="fund-comparison-label">Current Program ($0.75 excise)</div>
                <div className="fund-comparison-amounts">
                  <span>In: $308M</span>
                  <span>Out: $373M</span>
                  <span className="deficit">-$7M/yr deficit</span>
                </div>
                <div className="fund-comparison-note">Program is already slightly underwater with COVID + new vaccines<sup><a href="#citations" className="citation-link">2,9</a></sup></div>
              </div>
              <div className="fund-comparison-arrow">→</div>
              <div className="fund-comparison-card proposed">
                <div className="fund-comparison-label">Under Bill ($2.20 excise)</div>
                <div className="fund-comparison-amounts">
                  <span>In: $910M</span>
                  <span>Out: ${baseTotalOutflowsM}M</span>
                  <span className="surplus">+${baseSurplusM}M/yr surplus</span>
                </div>
                <div className="fund-comparison-note">Trust Fund grows from $4.5B to $12.1B over 10 years</div>
              </div>
            </div>

            {/* Dynamic Cash Flow Summary */}
            <div className="fund-flow-summary">
              <div className="fund-flow-card inflow">
                <div className="fund-flow-label">Annual Revenue</div>
                <div className="fund-flow-amount">$910M</div>
                <div className="fund-flow-detail">375M doses × $2.20 + interest</div>
              </div>
              <div className="fund-flow-arrow">→</div>
              <div className="fund-flow-card outflow">
                <div className="fund-flow-label">Annual Costs</div>
                <div className="fund-flow-amount">${baseTotalOutflowsM}M</div>
                <div className="fund-flow-detail">VICP $275M + COVID ${baseCovidCostM}M + New $55M</div>
              </div>
              <div className="fund-flow-arrow">=</div>
              <div className="fund-flow-card surplus">
                <div className="fund-flow-label">Annual Surplus</div>
                <div className="fund-flow-amount" style={{ color: baseSurplusM > 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {baseSurplusM > 0 ? '+' : ''}${baseSurplusM}M
                </div>
                <div className="fund-flow-detail">{baseSurplusM > 0 ? 'Fund grows every year' : 'Fund would shrink'}</div>
              </div>
            </div>

            {/* Dynamic 10-Year Bar Chart */}
            <div className="fund-projection" ref={fundTankRef}>
              <div className="fund-projection-header">
                <h4>10-Year Trust Fund Projection</h4>
                <div className="fund-projection-result">
                  Year 10: <strong>${yr10 ? yr10.balance.toFixed(1) : '11.9'}B</strong>
                </div>
              </div>
              <div className={`fund-projection-chart ${fundAnimated ? 'animated' : ''}`}>
                {fundProjection.map((d, i) => (
                  <div key={i} className="fund-bar-col">
                    <div className="fund-bar-value">${d.balance.toFixed(1)}B</div>
                    <div className="fund-bar-track">
                      <div
                        className="fund-bar-fill"
                        style={{
                          height: fundAnimated ? `${(d.balance / 15) * 100}%` : '0%',
                          transitionDelay: `${i * 0.08}s`,
                          background: d.balance < 4.5 ? 'var(--danger)' : undefined
                        }}
                      />
                    </div>
                    <div className="fund-bar-year">{d.year === 0 ? 'Now' : `Yr ${d.year}`}</div>
                  </div>
                ))}
              </div>
              <div className="fund-projection-footer">
                <span>COVID backlog at Year 10: <strong>{yr10 ? yr10.covidBacklog.toLocaleString() : '12,005'}</strong></span>
                <span>VICP backlog at Year 10: <strong>{yr10 ? yr10.vicpBacklog.toLocaleString() : '0'}</strong></span>
                <span>Net COVID capacity: <strong>~{netCovidCapacity}/yr</strong></span>
              </div>
            </div>

            <div className="fund-insight">
              <h4>The Fund Doesn&apos;t Just Survive — It Thrives</h4>
              <p>Revenue from new vaccine excise taxes (~$73M) more than covers new vaccine claims ($55M). Processing constraints spread COVID liability over {yearsToComplete ? `~${yearsToComplete}` : 'many'} years. <a href="/model" onClick={() => track('cta_clicked', { location: 'trustfund', type: 'view_model' })}>See the full financial model →</a></p>
            </div>
          </div>
        </div>
      </section>

      {/* Proposed Legislation Section — HIDDEN until bill number is finalized
      <section className="legislation-section" id="legislation">
        <div className="section-inner">
          <span className="section-label">The Solution</span>
          <h2 className="section-title">What the Proposed Legislation Does</h2>
          <p className="section-desc" style={{ margin: '0 auto', textAlign: 'center' }}>
            Bipartisan legislation is being developed to move COVID-19 vaccine injuries from CICP to VICP. Here are the key provisions under consideration.
          </p>

          <div className="legislation-grid">
            <div className="legislation-card">
              <div className="legislation-icon">🏛️</div>
              <h4>Expands Special Masters</h4>
              <p>Increases the minimum number of special masters from 8 to at least 10, with authority for more as needed to reduce backlogs.</p>
            </div>
            <div className="legislation-card">
              <div className="legislation-icon">💉</div>
              <h4>Adds COVID Vaccines to VICP</h4>
              <p>Moves COVID-19 vaccine injury claims from CICP to VICP, giving claimants access to federal court, attorneys, and judicial review.</p>
            </div>
            <div className="legislation-card">
              <div className="legislation-icon">📋</div>
              <h4>Creates Table Injuries</h4>
              <p>Adds myocarditis, pericarditis, GBS, TTS, anaphylaxis, and SIRVA to the Vaccine Injury Table — establishing presumptive causation.</p>
            </div>
            <div className="legislation-card">
              <div className="legislation-icon">⏰</div>
              <h4>Extends Filing Deadline</h4>
              <p>Increases the statute of limitations to 5 years with an 8-year lookback period, giving COVID claimants who missed CICP&apos;s 1-year window a second chance.</p>
            </div>
            <div className="legislation-card">
              <div className="legislation-icon">💰</div>
              <h4>Raises Benefit Caps</h4>
              <p>Increases the death benefit and pain &amp; suffering cap from $250,000 to $600,000 + CPI adjustment, reflecting current costs.</p>
            </div>
            <div className="legislation-card">
              <div className="legislation-icon">🔬</div>
              <h4>Covers New Vaccines</h4>
              <p>Adds RSV, Shingles, and Dengue vaccines to VICP coverage. Also includes a catch-all for future vaccines recommended by CDC.</p>
            </div>
          </div>

          <div className="legislation-funding">
            <h4>How It&apos;s Funded</h4>
            <p>The excise tax on vaccine doses increases from $0.75 to $2.20 — generating an estimated <strong>$825M per year</strong> in Trust Fund revenue. Combined with interest income, the program produces a <strong>$518M annual surplus</strong> while covering all existing and new claims.<sup><a href="#citations" className="citation-link">2,10</a></sup></p>
            <a href="/model" className="legislation-model-link" onClick={() => track('cta_clicked', { location: 'legislation', type: 'view_model' })}>
              See the full financial model →
            </a>
          </div>

          <p className="legislation-note">
            <em>Note: Final bill language and number are pending. Provisions shown reflect the current legislative framework under development.</em>
          </p>
        </div>
      </section>
      END Proposed Legislation Section */}

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
                    <p>Currently, Americans injured by COVID-19 vaccines must file claims through the Countermeasures Injury Compensation Program (CICP), which has a 0.3% approval rate compared to VICP&apos;s ~49%. CICP offers no judicial review, no pain and suffering damages, and requires claimants to pay their own attorney fees.</p>
                    <p>Fair compensation for vaccine injuries is not a partisan issue. It&apos;s about keeping our promise to Americans who did their part during a public health emergency.</p>
                    <p>Thank you for your consideration.</p>
                  </div>
                  <button
                    className="copy-message-btn"
                    onClick={(e) => {
                      const message = `Dear [Representative/Senator],\n\nI am writing to urge you to support legislation that would add COVID-19 vaccines to the National Vaccine Injury Compensation Program (VICP).\n\nCurrently, Americans injured by COVID-19 vaccines must file claims through the Countermeasures Injury Compensation Program (CICP), which has a 0.3% approval rate compared to VICP's ~49%. CICP offers no judicial review, no pain and suffering damages, and requires claimants to pay their own attorney fees.\n\nFair compensation for vaccine injuries is not a partisan issue. It's about keeping our promise to Americans who did their part during a public health emergency.\n\nThank you for your consideration.`
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
      <section className="subscribe-section" id="subscribe">
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
      <Footer />

      {/* CICP Roulette Modal */}
      {rouletteOpen && (
        <div
          className="modal-overlay"
          onClick={closeRoulette}
          role="dialog"
          aria-modal="true"
          aria-labelledby="roulette-modal-title"
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 id="roulette-modal-title" className="sr-only">CICP Roulette Game</h2>
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
