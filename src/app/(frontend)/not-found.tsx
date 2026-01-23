'use client'

import Link from 'next/link'
import './styles.css'
import Header from './components/Header'
import Footer from './components/Footer'

export default function NotFound() {
  return (
    <div>
      <Header />

      <main className="not-found-page">
        <div className="not-found-container">
          <div className="not-found-code">404</div>
          <h1>Page Not Found</h1>
          <p>The page you are looking for does not exist or has been moved.</p>
          <div className="not-found-actions">
            <Link href="/" className="hero-btn primary">Return Home</Link>
            <Link href="/faq" className="hero-btn secondary-dark">View FAQ</Link>
          </div>
          <div className="not-found-links">
            <p>Looking for something specific?</p>
            <ul>
              <li><Link href="/#data">View CICP Data</Link></li>
              <li><Link href="/#comparison">Compare Programs</Link></li>
              <li><Link href="/resources">Data Resources</Link></li>
              <li><Link href="/#action">Contact Congress</Link></li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
