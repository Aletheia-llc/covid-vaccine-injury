'use client'

import Link from 'next/link'
import CICPRoulette from '../components/CICPRoulette'

export default function RoulettePage() {
  return (
    <div className="roulette-page">
      <nav className="roulette-nav">
        <Link href="/" className="back-link">
          ← Back to Home
        </Link>
      </nav>

      <main className="roulette-main">
        <CICPRoulette />

        <div className="roulette-cta">
          <p>Want to help change these odds?</p>
          <Link href="/#action" className="action-btn">
            Contact Your Representatives
          </Link>
        </div>
      </main>

      <style jsx>{`
        .roulette-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0d1b2a 0%, #1b263b 100%);
          padding: 24px;
        }

        .roulette-nav {
          max-width: 480px;
          margin: 0 auto 24px;
        }

        .back-link {
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s ease;
        }

        .back-link:hover {
          color: white;
        }

        .roulette-main {
          max-width: 480px;
          margin: 0 auto;
        }

        .roulette-cta {
          margin-top: 32px;
          text-align: center;
        }

        .roulette-cta p {
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 16px;
        }

        .action-btn {
          display: inline-block;
          background: linear-gradient(135deg, #c4a052 0%, #a08042 100%);
          color: #0d1b2a;
          padding: 14px 28px;
          border-radius: 100px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(196, 160, 82, 0.3);
        }
      `}</style>
    </div>
  )
}
