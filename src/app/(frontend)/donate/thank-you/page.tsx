'use client'

import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export default function ThankYouPage() {
  return (
    <div>
      {/* Navigation */}
      <Header activePage="donate" />

      {/* Thank You Section */}
      <section className="thank-you-section">
        <div className="thank-you-container">
          <div className="thank-you-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path
                d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="22 4 12 14.01 9 11.01"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="thank-you-title">Thank You for Your Generosity</h1>
          <p className="thank-you-message">
            Your donation supports our advocacy for fair vaccine injury compensation. You should receive a confirmation email shortly.
          </p>
          <p className="thank-you-impact">
            Together, we&apos;re working to ensure all vaccine-injured Americans have access to fair compensation.
          </p>
          <div className="thank-you-actions">
            <Link href="/" className="cta-btn primary">Return Home</Link>
            <Link href="/#action" className="cta-btn secondary">Contact Congress</Link>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .thank-you-section {
          min-height: calc(100vh - 200px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8rem 1.5rem 4rem;
          background: linear-gradient(135deg, var(--bg-primary, #1a2744) 0%, #2a3a54 100%);
        }

        .thank-you-container {
          max-width: 500px;
          text-align: center;
        }

        .thank-you-icon {
          width: 80px;
          height: 80px;
          background: var(--accent, #d4a84b);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .thank-you-icon svg {
          width: 40px;
          height: 40px;
          stroke: var(--primary, #1a2744);
        }

        .thank-you-title {
          font-family: var(--font-display, 'Playfair Display', Georgia, serif);
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          color: var(--white, #ffffff);
          margin-bottom: 1rem;
        }

        .thank-you-message {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.7;
          margin-bottom: 1rem;
        }

        .thank-you-impact {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--accent, #d4a84b);
          margin-bottom: 2rem;
        }

        .thank-you-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .thank-you-actions .cta-btn {
          padding: 0.875rem 1.75rem;
          font-weight: 600;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .thank-you-actions .cta-btn.primary {
          background: var(--accent, #d4a84b);
          color: var(--primary, #1a2744);
        }

        .thank-you-actions .cta-btn.primary:hover {
          background: var(--accent-dark, #c49b3d);
          transform: translateY(-2px);
        }

        .thank-you-actions .cta-btn.secondary {
          background: transparent;
          color: var(--white, #ffffff);
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .thank-you-actions .cta-btn.secondary:hover {
          border-color: var(--white, #ffffff);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  )
}
