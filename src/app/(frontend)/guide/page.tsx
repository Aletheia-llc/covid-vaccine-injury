'use client'

import { useState } from 'react'
import Link from 'next/link'
import { track } from '@vercel/analytics'
import Header from '../components/Header'
import Footer from '../components/Footer'
import {
  FileText,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Phone,
  Users,
  Scale,
  Heart
} from 'lucide-react'

export default function GuidePage() {
  const [activeTrack, setActiveTrack] = useState<'injured' | 'advocate'>('injured')

  return (
    <div>
      <Header activePage="guide" />

      {/* Hero */}
      <section className="guide-hero">
        <div className="guide-hero-inner">
          <span className="section-label" style={{ color: 'var(--accent)' }}>Next Steps</span>
          <h1 className="guide-hero-title">What Should I Do?</h1>
          <p className="guide-hero-subtitle">
            Whether you&apos;re personally affected by a COVID-19 vaccine injury or helping someone who is, here&apos;s what you need to know right now.
          </p>
        </div>
      </section>

      {/* Track Selector */}
      <section className="guide-track-section">
        <div className="section-inner">
          <div className="guide-track-tabs">
            <button
              className={`guide-track-tab ${activeTrack === 'injured' ? 'active' : ''}`}
              onClick={() => { setActiveTrack('injured'); track('guide_track', { track: 'injured' }) }}
            >
              <Heart size={20} />
              I&apos;m Injured
            </button>
            <button
              className={`guide-track-tab ${activeTrack === 'advocate' ? 'active' : ''}`}
              onClick={() => { setActiveTrack('advocate'); track('guide_track', { track: 'advocate' }) }}
            >
              <Users size={20} />
              I&apos;m Helping Someone
            </button>
          </div>

          {/* Track: Injured Individual */}
          {activeTrack === 'injured' && (
            <div className="guide-content">
              <div className="guide-intro">
                <p>If you believe you were injured by a COVID-19 vaccine, your situation depends on where you are in the process. Find your scenario below.</p>
              </div>

              {/* Scenario 1: Haven't filed */}
              <div className="guide-scenario">
                <div className="guide-scenario-header">
                  <Clock size={24} />
                  <h3>I haven&apos;t filed a claim yet</h3>
                </div>
                <div className="guide-scenario-content">
                  <div className="guide-step">
                    <div className="guide-step-number">1</div>
                    <div className="guide-step-content">
                      <h4>Document everything now</h4>
                      <p>Gather all medical records related to your vaccination and subsequent symptoms. Include: vaccination card, ER visits, specialist appointments, imaging, lab work, and a detailed timeline of when symptoms appeared.</p>
                    </div>
                  </div>
                  <div className="guide-step">
                    <div className="guide-step-number">2</div>
                    <div className="guide-step-content">
                      <h4>Understand the current system</h4>
                      <p>Right now, COVID-19 vaccine injuries go through <strong>CICP</strong> (Countermeasures Injury Compensation Program), which has a 0.3% approval rate and a strict 1-year filing deadline from vaccination. If your deadline has passed, proposed legislation would create a new pathway.</p>
                    </div>
                  </div>
                  <div className="guide-step">
                    <div className="guide-step-number">3</div>
                    <div className="guide-step-content">
                      <h4>Consider filing with CICP anyway</h4>
                      <p>Even though CICP&apos;s approval rate is low, filing creates a paper trail. If legislation passes to move COVID claims to VICP, having a prior CICP filing strengthens your position. <a href="https://www.hrsa.gov/cicp/filing" target="_blank" rel="noopener noreferrer">File here →</a></p>
                    </div>
                  </div>
                  <div className="guide-step">
                    <div className="guide-step-number">4</div>
                    <div className="guide-step-content">
                      <h4>Contact your representatives</h4>
                      <p>Tell Congress your story. Proposed legislation would add COVID vaccines to VICP, giving you access to attorneys, judicial review, and a 45% approval rate. Your voice matters.</p>
                      <Link href="/#action" className="guide-cta-inline" onClick={() => track('cta_clicked', { location: 'guide', type: 'contact_congress' })}>
                        Find your representatives →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scenario 2: Filed with CICP */}
              <div className="guide-scenario">
                <div className="guide-scenario-header">
                  <FileText size={24} />
                  <h3>I filed with CICP and was denied</h3>
                </div>
                <div className="guide-scenario-content">
                  <div className="guide-callout warning">
                    <AlertTriangle size={20} />
                    <p><strong>Don&apos;t give up.</strong> 75% of CICP denials are procedural — missed deadlines or missing documents — not because your injury wasn&apos;t real.</p>
                  </div>
                  <div className="guide-step">
                    <div className="guide-step-number">1</div>
                    <div className="guide-step-content">
                      <h4>Check your denial reason</h4>
                      <p>Review your CICP decision letter. Was it denied on merits (standard of proof) or for procedural reasons (missed deadline, incomplete records)? This matters for your options going forward.</p>
                    </div>
                  </div>
                  <div className="guide-step">
                    <div className="guide-step-number">2</div>
                    <div className="guide-step-content">
                      <h4>Request reconsideration if eligible</h4>
                      <p>CICP allows reconsideration requests. If you have new evidence or your records were incomplete, you can ask for a second review.</p>
                    </div>
                  </div>
                  <div className="guide-step">
                    <div className="guide-step-number">3</div>
                    <div className="guide-step-content">
                      <h4>Keep your documentation current</h4>
                      <p>If legislation passes, you may be eligible to refile under VICP with its 5-year statute of limitations, 8-year lookback, table injury presumptions, and covered attorney fees. Keep all medical records and correspondence organized.</p>
                    </div>
                  </div>
                  <div className="guide-step">
                    <div className="guide-step-number">4</div>
                    <div className="guide-step-content">
                      <h4>Share your story with Congress</h4>
                      <p>Your denial is evidence of a broken system. Congressional offices track constituent stories — yours could influence the legislation.</p>
                      <Link href="/#action" className="guide-cta-inline" onClick={() => track('cta_clicked', { location: 'guide_denied', type: 'contact_congress' })}>
                        Contact your representatives →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scenario 3: Claim pending */}
              <div className="guide-scenario">
                <div className="guide-scenario-header">
                  <Clock size={24} />
                  <h3>My CICP claim is still pending</h3>
                </div>
                <div className="guide-scenario-content">
                  <div className="guide-callout info">
                    <Shield size={20} />
                    <p>You&apos;re one of approximately <strong>7,654 Americans</strong> with pending CICP claims. The average decision takes <strong>24 months</strong>.</p>
                  </div>
                  <div className="guide-step">
                    <div className="guide-step-number">1</div>
                    <div className="guide-step-content">
                      <h4>Continue cooperating with CICP</h4>
                      <p>Respond to any requests for documentation promptly. Missing deadlines or failing to submit records is the #1 reason claims are denied (35.7% of all denials).</p>
                    </div>
                  </div>
                  <div className="guide-step">
                    <div className="guide-step-number">2</div>
                    <div className="guide-step-content">
                      <h4>Monitor legislative progress</h4>
                      <p>If COVID vaccines move to VICP while your claim is pending, you may have the option to transfer. Subscribe to stay updated on legislative developments.</p>
                      <Link href="/#subscribe" className="guide-cta-inline" onClick={() => track('cta_clicked', { location: 'guide_pending', type: 'subscribe' })}>
                        Subscribe for updates →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* What changes if the bill passes */}
              <div className="guide-future">
                <h3><CheckCircle2 size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} />What Changes If the Legislation Passes</h3>
                <div className="guide-future-grid">
                  <div className="guide-future-card">
                    <div className="guide-future-before">CICP: 0.3% approval</div>
                    <ArrowRight size={16} />
                    <div className="guide-future-after">VICP: ~45% projected</div>
                  </div>
                  <div className="guide-future-card">
                    <div className="guide-future-before">CICP: No attorney fees</div>
                    <ArrowRight size={16} />
                    <div className="guide-future-after">VICP: Fees covered by program</div>
                  </div>
                  <div className="guide-future-card">
                    <div className="guide-future-before">CICP: 1-year deadline</div>
                    <ArrowRight size={16} />
                    <div className="guide-future-after">VICP: 5-year SOL + 8-yr lookback</div>
                  </div>
                  <div className="guide-future-card">
                    <div className="guide-future-before">CICP: No judicial review</div>
                    <ArrowRight size={16} />
                    <div className="guide-future-after">VICP: Federal court + appeals</div>
                  </div>
                  <div className="guide-future-card">
                    <div className="guide-future-before">CICP: No pain &amp; suffering</div>
                    <ArrowRight size={16} />
                    <div className="guide-future-after">VICP: Up to $600K + CPI</div>
                  </div>
                  <div className="guide-future-card">
                    <div className="guide-future-before">CICP: No table injuries</div>
                    <ArrowRight size={16} />
                    <div className="guide-future-after">VICP: Myocarditis, GBS, TTS presumed</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Track: Advocate */}
          {activeTrack === 'advocate' && (
            <div className="guide-content">
              <div className="guide-intro">
                <p>Whether you&apos;re an attorney, advocacy organization, healthcare provider, or a friend or family member — here&apos;s how you can help.</p>
              </div>

              <div className="guide-scenario">
                <div className="guide-scenario-header">
                  <Scale size={24} />
                  <h3>For Attorneys</h3>
                </div>
                <div className="guide-scenario-content">
                  <div className="guide-step">
                    <div className="guide-step-number">1</div>
                    <div className="guide-step-content">
                      <h4>Understand the landscape</h4>
                      <p>COVID vaccine injuries are currently under CICP, which has no attorney fee recovery. If legislation passes moving them to VICP, the program pays reasonable attorney fees — creating a viable practice area for vaccine injury law.</p>
                    </div>
                  </div>
                  <div className="guide-step">
                    <div className="guide-step-number">2</div>
                    <div className="guide-step-content">
                      <h4>Prepare now</h4>
                      <p>Familiarize yourself with the <a href="https://www.uscfc.uscourts.gov/vaccine-programoffice-special-masters" target="_blank" rel="noopener noreferrer">Office of Special Masters</a>, VICP petition procedures, and the proposed table injuries (myocarditis, GBS, TTS, pericarditis, anaphylaxis, SIRVA). Early preparation means faster filing when the law changes.</p>
                    </div>
                  </div>
                  <div className="guide-step">
                    <div className="guide-step-number">3</div>
                    <div className="guide-step-content">
                      <h4>Connect with claimants</h4>
                      <p>There are 14,075 potential VICP petitioners. Many need legal representation but can&apos;t afford it under CICP. Under VICP, your fees are covered. Consider building a practice now to be ready.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="guide-scenario">
                <div className="guide-scenario-header">
                  <Users size={24} />
                  <h3>For Advocacy Organizations</h3>
                </div>
                <div className="guide-scenario-content">
                  <div className="guide-step">
                    <div className="guide-step-number">1</div>
                    <div className="guide-step-content">
                      <h4>Use the data</h4>
                      <p>Our <Link href="/model">financial model</Link> and <Link href="/resources">data resources</Link> are built for sharing. Every number is cited with government sources. Use them in testimony, briefings, and communications.</p>
                    </div>
                  </div>
                  <div className="guide-step">
                    <div className="guide-step-number">2</div>
                    <div className="guide-step-content">
                      <h4>Coordinate congressional outreach</h4>
                      <p>Organize constituent meetings with members of Congress. The ZIP code lookup on our <Link href="/#action">action page</Link> makes it easy to identify representatives. Coordinate calls during key legislative windows.</p>
                    </div>
                  </div>
                  <div className="guide-step">
                    <div className="guide-step-number">3</div>
                    <div className="guide-step-content">
                      <h4>Collect stories</h4>
                      <p>Personal testimonials move legislators more than statistics. Help injured individuals document and share their experiences. Our <Link href="/survey">survey</Link> collects structured data that supports the advocacy effort.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="guide-scenario">
                <div className="guide-scenario-header">
                  <Heart size={24} />
                  <h3>For Friends &amp; Family</h3>
                </div>
                <div className="guide-scenario-content">
                  <div className="guide-step">
                    <div className="guide-step-number">1</div>
                    <div className="guide-step-content">
                      <h4>Help with documentation</h4>
                      <p>Medical record gathering is overwhelming for someone dealing with a health crisis. Help them collect vaccination records, medical bills, specialist notes, and create a timeline of symptoms.</p>
                    </div>
                  </div>
                  <div className="guide-step">
                    <div className="guide-step-number">2</div>
                    <div className="guide-step-content">
                      <h4>Contact Congress on their behalf</h4>
                      <p>Even if the injured person can&apos;t call, you can. Tell your representatives about someone you know who was affected. Personal constituent stories carry weight.</p>
                      <Link href="/#action" className="guide-cta-inline" onClick={() => track('cta_clicked', { location: 'guide_advocate', type: 'contact_congress' })}>
                        Find your representatives →
                      </Link>
                    </div>
                  </div>
                  <div className="guide-step">
                    <div className="guide-step-number">3</div>
                    <div className="guide-step-content">
                      <h4>Share this site</h4>
                      <p>The more people who understand the compensation gap, the more pressure builds for reform. Share the data, share the calculator results, share the financial model.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Key Resources */}
          <div className="guide-resources">
            <h3>Key Resources</h3>
            <div className="guide-resources-grid">
              <a href="https://www.hrsa.gov/cicp/filing" target="_blank" rel="noopener noreferrer" className="guide-resource-card" onClick={() => track('guide_resource', { resource: 'cicp_filing' })}>
                <FileText size={20} />
                <div>
                  <h4>File a CICP Claim</h4>
                  <p>Official HRSA filing form</p>
                </div>
                <ArrowRight size={16} />
              </a>
              <Link href="/model" className="guide-resource-card" onClick={() => track('guide_resource', { resource: 'model' })}>
                <Scale size={20} />
                <div>
                  <h4>Financial Model</h4>
                  <p>Why the Trust Fund can handle it</p>
                </div>
                <ArrowRight size={16} />
              </Link>
              <Link href="/resources" className="guide-resource-card" onClick={() => track('guide_resource', { resource: 'data' })}>
                <Shield size={20} />
                <div>
                  <h4>Data Resources</h4>
                  <p>All government sources cited</p>
                </div>
                <ArrowRight size={16} />
              </Link>
              <Link href="/faq" className="guide-resource-card" onClick={() => track('guide_resource', { resource: 'faq' })}>
                <Phone size={20} />
                <div>
                  <h4>FAQ</h4>
                  <p>Common questions answered</p>
                </div>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
