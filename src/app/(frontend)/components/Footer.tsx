'use client'

import Link from 'next/link'
import { Scale } from 'lucide-react'

interface FooterProps {
  showDataSources?: boolean
}

export default function Footer({ showDataSources = false }: FooterProps) {
  return (
    <footer className="footer">
      <div className="footer-logo">
        <Scale size={20} />
        <span>U.S. Covid Vaccine Injuries</span>
      </div>
      {showDataSources && (
        <p className="footer-text" style={{ fontSize: '13px', maxWidth: '800px', margin: '0 auto 12px' }}>
          <strong>Data Sources:</strong> CICP median ($4,132) calculated from <a href="https://www.hrsa.gov/cicp/cicp-data/table-4">HRSA Table 4</a> (Dec 2025, n=42 COVID claims).
          VICP average ($450K) from <a href="https://www.hrsa.gov/vaccine-compensation/data">HRSA VICP Statistics</a> (2006-2020).
          Additional data from GAO-25-107368 and CRS R46982.
        </p>
      )}
      <p className="footer-text">Advocating for fair compensation for all vaccine-injured Americans.</p>
      <div className="footer-links">
        <Link href="/">Home</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/resources">Data Resources</Link>
        <Link href="/#action">Take Action</Link>
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/terms">Terms of Service</Link>
      </div>
      <p className="footer-attribution">designed by <a href="https://aletheia.llc" target="_blank" rel="noopener noreferrer">aletheia.llc</a></p>
    </footer>
  )
}
