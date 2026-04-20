'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { track } from '@vercel/analytics'
import Header from '../components/Header'
import Footer from '../components/Footer'
import {
  TrendingUp,
  DollarSign,
  Scale,
  CheckCircle2,
  ArrowRight,
  FileText,
  Shield,
  BarChart3,
  AlertTriangle,
  Clock,
  Landmark
} from 'lucide-react'

export default function FinancialModelPage() {
  const [activeScenario, setActiveScenario] = useState<'A' | 'B' | 'C'>('B')
  const [scrollProgress, setScrollProgress] = useState(0)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress((scrollTop / docHeight) * 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set(prev).add(entry.target.id))
          }
        })
      },
      { threshold: 0.15 }
    )

    document.querySelectorAll('.model-animate').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const isVisible = (id: string) => visibleSections.has(id)

  const scenarios = {
    A: {
      name: 'Conservative',
      desc: 'Existing VICP backlog has priority over new COVID filings. COVID claims queue behind existing cases.',
      covidStart: 'Year 9',
      claimsBy10: '293',
      yearsToComplete: '~33',
      tenYearOutlays: '$95M',
      fundBalance: '$12.55B',
    },
    B: {
      name: 'Base Case',
      desc: 'COVID claims enter the queue immediately upon filing. Special masters process all claim types concurrently.',
      covidStart: 'Year 1',
      claimsBy10: '1,913',
      yearsToComplete: '~25',
      tenYearOutlays: '$620M',
      fundBalance: '$11.97B',
    },
    C: {
      name: 'Realistic',
      desc: 'Table injuries (myocarditis, GBS, TTS) are fast-tracked starting Year 1. Off-table injuries wait until backlog stabilizes.',
      covidStart: 'Year 1 (table)',
      claimsBy10: '3,451',
      yearsToComplete: '~18–20',
      tenYearOutlays: '$1.18B',
      fundBalance: '$11.37B',
    },
  }

  const s = scenarios[activeScenario]

  return (
    <div>
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />
      <Header activePage="model" />

      {/* Hero */}
      <section className="model-hero">
        <div className="model-hero-inner">
          <span className="model-badge">
            <Landmark size={16} /> H.R. 5142 — Vaccine Injury Compensation Modernization Act
          </span>
          <h1 className="model-hero-title">The Numbers Work.</h1>
          <p className="model-hero-subtitle">
            A validated financial model demonstrating that the VICP Trust Fund can absorb all COVID-19 vaccine injury claims while growing from <strong>$4.5 billion to $12.1 billion</strong> over 10 years — with a <strong>$537 million annual surplus</strong>.
          </p>
          <div className="model-hero-meta">
            <span>Data current as of March 2026</span>
          </div>
        </div>
      </section>

      {/* Key Findings */}
      <section className="model-animate model-findings-section" id="findings">
        <div className="section-inner">
          <div className={`model-findings ${isVisible('findings') ? 'animate' : ''}`}>
            <div className="model-finding-card access">
              <div className="model-finding-icon"><Scale size={28} /></div>
              <div className="model-finding-number">0.3% → 45%</div>
              <div className="model-finding-label">Approval Rate Under VICP</div>
              <div className="model-finding-detail">150× more likely to be compensated</div>
            </div>
            <div className="model-finding-card growth">
              <div className="model-finding-icon"><TrendingUp size={28} /></div>
              <div className="model-finding-number">14,075</div>
              <div className="model-finding-label">Americans Waiting</div>
              <div className="model-finding-detail">CICP claimants eligible to refile under VICP</div>
            </div>
            <div className="model-finding-card surplus">
              <div className="model-finding-icon"><DollarSign size={28} /></div>
              <div className="model-finding-number">$537M</div>
              <div className="model-finding-label">Projected Annual Surplus<sup><a href="#sources" style={{ color: 'var(--success)', textDecoration: 'none' }}>*</a></sup></div>
              <div className="model-finding-detail">Based on $2.20 excise rate per H.R. 5142<sup><a href="https://www.congress.gov/bill/118th-congress/house-bill/5142/text" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--success)', textDecoration: 'none' }}>10</a></sup></div>
            </div>
          </div>
        </div>
      </section>

      {/* Step 1: Revenue */}
      <section className="model-animate model-revenue-section" id="revenue">
        <div className="section-inner">
          <div className="model-step-header">
            <span className="model-step-number">01</span>
            <span className="section-label">Annual Revenue</span>
          </div>
          <h2 className="section-title">Where the Money Comes From</h2>
          <p className="section-desc">
            Every vaccine dose administered in the U.S. carries an excise tax that funds the VICP Trust Fund. H.R. 5142 raises the rate from $0.75 to $2.20 per dose and adds new vaccines to the program.
          </p>

          <div className={`model-revenue-grid ${isVisible('revenue') ? 'animate' : ''}`}>
            <div className="model-revenue-breakdown">
              <h4>Dose Volume Breakdown</h4>
              <div className="model-calc-row">
                <span>Current VICP vaccines</span>
                <span className="model-calc-value">297M doses/yr</span>
              </div>
              <div className="model-calc-row new">
                <span>+ COVID-19 vaccines</span>
                <span className="model-calc-value">~50M doses/yr</span>
              </div>
              <div className="model-calc-row new">
                <span>+ RSV vaccines</span>
                <span className="model-calc-value">~15M doses/yr</span>
              </div>
              <div className="model-calc-row new">
                <span>+ Shingles vaccines</span>
                <span className="model-calc-value">~17M doses/yr</span>
              </div>
              <div className="model-calc-row total">
                <span>Total annual doses</span>
                <span className="model-calc-value">~375M</span>
              </div>
              <div className="model-calc-row highlight">
                <span>× $2.20 excise per dose</span>
                <span className="model-calc-value">= $825M</span>
              </div>
            </div>

            <div className="model-revenue-total">
              <div className="model-total-card">
                <h4>Total Annual Inflows</h4>
                <div className="model-total-row">
                  <span>Excise tax revenue</span>
                  <span>$825M</span>
                </div>
                <div className="model-total-row">
                  <span>Interest income</span>
                  <span>$85M</span>
                </div>
                <div className="model-total-row grand">
                  <span>Total</span>
                  <span>$910M</span>
                </div>
              </div>
              <p className="model-source-note">Sources: HRSA Dose Distribution Table (2006–2024), CDC COVIDVaxView, CDC MMWR</p>
            </div>
          </div>
        </div>
      </section>

      {/* Step 2: Costs */}
      <section className="model-animate model-costs-section" id="costs">
        <div className="section-inner">
          <div className="model-step-header">
            <span className="model-step-number">02</span>
            <span className="section-label">Annual Costs</span>
          </div>
          <h2 className="section-title">Where the Money Goes</h2>
          <p className="section-desc">
            Annual outflows cover existing VICP claims, new COVID-19 claims (capacity-constrained), and claims from newly covered vaccines like RSV and Shingles.
          </p>

          <div className={`model-costs-grid ${isVisible('costs') ? 'animate' : ''}`}>
            <div className="model-cost-card">
              <div className="model-cost-header">
                <h4>Existing VICP</h4>
                <div className="model-cost-amount">$275M</div>
              </div>
              <div className="model-cost-detail">
                <div className="model-calc-row">
                  <span>FY2024 baseline</span>
                  <span className="model-calc-value">$204M</span>
                </div>
                <div className="model-calc-row">
                  <span>× 1.35 benefit increase</span>
                  <span className="model-calc-value">$275M</span>
                </div>
                <p className="model-cost-note">Bill raises death benefit and P&amp;S caps from $250K → $600K + CPI. Most claims don&apos;t hit the cap — only ~20% of claims are affected.</p>
              </div>
            </div>

            <div className="model-cost-card">
              <div className="model-cost-header">
                <h4>COVID-19 Claims</h4>
                <div className="model-cost-amount">$30M</div>
              </div>
              <div className="model-cost-detail">
                <div className="model-calc-row">
                  <span>Net COVID capacity</span>
                  <span className="model-calc-value">207/yr</span>
                </div>
                <div className="model-calc-row">
                  <span>× 45% approval rate</span>
                  <span className="model-calc-value">93 approved</span>
                </div>
                <div className="model-calc-row">
                  <span>× $325K avg award</span>
                  <span className="model-calc-value">$30M</span>
                </div>
                <p className="model-cost-note">10 masters (1,625 capacity) must handle 1,200 ongoing VICP + 218 new vaccine filings, leaving 207 slots for COVID claims.</p>
              </div>
            </div>

            <div className="model-cost-card">
              <div className="model-cost-header">
                <h4>New Vaccines</h4>
                <div className="model-cost-amount">$55M</div>
              </div>
              <div className="model-cost-detail">
                <div className="model-calc-row">
                  <span>RSV (GBS risk)</span>
                  <span className="model-calc-value">$40M</span>
                </div>
                <div className="model-calc-row">
                  <span>Shingles</span>
                  <span className="model-calc-value">$6M</span>
                </div>
                <div className="model-calc-row">
                  <span>Dengue + catch-all</span>
                  <span className="model-calc-value">$9M</span>
                </div>
                <p className="model-cost-note">RSV is the largest new risk — FDA required a GBS warning on RSV vaccines in January 2025.</p>
              </div>
            </div>
          </div>

          <div className="model-costs-total">
            <div className="model-costs-total-inner">
              <span>Total Annual Outflows</span>
              <span className="model-costs-total-amount">$373M</span>
            </div>
          </div>
        </div>
      </section>

      {/* Step 3: The Surplus */}
      <section className="model-animate model-surplus-section" id="surplus">
        <div className="section-inner">
          <div className="model-step-header">
            <span className="model-step-number">03</span>
            <span className="section-label" style={{ color: 'var(--accent)' }}>The Bottom Line</span>
          </div>
          <h2 className="section-title" style={{ color: 'white' }}>$537 Million Annual Surplus</h2>
          <p className="section-desc" style={{ color: 'rgba(255,255,255,0.8)' }}>
            The Trust Fund doesn&apos;t just survive adding COVID vaccines — it grows substantially every single year.
          </p>

          <div className={`model-surplus-visual ${isVisible('surplus') ? 'animate' : ''}`}>
            <div className="model-surplus-bar-group">
              <div className="model-surplus-bar-row">
                <div className="model-surplus-label">Annual Inflows</div>
                <div className="model-surplus-bar-track">
                  <div className="model-surplus-bar inflows" style={{ width: isVisible('surplus') ? '100%' : '0%' }}>
                    <span>$910M</span>
                  </div>
                </div>
              </div>
              <div className="model-surplus-bar-row">
                <div className="model-surplus-label">Annual Outflows</div>
                <div className="model-surplus-bar-track">
                  <div className="model-surplus-bar outflows" style={{ width: isVisible('surplus') ? '41%' : '0%' }}>
                    <span>$373M</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="model-surplus-result">
              <ArrowRight size={24} />
              <div className="model-surplus-amount">
                <div className="model-surplus-number">+$537M</div>
                <div className="model-surplus-sublabel">net surplus per year</div>
              </div>
            </div>
          </div>

          <div className="model-surplus-context">
            <div className="model-context-card">
              <CheckCircle2 size={20} />
              <p>COVID claims represent only <strong>8%</strong> of annual outflows ($30M of $373M)</p>
            </div>
            <div className="model-context-card">
              <CheckCircle2 size={20} />
              <p>New vaccine excise revenue (<strong>~$73M</strong>) exceeds new vaccine claims (<strong>$55M</strong>)</p>
            </div>
            <div className="model-context-card">
              <CheckCircle2 size={20} />
              <p>Processing constraints spread COVID liability over <strong>~68 years</strong> at 10 masters — adding more masters accelerates this dramatically</p>
            </div>
          </div>
        </div>
      </section>

      {/* Step 4: 10-Year Projection */}
      <section className="model-animate model-projection-section" id="projection">
        <div className="section-inner">
          <div className="model-step-header">
            <span className="model-step-number">04</span>
            <span className="section-label">10-Year Outlook</span>
          </div>
          <h2 className="section-title">Trust Fund Growth Trajectory</h2>
          <p className="section-desc">
            With CPI adjustments growing both inflows and outflows at roughly equal rates, the surplus remains stable year over year. The Trust Fund nearly triples.
          </p>

          <div className={`model-projection-chart ${isVisible('projection') ? 'animate' : ''}`}>
            {[
              { year: 0, balance: 4.5, label: '$4.5B' },
              { year: 1, balance: 5.12, label: '$5.1B' },
              { year: 2, balance: 5.77, label: '$5.8B' },
              { year: 3, balance: 6.45, label: '$6.5B' },
              { year: 4, balance: 7.16, label: '$7.2B' },
              { year: 5, balance: 7.9, label: '$7.9B' },
              { year: 6, balance: 8.67, label: '$8.7B' },
              { year: 7, balance: 9.48, label: '$9.5B' },
              { year: 8, balance: 10.32, label: '$10.3B' },
              { year: 9, balance: 11.2, label: '$11.2B' },
              { year: 10, balance: 12.11, label: '$12.1B' },
            ].map((d) => (
              <div key={d.year} className="model-bar-col">
                <div className="model-bar-value">{d.label}</div>
                <div className="model-bar-track">
                  <div
                    className="model-bar-fill"
                    style={{
                      height: isVisible('projection') ? `${(d.balance / 12.5) * 100}%` : '0%',
                      transitionDelay: `${d.year * 0.08}s`
                    }}
                  />
                </div>
                <div className="model-bar-year">{d.year === 0 ? 'Now' : `Yr ${d.year}`}</div>
              </div>
            ))}
          </div>

          <div className="model-projection-summary">
            <div className="model-proj-stat">
              <div className="number">$7.61B</div>
              <div className="label">Total surplus accumulated</div>
            </div>
            <div className="model-proj-stat">
              <div className="number">2,070</div>
              <div className="label">COVID claims processed (10 yrs)</div>
            </div>
            <div className="model-proj-stat">
              <div className="number">12,005</div>
              <div className="label">COVID claims still remaining</div>
            </div>
          </div>
        </div>
      </section>

      {/* Step 5: Processing Scenarios */}
      <section className="model-animate model-scenarios-section" id="scenarios">
        <div className="section-inner">
          <div className="model-step-header">
            <span className="model-step-number">05</span>
            <span className="section-label">Processing Scenarios</span>
          </div>
          <h2 className="section-title">Three Paths, Same Result: Solvency</h2>
          <p className="section-desc">
            Regardless of how COVID claims are prioritized against the existing backlog, the Trust Fund remains solvent under all scenarios.
          </p>

          <div className="model-scenario-tabs">
            {(['A', 'B', 'C'] as const).map((key) => (
              <button
                key={key}
                className={`model-scenario-tab ${activeScenario === key ? 'active' : ''}`}
                onClick={() => { setActiveScenario(key); track('model_scenario', { scenario: key }) }}
              >
                {scenarios[key].name}
              </button>
            ))}
          </div>

          <div className="model-scenario-detail">
            <p className="model-scenario-desc">{s.desc}</p>
            <div className="model-scenario-metrics">
              <div className="model-scenario-metric">
                <Clock size={20} />
                <div className="metric-info">
                  <div className="metric-value">{s.covidStart}</div>
                  <div className="metric-label">COVID processing begins</div>
                </div>
              </div>
              <div className="model-scenario-metric">
                <FileText size={20} />
                <div className="metric-info">
                  <div className="metric-value">{s.claimsBy10}</div>
                  <div className="metric-label">Claims compensated by Year 10</div>
                </div>
              </div>
              <div className="model-scenario-metric">
                <BarChart3 size={20} />
                <div className="metric-info">
                  <div className="metric-value">{s.yearsToComplete}</div>
                  <div className="metric-label">Years to complete all COVID claims</div>
                </div>
              </div>
              <div className="model-scenario-metric">
                <DollarSign size={20} />
                <div className="metric-info">
                  <div className="metric-value">{s.tenYearOutlays}</div>
                  <div className="metric-label">10-year COVID outlays</div>
                </div>
              </div>
              <div className="model-scenario-metric highlight">
                <Shield size={20} />
                <div className="metric-info">
                  <div className="metric-value">{s.fundBalance}</div>
                  <div className="metric-label">Year 10 Trust Fund balance</div>
                </div>
              </div>
            </div>
          </div>

          <div className="model-scenario-insight">
            <Shield size={20} />
            <p>All three scenarios produce a Year 10 Trust Fund balance between <strong>$11.37B and $12.55B</strong>. The processing approach primarily affects claimant wait times, not program solvency.</p>
          </div>
        </div>
      </section>

      {/* Step 6: Table Injury Bulk Settlement */}
      <section className="model-animate model-bulk-section" id="bulk-settlement">
        <div className="section-inner">
          <div className="model-step-header">
            <span className="model-step-number">06</span>
            <span className="section-label">Accelerated Resolution</span>
          </div>
          <h2 className="section-title">Table Injury Bulk Settlement</h2>
          <p className="section-desc">
            The bill adds table injuries (myocarditis, GBS, TTS) with presumptive causation. These claims could be resolved through flat-rate administrative settlement without consuming special master time — dramatically reducing the backlog.
          </p>

          <div className="model-bulk-table">
            <div className="model-bulk-row header">
              <div>Scenario</div>
              <div>Table Claims</div>
              <div>Bulk Cost ($250K each)</div>
              <div>Remaining for Masters</div>
              <div>Years (10 masters)</div>
              <div>Trust Fund Low</div>
            </div>
            {[
              { scenario: 'No bulk (base)', tableClaims: '0', bulkCost: '$0', remaining: '14,075', years: '~68', fundLow: '$4.50B (no dip)' },
              { scenario: '30% table injury', tableClaims: '4,222', bulkCost: '$1.06B', remaining: '9,853', years: '~48', fundLow: '$4.07B' },
              { scenario: '50% table injury', tableClaims: '7,038', bulkCost: '$1.76B', remaining: '7,037', years: '~34', fundLow: '$3.36B' },
              { scenario: '70% table injury', tableClaims: '9,852', bulkCost: '$2.46B', remaining: '4,223', years: '~20', fundLow: '$2.66B' },
              { scenario: '50% + 20 masters', tableClaims: '7,038', bulkCost: '$1.76B', remaining: '7,037', years: '~4', fundLow: '$3.11B' },
            ].map((row, i) => (
              <div key={i} className={`model-bulk-row ${i === 4 ? 'highlight' : ''}`}>
                <div className="model-bulk-scenario">{row.scenario}</div>
                <div>{row.tableClaims}</div>
                <div>{row.bulkCost}</div>
                <div>{row.remaining}</div>
                <div>{row.years}</div>
                <div>{row.fundLow}</div>
              </div>
            ))}
          </div>

          <div className="model-bulk-insight">
            <Shield size={20} />
            <p>At <strong>50% table injury eligibility with 20 masters</strong>, the entire COVID backlog clears in ~4 years. The Trust Fund never drops below $3.1B and recovers to $4.5B within ~2 years after clearing all claims. Bulk settlement front-loads cost but eliminates decades of processing.</p>
          </div>
        </div>
      </section>

      {/* Step 7: Accelerated Processing Stress Test */}
      <section className="model-animate model-accel-section" id="accelerated">
        <div className="section-inner">
          <div className="model-step-header">
            <span className="model-step-number">07</span>
            <span className="section-label">Maximum Stress Test</span>
          </div>
          <h2 className="section-title">What If We Process Everything as Fast as Possible?</h2>
          <p className="section-desc">
            30 masters, 65% approval rate, $500K average awards — the most aggressive scenario imaginable. Can the Trust Fund survive?
          </p>

          <div className="model-accel-params">
            <div className="model-accel-param">
              <span className="label">Special masters</span>
              <span className="value">30</span>
            </div>
            <div className="model-accel-param">
              <span className="label">Net COVID capacity</span>
              <span className="value">3,457/yr</span>
            </div>
            <div className="model-accel-param">
              <span className="label">Approval rate</span>
              <span className="value">65%</span>
            </div>
            <div className="model-accel-param">
              <span className="label">Average award</span>
              <span className="value">$500K</span>
            </div>
            <div className="model-accel-param highlight">
              <span className="label">Annual COVID payout</span>
              <span className="value">$1,124M</span>
            </div>
          </div>

          <div className="model-accel-table">
            <div className="model-accel-row header">
              <div>Year</div>
              <div>Start</div>
              <div>Inflows</div>
              <div>COVID Pay</div>
              <div>Other Out</div>
              <div>Interest</div>
              <div>End</div>
              <div>COVID Left</div>
            </div>
            {[
              { yr: 1, start: '$4.50B', inflows: '$910M', covid: '$1,124M', other: '$368M', interest: '$76M', end: '$3.99B', left: '10,618' },
              { yr: 2, start: '$3.99B', inflows: '$937M', covid: '$1,124M', other: '$379M', interest: '$67M', end: '$3.49B', left: '7,161' },
              { yr: 3, start: '$3.49B', inflows: '$965M', covid: '$1,124M', other: '$390M', interest: '$58M', end: '$3.00B', left: '3,704' },
              { yr: 4, start: '$3.00B', inflows: '$994M', covid: '$1,124M', other: '$402M', interest: '$50M', end: '$2.52B', left: '247' },
              { yr: 5, start: '$2.52B', inflows: '$1,024M', covid: '$80M', other: '$414M', interest: '$42M', end: '$3.09B', left: '0' },
              { yr: 6, start: '$3.09B', inflows: '$1,055M', covid: '$0', other: '$426M', interest: '$52M', end: '$3.77B', left: '0' },
              { yr: 7, start: '$3.77B', inflows: '$1,086M', covid: '$0', other: '$439M', interest: '$63M', end: '$4.48B', left: '0' },
              { yr: 8, start: '$4.48B', inflows: '$1,119M', covid: '$0', other: '$452M', interest: '$75M', end: '$5.22B', left: '0' },
              { yr: 9, start: '$5.22B', inflows: '$1,152M', covid: '$0', other: '$466M', interest: '$87M', end: '$5.99B', left: '0' },
              { yr: 10, start: '$5.99B', inflows: '$1,187M', covid: '$0', other: '$480M', interest: '$100M', end: '$6.80B', left: '0' },
            ].map((row, i) => (
              <div key={i} className={`model-accel-row ${row.yr === 4 ? 'low-point' : ''} ${row.yr === 5 ? 'cleared' : ''}`}>
                <div>{row.yr}</div>
                <div>{row.start}</div>
                <div>{row.inflows}</div>
                <div className="covid-pay">{row.covid}</div>
                <div>{row.other}</div>
                <div>{row.interest}</div>
                <div className="end-balance">{row.end}</div>
                <div>{row.left}</div>
              </div>
            ))}
          </div>

          <div className="model-accel-result">
            <CheckCircle2 size={24} />
            <div>
              <h4>The Trust Fund never goes negative.</h4>
              <p>Low point: <strong>$2.52B</strong> at end of Year 4 (56% of starting balance). All COVID claims cleared by Year 5. Fund recovers to starting balance by Year 7 and reaches <strong>$6.80B</strong> by Year 10.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Step 8: CICP Denial Breakdown */}
      <section className="model-animate model-denial-section" id="denials">
        <div className="section-inner">
          <div className="model-step-header">
            <span className="model-step-number">08</span>
            <span className="section-label">Why 45% Approval Makes Sense</span>
          </div>
          <h2 className="section-title">CICP&apos;s 1.4% Eligibility Rate Is Misleading</h2>
          <p className="section-desc">
            CICP denied 6,334 of 6,421 decided claims. But only 19.5% were denied on the actual merits of the case. The rest were procedural failures that VICP&apos;s structure directly solves.
          </p>

          <div className={`model-denial-bars ${isVisible('denials') ? 'animate' : ''}`}>
            {[
              { reason: 'Missed 1-year filing deadline', count: '2,533', pct: 39.4, color: 'var(--warning)', vicp: 'VICP allows 5-year SOL + 8-year lookback' },
              { reason: 'Records not submitted', count: '2,291', pct: 35.7, color: 'var(--slate-gray)', vicp: 'VICP covers attorney fees to help with documentation' },
              { reason: 'Standard of proof not met', count: '1,251', pct: 19.5, color: 'var(--danger)', vicp: 'VICP uses lower "preponderance" standard + table injuries' },
              { reason: 'Not a covered product', count: '259', pct: 4.0, color: 'var(--primary-light)', vicp: 'Not applicable — wrong vaccine category' },
              { reason: 'Found eligible for compensation', count: '87', pct: 1.4, color: 'var(--success)', vicp: '44 actually received payment' },
            ].map((d, i) => (
              <div key={i} className="model-denial-row">
                <div className="model-denial-info">
                  <div className="model-denial-reason">{d.reason}</div>
                  <div className="model-denial-count">{d.count} claims ({d.pct}%)</div>
                </div>
                <div className="model-denial-bar-track">
                  <div
                    className="model-denial-bar-fill"
                    style={{
                      width: isVisible('denials') ? `${(d.pct / 40) * 100}%` : '0%',
                      backgroundColor: d.color,
                      transitionDelay: `${i * 0.12}s`
                    }}
                  />
                </div>
                <div className="model-denial-note">{d.vicp}</div>
              </div>
            ))}
          </div>

          <div className="model-denial-insight">
            <AlertTriangle size={20} />
            <div>
              <p><strong>75% of CICP decisions were procedural denials</strong> — missed deadlines and missing documentation. VICP directly addresses this with longer filing windows, attorney representation, and fee coverage.</p>
              <p className="model-denial-sub">Merits-only approval rate: 87 eligible out of 1,338 merits-based decisions = <strong>6.5%</strong>. VICP&apos;s table injury presumptions and settlement culture (60% of awards are settlements) raise this substantially.</p>
            </div>
          </div>

          <div className="model-vicp-advantages">
            <h4>VICP Structural Advantages Over CICP</h4>
            <div className="model-advantage-grid">
              {[
                { label: 'Standard of Proof', cicp: '"Compelling, reliable, valid medical evidence"', vicp: 'Preponderance of evidence (>50% likely)' },
                { label: 'Table Injuries', cicp: 'No injury table for COVID vaccines', vicp: 'Myocarditis, GBS, TTS, anaphylaxis, SIRVA presumed' },
                { label: 'Legal Representation', cicp: 'Claimant pays own attorney fees', vicp: 'Program pays reasonable attorney fees' },
                { label: 'Judicial Review', cicp: 'None — HHS is judge and defendant', vicp: 'Federal Court of Claims with appellate rights' },
                { label: 'Filing Deadline', cicp: '1 year from vaccination', vicp: '5 years (bill extends from 3) + 8-year lookback' },
              ].map((row, i) => (
                <div key={i} className="model-advantage">
                  <div className="model-advantage-label">{row.label}</div>
                  <div className="model-advantage-compare">
                    <span className="cicp"><span className="tag">CICP</span> {row.cicp}</span>
                    <span className="vicp"><span className="tag">VICP</span> {row.vicp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sources */}
      <section className="model-animate model-sources-section" id="sources">
        <div className="section-inner">
          <span className="section-label">Data Sources</span>
          <h2 className="section-title">Every Number Has a Source</h2>

          <div className="model-sources-grid">
            {[
              { title: 'HRSA VICP Monthly Statistics Report', date: 'March 1, 2026', desc: 'Petitions filed, adjudications, awards paid, dose distribution', url: 'https://www.hrsa.gov/sites/default/files/hrsa/vicp/vicp-stats-03-01-26.pdf' },
              { title: 'HRSA CICP Data', date: 'January 1, 2026', desc: 'COVID claims filed, decisions, denial reasons, compensation', url: 'https://www.hrsa.gov/cicp/cicp-data' },
              { title: 'GAO Report GAO-25-107368', date: 'December 2024', desc: 'CICP processing times, staffing, and challenges', url: 'https://www.gao.gov/products/gao-25-107368' },
              { title: 'CDC MMWR — RSV Vaccine Safety', date: 'July 2024', desc: 'RSV vaccine GBS rates: 4.4–6.5 per million doses', url: 'https://www.cdc.gov/mmwr/volumes/73/wr/mm7321a3.htm' },
              { title: 'FDA Safety Communication', date: 'January 2025', desc: 'RSV vaccine GBS warning requirement for Abrysvo and Arexvy', url: 'https://www.fda.gov/safety/medical-product-safety-information/fda-requires-guillain-barre-syndrome-gbs-warning-prescribing-information-rsv-vaccines-abrysvo-and' },
              { title: 'Zhao et al. (2022)', date: 'Journal of Law & Biosciences', desc: 'Trust Fund interest income analysis and historical data', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8977129/' },
              { title: 'CRS IF12625 & IF13011', date: 'Judiciary Budget Requests', desc: 'Office of Special Masters budget: $10M/yr (8 masters) → ~$1.25M per master', url: 'https://www.everycrsreport.com/reports/IF13011.html' },
              { title: 'H.R. 5142 — Full Bill Text', date: '118th Congress', desc: 'Vaccine Injury Compensation Modernization Act — excise, special masters, COVID coverage', url: 'https://www.congress.gov/bill/118th-congress/house-bill/5142/text' },
              { title: '42 U.S.C. 300aa-12', date: 'U.S. Code', desc: 'Statutory salary caps for special masters (Executive Schedule Level IV/V)', url: 'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title42-section300aa-12&num=0&edition=prelim' },
            ].map((src, i) => (
              <div key={i} className="model-source-card">
                <h4>{src.title}</h4>
                <p className="model-source-date">{src.date}</p>
                <p>{src.desc}</p>
                <a href={src.url} target="_blank" rel="noopener noreferrer" onClick={() => track('source_clicked', { source: src.title })}>
                  View Source <ArrowRight size={14} />
                </a>
              </div>
            ))}
          </div>

          <p className="model-sources-footer">
            Complete data repository: <Link href="/resources">covidvaccineinjury.us/resources</Link>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="model-cta-section">
        <div className="section-inner" style={{ textAlign: 'center' }}>
          <h2 className="section-title" style={{ color: 'white' }}>The Math Is Clear.<br />The Question Is Political Will.</h2>
          <p className="model-cta-desc">
            The VICP Trust Fund can handle COVID vaccine injury claims while growing for decades. Americans injured by COVID vaccines deserve the same fair process as those injured by routine vaccines.
          </p>
          <div className="model-cta-buttons">
            <Link href="/#action" className="model-cta-btn primary" onClick={() => track('cta_clicked', { location: 'model', type: 'contact_congress' })}>
              Contact Your Representatives
            </Link>
            <Link href="/" className="model-cta-btn secondary" onClick={() => track('cta_clicked', { location: 'model', type: 'explore_data' })}>
              Explore the Data
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
