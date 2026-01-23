'use client'

import Link from 'next/link'
import DonationForm from '@/components/DonationForm'
import { BarChart3, BookOpen, Building2, Users, Heart } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function DonatePage() {
  return (
    <div>
      {/* Navigation */}
      <Header activePage="donate" />

      {/* Hero */}
      <section className="hero" style={{ minHeight: 'auto', paddingTop: '140px', paddingBottom: '60px' }}>
        <div className="hero-inner" style={{ maxWidth: '800px' }}>
          <div className="hero-badge"><Heart size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Support Our Mission</div>
          <h1 className="hero-title" style={{ fontSize: 'clamp(36px, 5vw, 56px)', display: 'block' }}>
            Support Fair Compensation for All
          </h1>
          <p className="hero-subtitle" style={{ marginBottom: 0 }}>
            Help us advocate for consistent vaccine injury compensation. Your donation supports research, education, and legislative advocacy.
          </p>
        </div>
      </section>

      {/* Donation Section */}
      <section className="donate-section">
        <div className="donate-container">
          <div className="donate-content">
            <h2 className="donate-heading">Make a Gift</h2>
            <p className="donate-description">
              Your donation helps us advocate for COVID-19 vaccine injury victims to receive the same procedural protections as those injured by other routine vaccines.
            </p>
            <DonationForm />
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="impact-section">
        <div className="impact-container">
          <h2 className="section-title">Your Gift Makes an Impact</h2>
          <div className="impact-grid">
            <div className="impact-card">
              <div className="impact-icon"><BarChart3 size={32} /></div>
              <h3>Research & Data</h3>
              <p>Funding comprehensive analysis of vaccine injury compensation programs and their outcomes.</p>
            </div>
            <div className="impact-card">
              <div className="impact-icon"><BookOpen size={32} /></div>
              <h3>Education</h3>
              <p>Creating resources to help injured individuals understand their rights and options.</p>
            </div>
            <div className="impact-card">
              <div className="impact-icon"><Building2 size={32} /></div>
              <h3>Legislative Advocacy</h3>
              <p>Supporting efforts to add COVID-19 vaccines to VICP coverage through Congress.</p>
            </div>
            <div className="impact-card">
              <div className="impact-icon"><Users size={32} /></div>
              <h3>Community Support</h3>
              <p>Connecting vaccine-injured individuals with resources and support networks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Other Ways Section */}
      <section className="other-ways-section">
        <div className="other-ways-container">
          <h2 className="section-title">Other Ways to Give</h2>
          <div className="other-ways-grid">
            <div className="other-ways-card">
              <h3>Major Gifts</h3>
              <p>For larger contributions or planned giving, please contact us to discuss how your gift can make the greatest impact.</p>
              <Link href="/#action" className="cta-btn secondary">Contact Us</Link>
            </div>
            <div className="other-ways-card">
              <h3>Spread the Word</h3>
              <p>Share our resources with others. Awareness is crucial to building support for reform.</p>
              <Link href="/resources" className="cta-btn secondary">View Resources</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .donate-section {
          padding: 0 1.5rem 4rem;
          background: var(--bg-secondary, #f5f5f5);
        }

        .donate-container {
          max-width: 500px;
          margin: 0 auto;
        }

        .donate-content {
          background: var(--white, #ffffff);
          border-radius: 16px;
          padding: 2.5rem;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
          border: 1px solid var(--border, #e0e0e0);
        }

        .donate-heading {
          font-family: var(--font-display, 'Playfair Display', Georgia, serif);
          font-size: 1.75rem;
          color: var(--primary, #1a2744);
          margin-bottom: 0.5rem;
          text-align: center;
        }

        .donate-description {
          color: var(--text-muted, #6b7280);
          text-align: center;
          margin-bottom: 1.5rem;
          font-size: 0.9375rem;
          line-height: 1.6;
        }

        .impact-section {
          padding: 4rem 1.5rem;
          background: var(--bg-primary, #1a2744);
        }

        .impact-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .impact-section .section-title {
          color: var(--white, #ffffff);
          text-align: center;
          margin-bottom: 2.5rem;
          font-family: var(--font-display, 'Playfair Display', Georgia, serif);
          font-size: clamp(1.5rem, 3vw, 2rem);
        }

        .impact-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        @media (max-width: 900px) {
          .impact-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 500px) {
          .impact-grid {
            grid-template-columns: 1fr;
          }
        }

        .impact-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .impact-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, var(--accent, #d4a84b) 0%, #e6bc5a 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.75rem;
          color: var(--primary, #1a2744);
        }

        .impact-card h3 {
          color: var(--accent, #d4a84b);
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .impact-card p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.875rem;
          line-height: 1.6;
        }

        .other-ways-section {
          padding: 4rem 1.5rem;
          background: var(--bg-secondary, #f5f5f5);
        }

        .other-ways-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .other-ways-section .section-title {
          color: var(--primary, #1a2744);
          text-align: center;
          margin-bottom: 2rem;
          font-family: var(--font-display, 'Playfair Display', Georgia, serif);
          font-size: clamp(1.5rem, 3vw, 2rem);
        }

        .other-ways-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        @media (max-width: 600px) {
          .other-ways-grid {
            grid-template-columns: 1fr;
          }
        }

        .other-ways-card {
          background: var(--white, #ffffff);
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid var(--border, #e0e0e0);
          text-align: center;
        }

        .other-ways-card h3 {
          color: var(--primary, #1a2744);
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }

        .other-ways-card p {
          color: var(--text-muted, #6b7280);
          font-size: 0.9375rem;
          line-height: 1.6;
          margin-bottom: 1.25rem;
        }

        .donate-content :global(.donation-form) {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .donate-content :global(.donation-frequency) {
          display: flex;
          background: var(--bg-secondary, #f5f5f5);
          border-radius: 8px;
          padding: 4px;
        }

        .donate-content :global(.frequency-btn) {
          flex: 1;
          padding: 0.75rem 1rem;
          font-size: 0.9375rem;
          font-weight: 600;
          font-family: inherit;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--text-muted, #6b7280);
        }

        .donate-content :global(.frequency-btn.active) {
          background: var(--white, #ffffff);
          color: var(--primary, #1a2744);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .donate-content :global(.donation-presets) {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        @media (max-width: 400px) {
          .donate-content :global(.donation-presets) {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .donate-content :global(.preset-btn) {
          padding: 1rem;
          font-size: 1rem;
          font-weight: 600;
          font-family: inherit;
          background: var(--bg-secondary, #f5f5f5);
          border: 2px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--primary, #1a2744);
        }

        .donate-content :global(.preset-btn:hover) {
          border-color: var(--accent, #d4a84b);
        }

        .donate-content :global(.preset-btn.active) {
          background: var(--primary, #1a2744);
          color: var(--white, #ffffff);
          border-color: var(--primary, #1a2744);
        }

        .donate-content :global(.donation-custom) {
          display: flex;
          align-items: center;
          background: var(--bg-secondary, #f5f5f5);
          border-radius: 8px;
          border: 2px solid transparent;
          transition: all 0.2s ease;
        }

        .donate-content :global(.donation-custom:focus-within) {
          border-color: var(--accent, #d4a84b);
          background: var(--white, #ffffff);
        }

        .donate-content :global(.custom-currency) {
          padding: 0 0.75rem 0 1rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-muted, #6b7280);
        }

        .donate-content :global(.custom-input) {
          flex: 1;
          padding: 1rem 1rem 1rem 0;
          font-size: 1rem;
          font-family: inherit;
          background: transparent;
          border: none;
          color: var(--primary, #1a2744);
        }

        .donate-content :global(.custom-input:focus) {
          outline: none;
        }

        .donate-content :global(.donation-error) {
          color: var(--danger, #c53030);
          font-size: 0.875rem;
          text-align: center;
          margin: 0;
        }

        .donate-content :global(.donation-submit) {
          padding: 1rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          font-family: inherit;
          background: var(--accent, #d4a84b);
          color: var(--primary, #1a2744);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .donate-content :global(.donation-submit:hover:not(:disabled)) {
          background: var(--accent-dark, #c49b3d);
          transform: translateY(-1px);
        }

        .donate-content :global(.donation-submit:disabled) {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .donate-content :global(.donation-secure) {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: var(--text-muted, #6b7280);
          margin: 0;
        }

        .donate-content :global(.lock-icon) {
          width: 14px;
          height: 14px;
        }
      `}</style>
    </div>
  )
}
