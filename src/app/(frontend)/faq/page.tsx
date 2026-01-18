'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { track } from '@vercel/analytics'

interface FAQItem {
  question: string
  answer: React.ReactNode
}

interface FAQCategory {
  id: string
  icon: string
  iconClass: string
  title: string
  subtitle: string
  items: FAQItem[]
}

function FAQAccordion({ question, answer, isOpen, onClick }: { question: string; answer: React.ReactNode; isOpen: boolean; onClick: () => void }) {
  return (
    <div className={`faq-item ${isOpen ? 'open' : ''}`}>
      <button className="faq-question" onClick={onClick}>
        <h4>{question}</h4>
        <span className="faq-toggle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </span>
      </button>
      <div className="faq-answer">
        <div className="faq-answer-content">
          {answer}
        </div>
      </div>
    </div>
  )
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Handle hash navigation
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const id = window.location.hash.slice(1)
      const element = document.getElementById(id)
      if (element) {
        setTimeout(() => {
          const navHeight = 80
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset - navHeight
          window.scrollTo({ top: elementPosition, behavior: 'smooth' })
        }, 100)
      }
    }
  }, [])

  const toggleItem = (key: string, question: string, category: string) => {
    const isOpening = !openItems[key]
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }))

    // Track when FAQ is expanded (not collapsed)
    if (isOpening) {
      track('faq_expanded', { question: question.slice(0, 80), category })
    }
  }

  const faqCategories: FAQCategory[] = [
    {
      id: 'vicp',
      icon: '🏛️',
      iconClass: 'vicp',
      title: 'Understanding VICP',
      subtitle: 'The Vaccine Injury Compensation Program',
      items: [
        {
          question: 'What is the Vaccine Injury Compensation Program (VICP)?',
          answer: (
            <>
              <p>The <strong>Vaccine Injury Compensation Program (VICP)</strong> is a federal no-fault program created by the National Childhood Vaccine Injury Act of 1986. It provides compensation to individuals who are injured by vaccines covered under the program.</p>
              <p>VICP was created to:</p>
              <ol>
                <li><strong>Shield vaccine manufacturers from liability</strong> after litigation in the 1980s threatened to drive companies out of the vaccine market</li>
                <li><strong>Provide a streamlined process</strong> for injured individuals to seek compensation without lengthy court battles against manufacturers</li>
              </ol>
              <div className="callout">
                <div className="callout-title">Program Statistics</div>
                Since 1988, VICP has compensated over 12,300 individuals totaling more than $5.4 billion. However, the program currently has over 5,000 pending claims, and critics note it has become increasingly adversarial in recent years.
              </div>
            </>
          )
        },
        {
          question: 'When was VICP created and why?',
          answer: (
            <>
              <p>VICP was created through the <strong>National Childhood Vaccine Injury Act (NCVIA)</strong>, signed into law by President Ronald Reagan on November 14, 1986. The program became operational on October 1, 1988.</p>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-year">Early 1980s</div>
                  <div className="timeline-text">Lawsuits against vaccine manufacturers increased dramatically. Several companies threatened to stop producing vaccines entirely.</div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-year">1986</div>
                  <div className="timeline-text">Congress passed the NCVIA, creating VICP as a compromise to protect manufacturers while ensuring injured individuals had recourse.</div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-year">1988</div>
                  <div className="timeline-text">VICP became operational, establishing the U.S. Court of Federal Claims as the venue for vaccine injury claims.</div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-year">Present</div>
                  <div className="timeline-text">VICP has paid over $5.4 billion to more than 12,300 individuals. However, the program faces challenges: over 5,000 claims remain pending, the $0.75 excise tax has not been adjusted since 1986, and proceedings have become increasingly adversarial with the Department of Justice.</div>
                </div>
              </div>
            </>
          )
        },
        {
          question: 'Which vaccines are covered by VICP?',
          answer: (
            <>
              <p>VICP covers vaccines routinely recommended for children and pregnant women, including:</p>
              <ul>
                <li>DTaP (Diphtheria, Tetanus, Pertussis)</li>
                <li>MMR (Measles, Mumps, Rubella)</li>
                <li>Polio (IPV)</li>
                <li>Hepatitis A and B</li>
                <li>Hib (Haemophilus influenzae type b)</li>
                <li>Varicella (Chickenpox)</li>
                <li>Pneumococcal vaccines</li>
                <li>Rotavirus</li>
                <li>Seasonal Influenza (flu shots)</li>
                <li>HPV (Human Papillomavirus)</li>
                <li>Meningococcal vaccines</li>
              </ul>
              <div className="callout danger">
                <div className="callout-title">Important Note</div>
                COVID-19 vaccines are <strong>NOT</strong> covered by VICP. They are instead covered by the Countermeasures Injury Compensation Program (CICP) under the PREP Act.
              </div>
            </>
          )
        },
        {
          question: 'How does VICP work?',
          answer: (
            <>
              <p>VICP operates through the <strong>U.S. Court of Federal Claims</strong> with Special Masters who hear vaccine injury cases:</p>
              <ol>
                <li><strong>Filing:</strong> A petition is filed with the Court of Federal Claims within 3 years of symptom onset</li>
                <li><strong>Medical Review:</strong> HHS medical staff review the petition and submit a report to the court</li>
                <li><strong>Proceedings:</strong> A Special Master reviews evidence, may hold hearings, and considers arguments from both the petitioner&apos;s attorneys and Department of Justice attorneys representing HHS</li>
                <li><strong>Decision:</strong> After what can be extensive back-and-forth between parties, the Special Master issues a decision on entitlement and damages</li>
                <li><strong>Appeal:</strong> Decisions can be appealed to the Court of Federal Claims and federal appellate courts</li>
              </ol>
              <table className="faq-table">
                <tbody>
                  <tr><th>Feature</th><th>VICP</th></tr>
                  <tr><td>Filing Deadline</td><td>3 years from symptom onset</td></tr>
                  <tr><td>Pain &amp; Suffering</td><td>Up to $250,000</td></tr>
                  <tr><td>Attorney Fees</td><td>Paid separately from award, covered by VICP</td></tr>
                  <tr><td>Death Benefit</td><td>$250,000</td></tr>
                  <tr><td>Appeals</td><td>Full judicial review available</td></tr>
                </tbody>
              </table>
            </>
          )
        },
        {
          question: 'How is VICP funded?',
          answer: (
            <>
              <p>VICP is funded through the <strong>Vaccine Injury Compensation Trust Fund</strong>, which collects an excise tax of $0.75 per vaccine dose.</p>
              <ul>
                <li>Taxpayers do not directly fund vaccine injury compensation</li>
                <li>The cost is built into the price of vaccines</li>
                <li>The fund has accumulated substantial reserves over time</li>
              </ul>
              <div className="callout">
                <div className="callout-title">Current Fund Status</div>
                As of 2025, the VICP Trust Fund holds approximately <strong>$4.5 billion</strong>. However, there are over 5,000 claims currently pending in VICP, and the $0.75 excise tax has not been updated since 1986.
              </div>
            </>
          )
        },
        {
          question: "What is VICP's approval rate?",
          answer: (
            <>
              <p>According to HRSA statistics, VICP has an approval rate of approximately <strong>48%</strong> for petitions adjudicated since 1988. More recent data (2006-2023) shows a higher rate of approximately 73% (9,675 compensated of 13,326 adjudicated).</p>
              <p>Compensation can occur through:</p>
              <ul>
                <li>Claims where the injury is listed on the Vaccine Injury Table (presumptive causation)</li>
                <li>Claims where the petitioner proves causation through medical evidence</li>
                <li>Negotiated settlements between petitioners and HHS</li>
              </ul>
              <p>Note: HRSA states that approximately 60% of all compensation awarded comes through negotiated settlements in which HHS has not concluded the vaccine caused the alleged injury.</p>
            </>
          )
        }
      ]
    },
    {
      id: 'cicp',
      icon: '⚠️',
      iconClass: 'cicp',
      title: 'Understanding CICP',
      subtitle: 'The Countermeasures Injury Compensation Program',
      items: [
        {
          question: 'What is the Countermeasures Injury Compensation Program (CICP)?',
          answer: (
            <>
              <p>The <strong>Countermeasures Injury Compensation Program (CICP)</strong> is a federal program created by the Public Readiness and Emergency Preparedness Act (PREP Act) of 2005. It provides compensation for injuries caused by &quot;covered countermeasures&quot; during declared public health emergencies.</p>
              <p>CICP covers:</p>
              <ul>
                <li>COVID-19 vaccines</li>
                <li>Pandemic flu vaccines (H1N1)</li>
                <li>Smallpox vaccines</li>
                <li>Anthrax vaccines</li>
                <li>Certain diagnostic tests and therapeutics</li>
              </ul>
              <div className="callout danger">
                <div className="callout-title">Critical Difference</div>
                Unlike VICP, CICP is an <strong>administrative program within HHS</strong>. The same agency that promotes vaccines also decides injury claims. There is no independent judicial review.
              </div>
            </>
          )
        },
        {
          question: 'Why was CICP created?',
          answer: (
            <>
              <p>CICP was created in 2005 as part of the <strong>PREP Act</strong> to address a specific problem: ensuring that manufacturers would produce vaccines and medical countermeasures during public health emergencies without fear of liability.</p>
              <p>The PREP Act provides near-complete immunity from lawsuits for manufacturers, distributors, healthcare providers, and government officials involved in administering covered countermeasures. CICP was included as the <strong>exclusive remedy</strong> for injured individuals, meaning they cannot sue in court.</p>
              <div className="callout warning">
                <div className="callout-title">The Trade-off</div>
                While CICP provides a compensation mechanism for injured individuals, it was designed primarily to protect the supply chain during emergencies. The program&apos;s low compensation rate (1.4% of decided COVID-19 claims) reflects this design priority.
              </div>
            </>
          )
        },
        {
          question: "What is CICP's approval rate and why is it so low?",
          answer: (
            <>
              <p>As of December 2025, CICP has rendered decisions on 6,273 COVID-19 claims, finding only <strong>87 eligible for compensation</strong> (1.4%). Of those, <strong>42 have been paid</strong>. This compares to VICP&apos;s approximately 48% compensation rate.</p>
              <p>Several factors contribute to this low rate:</p>
              <ol>
                <li><strong>No COVID-19 Injury Table:</strong> While CICP has injury tables for smallpox and pandemic influenza, HHS has not established one for COVID-19 vaccines. Claimants must independently prove causation for every claim.</li>
                <li><strong>Higher burden of proof:</strong> Claimants must demonstrate injury was the &quot;direct result&quot; of the countermeasure based on &quot;compelling, reliable, valid, medical and scientific evidence.&quot;</li>
                <li><strong>One-year filing deadline:</strong> Claims must be filed within 1 year of administration (vs. 3 years from symptom onset for VICP).</li>
                <li><strong>Limited compensation:</strong> No pain and suffering damages are available.</li>
                <li><strong>No attorney fee coverage:</strong> While claimants may hire attorneys, fees are not covered by the program.</li>
              </ol>
              <table className="faq-table">
                <tbody>
                  <tr><th>Metric</th><th>CICP</th><th>VICP</th></tr>
                  <tr><td>Compensation Rate</td><td style={{ color: 'var(--danger)', fontWeight: 600 }}>1.4%</td><td style={{ color: 'var(--success)', fontWeight: 600 }}>~48%</td></tr>
                  <tr><td>Filing Deadline</td><td>1 year from administration</td><td>3 years from symptom onset</td></tr>
                  <tr><td>Pain &amp; Suffering</td><td style={{ color: 'var(--danger)' }}>Not covered</td><td style={{ color: 'var(--success)' }}>Up to $250,000</td></tr>
                  <tr><td>Attorney Fees</td><td style={{ color: 'var(--danger)' }}>Not covered</td><td style={{ color: 'var(--success)' }}>Covered by program</td></tr>
                  <tr><td>Judicial Review</td><td style={{ color: 'var(--danger)' }}>None</td><td style={{ color: 'var(--success)' }}>Available</td></tr>
                </tbody>
              </table>
            </>
          )
        },
        {
          question: 'Can CICP decisions be appealed?',
          answer: (
            <>
              <p>CICP allows claimants to request <strong>reconsideration</strong> of a decision, but there is no independent judicial review. The Secretary of HHS makes the final decision.</p>
              <p>This means:</p>
              <ul>
                <li>HRSA, an agency within HHS that also promotes vaccines, adjudicates injury claims</li>
                <li>Claimants can request reconsideration, but it is reviewed by the same agency</li>
                <li>There is no appeal to any court or independent tribunal</li>
                <li>No legal precedent is established to guide future claims</li>
              </ul>
              <p>This contrasts with VICP, where claims are heard by Special Masters in the U.S. Court of Federal Claims, with full judicial review available through the federal court system.</p>
            </>
          )
        },
        {
          question: 'How much has CICP actually paid to COVID vaccine injury claimants?',
          answer: (
            <>
              <p>As of December 2025, CICP has compensated <strong>42 COVID-19 vaccine injury claims</strong> with payments totaling approximately <strong>$575,000</strong> for COVID-specific injuries.</p>
              <p>Context on these payments:</p>
              <ul>
                <li>Most compensated injuries are myocarditis, pericarditis, anaphylaxis, and Guillain-Barré Syndrome</li>
                <li>The majority of myocarditis payments range from <strong>$1,000 to $5,500</strong></li>
                <li>One outlier payment of $370,000 skews the average significantly</li>
                <li>The median payment (excluding outliers) is approximately <strong>$4,000</strong></li>
              </ul>
              <p>For context, VICP&apos;s average payment per compensated claim is approximately <strong>$450,000</strong>.</p>
              <div className="callout">
                <div className="callout-title">Note on Total CICP Payments</div>
                CICP reports approximately $6.5 million in total payments since 2010, but the majority ($6.1 million) was paid for H1N1 pandemic influenza injuries, not COVID-19 vaccine injuries.
              </div>
            </>
          )
        }
      ]
    },
    {
      id: 'prep-act',
      icon: '📜',
      iconClass: 'prep',
      title: 'The PREP Act & COVID-19',
      subtitle: 'Why COVID vaccines are handled differently',
      items: [
        {
          question: 'What is the PREP Act?',
          answer: (
            <>
              <p>The <strong>Public Readiness and Emergency Preparedness Act (PREP Act)</strong>, enacted in 2005, provides immunity from liability for manufacturers, distributors, and healthcare providers of &quot;covered countermeasures&quot; during declared public health emergencies.</p>
              <p>When the Secretary of HHS issues a PREP Act declaration, it creates:</p>
              <ol>
                <li><strong>Broad liability immunity</strong> for anyone involved in manufacturing, distributing, or administering covered countermeasures</li>
                <li><strong>CICP as the exclusive remedy</strong> for individuals injured by those countermeasures</li>
                <li><strong>Prohibition on lawsuits</strong> except in cases of &quot;willful misconduct,&quot; which requires intentional wrongdoing with knowing disregard of obvious risk</li>
              </ol>
              <p>The Act was designed to ensure companies would participate in emergency response without fear of litigation.</p>
            </>
          )
        },
        {
          question: 'When was the PREP Act invoked for COVID-19?',
          answer: (
            <>
              <p>Secretary of HHS Alex Azar issued a PREP Act declaration for COVID-19 on <strong>March 10, 2020</strong>, effective February 4, 2020. The declaration has been amended twelve times since then.</p>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-year">March 10, 2020</div>
                  <div className="timeline-text">Initial PREP Act declaration issued, covering diagnostics, devices, drugs, biologics, and vaccines for COVID-19.</div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-year">December 11, 2020</div>
                  <div className="timeline-text">Pfizer-BioNTech vaccine receives Emergency Use Authorization (EUA). PREP Act immunity applies.</div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-year">August 2021</div>
                  <div className="timeline-text">COVID-19 vaccines begin receiving full FDA approval (Pfizer-BioNTech first, followed by Moderna).</div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-year">May 2023</div>
                  <div className="timeline-text">COVID-19 public health emergency under Section 319 ends. However, PREP Act declaration remains in effect.</div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-year">December 11, 2024</div>
                  <div className="timeline-text">HHS Secretary extends liability protections for COVID-19 countermeasures through December 31, 2029.</div>
                </div>
              </div>
              <div className="callout warning">
                <div className="callout-title">Current Status</div>
                COVID-19 vaccines now have full FDA approval and are routinely administered, yet they remain under PREP Act coverage through 2029, with CICP as the exclusive compensation mechanism.
              </div>
            </>
          )
        },
        {
          question: "Why weren't COVID-19 vaccines added to VICP?",
          answer: (
            <>
              <p>Several factors contributed to COVID-19 vaccines being placed under CICP instead of VICP:</p>
              <ol>
                <li><strong>Speed of deployment:</strong> Vaccines were developed and deployed under Emergency Use Authorization before the standard VICP process could be completed.</li>
                <li><strong>PREP Act already active:</strong> The PREP Act declaration was issued in March 2020, automatically placing any COVID countermeasures under CICP.</li>
                <li><strong>Legislative inaction:</strong> Congress has not passed legislation to add COVID vaccines to VICP, despite multiple bills being introduced.</li>
              </ol>
              <p>Now that COVID-19 vaccines have full FDA approval and are routinely administered (including to children), there is a strong case for treating them like other routine vaccines under VICP.</p>
            </>
          )
        },
        {
          question: "Can I sue the COVID-19 vaccine manufacturer if I'm injured?",
          answer: (
            <>
              <p><strong>No</strong>, with extremely limited exceptions. The PREP Act provides immunity from lawsuits for manufacturers, distributors, and healthcare providers. CICP is your exclusive remedy.</p>
              <p>The only exception is &quot;willful misconduct.&quot; This is an extremely high bar; to our knowledge, no plaintiff has successfully proven willful misconduct under the PREP Act.</p>
              <p><strong>For VICP-covered vaccines:</strong> You must first file a VICP claim. If you are unsatisfied with the outcome, you may then have the option to pursue traditional litigation, though this is rarely successful.</p>
              <div className="callout danger">
                <div className="callout-title">Important</div>
                The liability protections under the PREP Act are stronger than those under VICP. This means COVID-19 vaccine injury victims have fewer legal options than those injured by routine vaccines.
              </div>
            </>
          )
        }
      ]
    },
    {
      id: 'reform',
      icon: '🔄',
      iconClass: 'reform',
      title: 'The Case for Reform',
      subtitle: 'Why adding COVID vaccines to VICP makes sense',
      items: [
        {
          question: 'Why should COVID-19 vaccines be moved to VICP?',
          answer: (
            <>
              <p>There are compelling reasons to add COVID-19 vaccines to VICP coverage:</p>
              <ol>
                <li><strong>Proven system:</strong> VICP has operated for 35+ years with established infrastructure, legal precedents, and procedural protections including judicial review.</li>
                <li><strong>Public confidence:</strong> Thorough and expeditious compensation for adverse reactions bolsters confidence in vaccination programs.</li>
                <li><strong>Routine administration:</strong> COVID-19 vaccines are now routinely administered, including to children, and have received full FDA approval.</li>
                <li><strong>Consistent treatment:</strong> Americans injured by COVID vaccines currently have access to fewer procedural protections than those injured by other routine vaccines.</li>
              </ol>
            </>
          )
        },
        {
          question: 'Should people who already filed CICP claims be allowed to seek compensation through VICP?',
          answer: (
            <>
              <p><strong>Yes.</strong> There are strong arguments for allowing CICP claimants to seek compensation through VICP:</p>
              <ol>
                <li><strong>Due process:</strong> CICP claimants were denied the procedural protections that VICP provides, including independent judicial review and the ability to appeal to federal court.</li>
                <li><strong>Administrative denials:</strong> Many CICP claims were denied based on the administrative process itself, not a substantive determination that the injury did not occur.</li>
                <li><strong>Precedent:</strong> When vaccines have been added to VICP, Congress has included transitional provisions.</li>
                <li><strong>Constitutional considerations:</strong> The combination of mandatory or coerced vaccination with denial of both compensation and legal recourse raises questions about due process.</li>
              </ol>
            </>
          )
        },
        {
          question: 'Can the VICP Trust Fund afford to take on COVID claims?',
          answer: (
            <>
              <p>The VICP Trust Fund currently holds approximately <strong>$4.5 billion</strong>. Here is an illustrative analysis of potential costs:</p>
              <p><strong>Current VICP obligations:</strong></p>
              <ul>
                <li>Approximately 5,000 claims currently pending in VICP</li>
                <li>Ongoing claims from existing covered vaccines</li>
              </ul>
              <p><strong>Potential COVID-19 claim costs:</strong></p>
              <ul>
                <li>CICP claims filed: ~14,000</li>
                <li>If 40% were compensated at an average of $300,000: ~$1.7 billion</li>
              </ul>
              <p><strong>Considerations:</strong></p>
              <ul>
                <li>The Trust Fund continues to collect $0.75 excise tax per vaccine dose</li>
                <li>A COVID-19 vaccine excise tax could be implemented to offset costs</li>
                <li>Depending on claim volume and approval rates, additional appropriations may be needed</li>
              </ul>
            </>
          )
        },
        {
          question: 'What legislation has been proposed?',
          answer: (
            <>
              <p>Bills such as HR 5142 and HR 5143 have been introduced to address COVID-19 vaccine injury compensation. New versions of this legislation are currently in development.</p>
              <p>Additionally, the Government Accountability Office (GAO) has issued reports highlighting CICP&apos;s shortcomings and recommending reforms.</p>
              <div className="callout">
                <div className="callout-title">Take Action</div>
                Contact your representatives in Congress to express support for legislation ensuring COVID-19 vaccine injury claimants have access to the same procedural protections as those injured by other routine vaccines.
              </div>
            </>
          )
        },
        {
          question: "Won't better compensation discourage vaccination?",
          answer: (
            <>
              <p><strong>No.</strong> VICP has operated for 35+ years without decreasing vaccination rates. Transparent acknowledgment of rare adverse events and a functioning compensation system demonstrates that:</p>
              <ul>
                <li>The government acknowledges that rare vaccine injuries occur</li>
                <li>Injured individuals have access to a defined process for seeking compensation</li>
                <li>The system includes procedural protections and accountability</li>
              </ul>
              <p>Vaccination programs benefit from public confidence, which is supported by transparency about both benefits and risks.</p>
            </>
          )
        },
        {
          question: 'What can I do to help?',
          answer: (
            <>
              <p>There are several ways you can help advocate for reform:</p>
              <ol>
                <li><strong>Contact your representatives:</strong> Call or write your U.S. Representative and Senators. Ask them to support legislation adding COVID-19 vaccines to VICP coverage.</li>
                <li><strong>Share information:</strong> Help spread awareness about the compensation gap. Many people don&apos;t know that COVID vaccines are treated differently.</li>
                <li><strong>Tell your story:</strong> If you or someone you know was injured, sharing your experience (publicly or with policymakers) can be powerful.</li>
                <li><strong>Support advocacy organizations:</strong> Groups like React19 and others are working to support injured individuals and advocate for reform.</li>
                <li><strong>Engage with officials:</strong> Attend town halls, submit public comments on proposed regulations, and make your voice heard.</li>
              </ol>
            </>
          )
        }
      ]
    }
  ]

  return (
    <div>
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <span>⚖️</span>
            <span>U.S. Covid Vaccine Injuries</span>
          </Link>
          <button
            className={`nav-toggle ${mobileNavOpen ? 'active' : ''}`}
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileNavOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <ul className={`nav-links ${mobileNavOpen ? 'open' : ''}`}>
            <li><Link href="/#funnel" onClick={() => setMobileNavOpen(false)}>The Gap</Link></li>
            <li><Link href="/#comparison" onClick={() => setMobileNavOpen(false)}>Compare Programs</Link></li>
            <li><Link href="/#trustfund" onClick={() => setMobileNavOpen(false)}>Trust Fund</Link></li>
            <li><Link href="/faq" className="active" onClick={() => setMobileNavOpen(false)}>FAQ</Link></li>
            <li><Link href="/resources" onClick={() => setMobileNavOpen(false)}>Data</Link></li>
            <li><Link href="/survey" onClick={() => setMobileNavOpen(false)}>Survey</Link></li>
            <li className="mobile-only">
              <Link href="/#action" className="nav-cta mobile" onClick={() => setMobileNavOpen(false)}>Contact Congress</Link>
            </li>
          </ul>
          <Link href="/#action" className="nav-cta">Contact Congress →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" style={{ minHeight: 'auto', paddingTop: '140px', paddingBottom: '80px' }}>
        <div className="hero-inner" style={{ maxWidth: '900px' }}>
          <div className="hero-badge">❓ Frequently Asked Questions</div>
          <h1 className="hero-title" style={{ fontSize: 'clamp(36px, 5vw, 56px)', display: 'block' }}>
            Understanding Vaccine Injury Compensation
          </h1>
          <p className="hero-subtitle" style={{ marginBottom: 0 }}>
            Everything you need to know about VICP, CICP, the PREP Act, and why COVID-19 vaccine injuries are treated differently than routine vaccine injuries.
          </p>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="toc-section">
        <div className="toc-inner">
          <h2 className="toc-title">Jump to a Topic</h2>
          <div className="toc-grid">
            {faqCategories.map(cat => (
              <a key={cat.id} href={`#${cat.id}`} className="toc-card" onClick={(e) => {
                e.preventDefault()
                const element = document.getElementById(cat.id)
                if (element) {
                  const navHeight = 80
                  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset - navHeight
                  window.scrollTo({ top: elementPosition, behavior: 'smooth' })
                }
              }}>
                <div className="toc-card-icon">{cat.icon}</div>
                <h3>{cat.title}</h3>
                <p>{cat.subtitle}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Main FAQ Content */}
      <main className="main-content">
        {faqCategories.map(category => (
          <section key={category.id} className="faq-category" id={category.id}>
            <div className="category-header">
              <div className={`category-icon ${category.iconClass}`}>{category.icon}</div>
              <div>
                <h2 className="category-title">{category.title}</h2>
                <p className="category-subtitle">{category.subtitle}</p>
              </div>
            </div>

            {category.items.map((item, index) => (
              <FAQAccordion
                key={`${category.id}-${index}`}
                question={item.question}
                answer={item.answer}
                isOpen={openItems[`${category.id}-${index}`] || false}
                onClick={() => toggleItem(`${category.id}-${index}`, item.question, category.title)}
              />
            ))}
          </section>
        ))}
      </main>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2>Ready to Make a Difference?</h2>
          <p>Contact your representatives and tell them: Americans injured by COVID-19 vaccines should have access to the same compensation process as those injured by other routine vaccines.</p>
          <div className="cta-buttons">
            <Link href="/#action" className="cta-btn primary">Find Your Representative</Link>
            <Link href="/resources" className="cta-btn secondary">View the Data</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-logo">
          <span>⚖️</span>
          <span>U.S. Covid Vaccine Injuries</span>
        </div>
        <p className="footer-text">Advocating for consistent compensation mechanisms for all vaccine-injured Americans.</p>
        <div className="footer-links">
          <Link href="/">Home</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/resources">Data Resources</Link>
          <Link href="/#action">Take Action</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </footer>
    </div>
  )
}
