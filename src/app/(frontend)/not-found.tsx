import Link from 'next/link'
import './styles.css'

export default function NotFound() {
  return (
    <div>
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <span>U.S. Covid Vaccine Injuries</span>
          </Link>
          <ul className="nav-links">
            <li><Link href="/#data">Data</Link></li>
            <li><Link href="/#comparison">Programs</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/resources">Resources</Link></li>
            <li><Link href="/survey">Survey</Link></li>
          </ul>
          <Link href="/#action" className="nav-cta">Take Action</Link>
        </div>
      </nav>

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

      <footer className="footer">
        <div className="footer-logo">
          <span>U.S. Covid Vaccine Injuries</span>
        </div>
        <p className="footer-text">Advocating for fair compensation for all vaccine-injured Americans.</p>
        <div className="footer-links">
          <Link href="/">Home</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/resources">Resources</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
        </div>
      </footer>
    </div>
  )
}
