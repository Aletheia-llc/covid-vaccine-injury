'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { track } from '@vercel/analytics'
import { executeRecaptchaAction } from '@/hooks/useRecaptcha'
import '../styles.css'
import Header from '../components/Header'
import Footer from '../components/Footer'

interface SurveyData {
  q1: string
  q2: string
  q3: string
  q4: string
  q5: string
  q6: string
  q7: string
  q8: string
  q9: string[]
  comments: string
  zip: string
  email: string
}

export default function SurveyPage() {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [surveyData, setSurveyData] = useState<SurveyData>({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
    q6: '',
    q7: '',
    q8: '',
    q9: [],
    comments: '',
    zip: '',
    email: ''
  })

  const [scrollProgress, setScrollProgress] = useState(0)
  const surveyStartedRef = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100
      setScrollProgress(progress)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const updateSurvey = (field: keyof SurveyData, value: string | string[]) => {
    // Track survey start on first interaction
    if (!surveyStartedRef.current) {
      surveyStartedRef.current = true
      track('survey_started')
    }

    setSurveyData(prev => {
      const updated = { ...prev, [field]: value }

      // Check if we should auto-advance after this selection
      setTimeout(() => {
        const shouldAutoAdvance = checkAutoAdvance(step, updated, field)
        if (shouldAutoAdvance) {
          const nextStepNum = Math.min(step + 1, 4)
          track('survey_step', { step: nextStepNum })
          setStep(nextStepNum)
          // Small delay before scroll to let new content render
          setTimeout(() => {
            const surveyForm = document.querySelector('.survey-form')
            if (surveyForm) {
              const navHeight = 80
              const top = surveyForm.getBoundingClientRect().top + window.scrollY - navHeight
              window.scrollTo({ top, behavior: 'smooth' })
            }
          }, 50)
        }
      }, 400) // Small delay to show selection animation

      return updated
    })
  }

  // Check if all required fields for current step are filled
  const checkAutoAdvance = (currentStep: number, data: SurveyData, lastField: keyof SurveyData): boolean => {
    switch (currentStep) {
      case 1:
        // Auto-advance after selecting q1
        return lastField === 'q1' && !!data.q1
      case 2:
        // If 'no' is selected for q2, auto-advance
        if (lastField === 'q2' && data.q2 === 'no') return true
        // If 'yes', need all follow-up questions answered
        if (data.q2 === 'yes') {
          return !!data.q3 && !!data.q4 && lastField === 'q5' && !!data.q5
        }
        return false
      case 3:
        // Complex logic for step 3
        if (data.q2 === 'no') {
          return lastField === 'q8' && !!data.q8
        }
        // If filed a claim (q6 === 'yes'), need q7 answered too
        if (data.q6 === 'yes') {
          return !!data.q7 && lastField === 'q8' && !!data.q8
        }
        // If didn't file (q6 starts with 'no'), just need q8
        if (data.q6 && data.q6.startsWith('no')) {
          return lastField === 'q8' && !!data.q8
        }
        return false
      default:
        return false
    }
  }

  const handleQ9Toggle = (value: string) => {
    setSurveyData(prev => {
      const current = prev.q9
      if (current.includes(value)) {
        return { ...prev, q9: current.filter(v => v !== value) }
      } else {
        return { ...prev, q9: [...current, value] }
      }
    })
  }

  const scrollToSurveyForm = () => {
    const surveyForm = document.querySelector('.survey-form')
    if (surveyForm) {
      const navHeight = 80
      const top = surveyForm.getBoundingClientRect().top + window.scrollY - navHeight
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const nextStep = () => {
    const nextStepNum = Math.min(step + 1, 4)
    track('survey_step', { step: nextStepNum })
    setStep(nextStepNum)
    scrollToSurveyForm()
  }

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1))
    scrollToSurveyForm()
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')

    try {
      // Get reCAPTCHA token (returns null if not configured)
      const recaptchaToken = await executeRecaptchaAction('SURVEY')

      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...surveyData, recaptchaToken })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit survey')
      }

      track('survey_completed', {
        believes_real: surveyData.q1,
        personally_impacted: surveyData.q2,
        filed_claim: surveyData.q6 || 'n/a',
        satisfied_with_system: surveyData.q8
      })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const canProceed = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return !!surveyData.q1
      case 2:
        if (surveyData.q2 === 'no') return true
        return !!surveyData.q2 && !!surveyData.q3 && !!surveyData.q4 && !!surveyData.q5
      case 3:
        if (surveyData.q2 === 'no') return !!surveyData.q8
        if (surveyData.q6 && !surveyData.q6.startsWith('no')) {
          return !!surveyData.q6 && !!surveyData.q7 && !!surveyData.q8
        }
        return !!surveyData.q6 && !!surveyData.q8
      default:
        return true
    }
  }

  if (submitted) {
    return (
      <>
        <Header activePage="survey" />
        <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

        <main className="survey-success-page">
          <div className="survey-success-container">
            <div className="success-icon">&#10003;</div>
            <h1>Thank You!</h1>
            <p>Your response has been recorded. Your voice matters in advocating for meaningful reform to the vaccine injury compensation system.</p>
            <div className="success-actions">
              <Link href="/#action" className="hero-btn primary">Contact Your Representatives</Link>
              <Link href="/" className="hero-btn secondary">Return Home</Link>
            </div>
          </div>
        </main>

        <Footer />
      </>
    )
  }

  return (
    <>
      <Header activePage="survey" />
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      <main className="survey-page">
        <section className="survey-hero">
          <div className="survey-hero-inner">
            <span className="survey-badge">Community Survey</span>
            <h1 className="survey-title">Share Your Experience</h1>
            <p className="survey-subtitle">
              Help us understand how the vaccine injury compensation system has affected you and your community.
              Your anonymous responses will inform our advocacy efforts.
            </p>
          </div>
        </section>

        <section className="survey-content">
          <div className="survey-container">
            <div className="survey-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(step / 4) * 100}%` }} />
              </div>
              <div className="progress-steps">
                <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
                  <div className="step-number">1</div>
                  <span>Beliefs</span>
                </div>
                <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
                  <div className="step-number">2</div>
                  <span>Impact</span>
                </div>
                <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
                  <div className="step-number">3</div>
                  <span>System</span>
                </div>
                <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>
                  <div className="step-number">4</div>
                  <span>Reform</span>
                </div>
              </div>
            </div>

            <div className="survey-form">
              {step === 1 && (
                <div className="survey-step">
                  <h2>Your Beliefs</h2>
                  <p className="step-description">Start with your general perspective on vaccine injuries.</p>

                  <div className="survey-question">
                    <label>Do you believe Covid-19 vaccine injuries are real?</label>
                    <div className="option-grid">
                      {[
                        { value: 'yes', label: 'Yes', desc: 'I believe vaccine injuries are a real phenomenon' },
                        { value: 'no', label: 'No', desc: 'I do not believe vaccine injuries are common' },
                        { value: 'unsure', label: 'Unsure', desc: 'I am uncertain about vaccine injuries' }
                      ].map(option => (
                        <button
                          key={option.value}
                          className={`option-card ${surveyData.q1 === option.value ? 'selected' : ''}`}
                          onClick={() => updateSurvey('q1', option.value)}
                        >
                          <span className="option-label">{option.label}</span>
                          <span className="option-desc">{option.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="survey-step">
                  <h2>Personal Impact</h2>
                  <p className="step-description">Tell us about your personal experience with vaccine injuries.</p>

                  <div className="survey-question">
                    <label>Have you or someone you know been impacted by a Covid-19 vaccine injury?</label>
                    <div className="option-grid two-col">
                      {[
                        { value: 'yes', label: 'Yes', desc: 'I or someone I know has been affected' },
                        { value: 'no', label: 'No', desc: 'I have not been personally affected' }
                      ].map(option => (
                        <button
                          key={option.value}
                          className={`option-card ${surveyData.q2 === option.value ? 'selected' : ''}`}
                          onClick={() => updateSurvey('q2', option.value)}
                        >
                          <span className="option-label">{option.label}</span>
                          <span className="option-desc">{option.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {surveyData.q2 === 'yes' && (
                    <>
                      <div className="survey-question">
                        <label>Who was impacted?</label>
                        <div className="option-grid three-col">
                          {[
                            { value: 'me', label: 'Me personally' },
                            { value: 'immediate', label: 'Immediate circle', desc: 'Family or close friend' },
                            { value: 'acquaintance', label: 'Acquaintance', desc: 'Someone I know' }
                          ].map(option => (
                            <button
                              key={option.value}
                              className={`option-card compact ${surveyData.q3 === option.value ? 'selected' : ''}`}
                              onClick={() => updateSurvey('q3', option.value)}
                            >
                              <span className="option-label">{option.label}</span>
                              {option.desc && <span className="option-desc">{option.desc}</span>}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="survey-question">
                        <label>How severe was the injury?</label>
                        <div className="option-grid severity">
                          {[
                            { value: 'mild', label: 'Mild', desc: 'Minor symptoms, resolved quickly' },
                            { value: 'moderate', label: 'Moderate', desc: 'Required medical attention' },
                            { value: 'severe', label: 'Severe', desc: 'Hospitalization or long-term issues' },
                            { value: 'permanent', label: 'Permanent', desc: 'Lasting disability' },
                            { value: 'death', label: 'Death', desc: 'Fatal outcome' }
                          ].map(option => (
                            <button
                              key={option.value}
                              className={`option-card severity-card ${surveyData.q4 === option.value ? 'selected' : ''}`}
                              onClick={() => updateSurvey('q4', option.value)}
                            >
                              <span className="option-label">{option.label}</span>
                              <span className="option-desc">{option.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="survey-question">
                        <label>Did the injured person receive appropriate medical treatment?</label>
                        <div className="option-grid three-col">
                          {[
                            { value: 'yes', label: 'Yes - Acknowledged', desc: 'Medical providers recognized the injury' },
                            { value: 'partially', label: 'Partially', desc: 'Some acknowledgment, some dismissal' },
                            { value: 'no', label: 'No - Dismissed', desc: 'Concerns were dismissed or ignored' }
                          ].map(option => (
                            <button
                              key={option.value}
                              className={`option-card ${surveyData.q5 === option.value ? 'selected' : ''}`}
                              onClick={() => updateSurvey('q5', option.value)}
                            >
                              <span className="option-label">{option.label}</span>
                              <span className="option-desc">{option.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="survey-step">
                  <h2>The Compensation System</h2>
                  <p className="step-description">Share your experience with or knowledge of the CICP program.</p>

                  {surveyData.q2 === 'yes' && (
                    <>
                      <div className="survey-question">
                        <label>Did the injured person file a claim with the CICP (Countermeasures Injury Compensation Program)?</label>
                        <div className="option-grid">
                          {[
                            { value: 'yes', label: 'Yes', desc: 'A claim was filed' },
                            { value: 'no-unaware', label: 'No - Unaware', desc: 'Was not aware of the program' },
                            { value: 'no-deadline', label: 'No - Missed Deadline', desc: 'Deadline passed before we could file' },
                            { value: 'no-complex', label: 'No - Too Complex', desc: 'Process was too complicated' },
                            { value: 'no-other', label: 'No - Other Reason', desc: 'Other circumstances prevented filing' }
                          ].map(option => (
                            <button
                              key={option.value}
                              className={`option-card ${surveyData.q6 === option.value ? 'selected' : ''}`}
                              onClick={() => updateSurvey('q6', option.value)}
                            >
                              <span className="option-label">{option.label}</span>
                              <span className="option-desc">{option.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {surveyData.q6 === 'yes' && (
                        <div className="survey-question">
                          <label>What was the outcome of the CICP claim?</label>
                          <div className="option-grid">
                            {[
                              { value: 'pending', label: 'Pending', desc: 'Still waiting for a decision' },
                              { value: 'denied-deadline', label: 'Denied - Deadline', desc: 'Denied due to filing deadline' },
                              { value: 'denied-records', label: 'Denied - Records', desc: 'Denied due to insufficient records' },
                              { value: 'denied-proof', label: 'Denied - Proof', desc: 'Denied due to lack of proof' },
                              { value: 'compensated', label: 'Compensated', desc: 'Claim was approved and paid' }
                            ].map(option => (
                              <button
                                key={option.value}
                                className={`option-card ${surveyData.q7 === option.value ? 'selected' : ''}`}
                                onClick={() => updateSurvey('q7', option.value)}
                              >
                                <span className="option-label">{option.label}</span>
                                <span className="option-desc">{option.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="survey-question">
                    <label>Are you satisfied with how the U.S. handles vaccine injury compensation?</label>
                    <div className="option-grid three-col">
                      {[
                        { value: 'yes', label: 'Yes', desc: 'The current system is adequate' },
                        { value: 'somewhat', label: 'Somewhat', desc: 'There is room for improvement' },
                        { value: 'no', label: 'No', desc: 'Major reforms are needed' }
                      ].map(option => (
                        <button
                          key={option.value}
                          className={`option-card ${surveyData.q8 === option.value ? 'selected' : ''}`}
                          onClick={() => updateSurvey('q8', option.value)}
                        >
                          <span className="option-label">{option.label}</span>
                          <span className="option-desc">{option.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="survey-step">
                  <h2>Reforms & Final Thoughts</h2>
                  <p className="step-description">What changes would you like to see? (Optional details)</p>

                  <div className="survey-question">
                    <label>Which reforms would you support? (Select all that apply)</label>
                    <div className="checkbox-grid">
                      {[
                        { value: 'vicp-transfer', label: 'Transfer to VICP', desc: 'Move Covid vaccines to the established Vaccine Injury Compensation Program' },
                        { value: 'deadline', label: 'Extend Deadline', desc: 'Increase the 1-year filing deadline' },
                        { value: 'pain-suffering', label: 'Pain & Suffering', desc: 'Allow compensation for pain and suffering (currently excluded)' },
                        { value: 'attorney-fees', label: 'Attorney Fees', desc: 'Provide for attorney fee reimbursement' },
                        { value: 'judicial-review', label: 'Judicial Review', desc: 'Allow appeals to federal courts' },
                        { value: 'injury-table', label: 'Injury Table', desc: 'Create a table of recognized vaccine injuries' }
                      ].map(option => (
                        <button
                          key={option.value}
                          className={`checkbox-card ${surveyData.q9.includes(option.value) ? 'selected' : ''}`}
                          onClick={() => handleQ9Toggle(option.value)}
                        >
                          <span className="checkbox-indicator">{surveyData.q9.includes(option.value) ? '✓' : ''}</span>
                          <div className="checkbox-content">
                            <span className="option-label">{option.label}</span>
                            <span className="option-desc">{option.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="survey-question">
                    <label>Additional Comments (Optional)</label>
                    <textarea
                      className="survey-textarea"
                      placeholder="Share any additional thoughts, experiences, or suggestions..."
                      value={surveyData.comments}
                      onChange={(e) => updateSurvey('comments', e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="survey-question-row">
                    <div className="survey-question half">
                      <label>ZIP Code (Optional)</label>
                      <input
                        type="text"
                        className="survey-input"
                        placeholder="12345"
                        maxLength={5}
                        value={surveyData.zip}
                        onChange={(e) => updateSurvey('zip', e.target.value.replace(/\D/g, ''))}
                      />
                      <span className="input-note">Helps us understand regional impact</span>
                    </div>
                    <div className="survey-question half">
                      <label>Email (Optional)</label>
                      <input
                        type="email"
                        className="survey-input"
                        placeholder="you@example.com"
                        value={surveyData.email}
                        onChange={(e) => updateSurvey('email', e.target.value)}
                      />
                      <span className="input-note">Only if you want advocacy updates</span>
                    </div>
                  </div>

                  {error && (
                    <div className="survey-error">{error}</div>
                  )}
                </div>
              )}

              <div className="survey-navigation">
                {step > 1 && (
                  <button className="nav-btn back" onClick={prevStep}>
                    Back
                  </button>
                )}
                {step < 4 ? (
                  <button
                    className="nav-btn next"
                    onClick={nextStep}
                    disabled={!canProceed(step)}
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    className="nav-btn submit"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Survey'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-logo">
          <span>U.S. Covid Vaccine Injuries</span>
        </div>
        <p className="footer-text">Advocating for fair treatment of those impacted by Covid-19 vaccine injuries.</p>
        <div className="footer-links">
          <Link href="/">Home</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/resources">Resources</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
        </div>
      </footer>
    </>
  )
}
