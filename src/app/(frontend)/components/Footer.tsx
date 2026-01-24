'use client'

import Link from 'next/link'
import { Scale } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-logo">
        <Scale size={20} />
        <span>U.S. Covid Vaccine Injuries</span>
      </div>
      <p className="footer-text">Advocating for fair compensation for all vaccine-injured Americans.</p>
      <div id="citations" className="footer-citations">
        <p className="citations-title">Citations</p>
        <p className="citation"><sup>1</sup> Health Resources &amp; Services Administration. &ldquo;CICP Data.&rdquo; COVID-19 Covered Countermeasures claims statistics. <a href="https://www.hrsa.gov/cicp/cicp-data" target="_blank" rel="noopener noreferrer">https://www.hrsa.gov/cicp/cicp-data</a></p>
        <p className="citation"><sup>2</sup> Health Resources &amp; Services Administration. &ldquo;National Vaccine Injury Compensation Program Data.&rdquo; VICP statistics and compensation data. <a href="https://www.hrsa.gov/vaccine-compensation/data" target="_blank" rel="noopener noreferrer">https://www.hrsa.gov/vaccine-compensation/data</a></p>
        <p className="citation"><sup>3</sup> U.S. Government Accountability Office. &ldquo;COVID-19: HRSA Should Address Lengthy Processing of Injury Compensation Claims.&rdquo; GAO-25-107368. <a href="https://www.gao.gov/products/gao-25-107368" target="_blank" rel="noopener noreferrer">https://www.gao.gov/products/gao-25-107368</a></p>
        <p className="citation"><sup>4</sup> Health Resources &amp; Services Administration. &ldquo;CICP Data - Table 4: COVID-19 Covered Countermeasures.&rdquo; Median payment calculation from compensated claims. <a href="https://www.hrsa.gov/cicp/cicp-data/table-4" target="_blank" rel="noopener noreferrer">https://www.hrsa.gov/cicp/cicp-data/table-4</a></p>
      </div>
      <p className="footer-disclaimer">
        This website is for informational and advocacy purposes only. Nothing on this site
        constitutes legal, medical, or financial advice. Consult qualified professionals
        for guidance on your specific situation. We are not affiliated with HRSA, HHS,
        or any government agency.
      </p>
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
