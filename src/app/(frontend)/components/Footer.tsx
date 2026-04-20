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
        <p className="citation"><sup>5</sup> Centers for Disease Control and Prevention. &ldquo;Early Safety Findings Among Persons Aged ≥60 Years Who Received a Respiratory Syncytial Virus Vaccine.&rdquo; MMWR, July 2024. GBS rates: 4.4–6.5 per million doses. <a href="https://www.cdc.gov/mmwr/volumes/73/wr/mm7321a3.htm" target="_blank" rel="noopener noreferrer">https://www.cdc.gov/mmwr/volumes/73/wr/mm7321a3.htm</a></p>
        <p className="citation"><sup>6</sup> U.S. Food &amp; Drug Administration. &ldquo;FDA Requires Guillain-Barré Syndrome (GBS) Warning in Prescribing Information for RSV Vaccines.&rdquo; January 2025. <a href="https://www.fda.gov/safety/medical-product-safety-information/fda-requires-guillain-barre-syndrome-gbs-warning-prescribing-information-rsv-vaccines-abrysvo-and" target="_blank" rel="noopener noreferrer">fda.gov</a></p>
        <p className="citation"><sup>7</sup> Congressional Research Service. &ldquo;Judiciary Budget Request, FY2025–2026.&rdquo; Office of Special Masters budget: $10M/yr for 8 masters (~$1.25M per master). IF12625, IF13011. <a href="https://www.everycrsreport.com/reports/IF13011.html" target="_blank" rel="noopener noreferrer">everycrsreport.com</a></p>
        <p className="citation"><sup>8</sup> 42 U.S.C. §300aa-12. Special master salary caps: Executive Schedule Level IV ($197,200) / Level V ($184,900). <a href="https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title42-section300aa-12&num=0&edition=prelim" target="_blank" rel="noopener noreferrer">uscode.house.gov</a></p>
        <p className="citation"><sup>9</sup> Zhao et al. (2022). &ldquo;Reforming the Countermeasures Injury Compensation Program.&rdquo; Journal of Law &amp; Biosciences. Trust Fund interest income analysis. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8977129/" target="_blank" rel="noopener noreferrer">pmc.ncbi.nlm.nih.gov</a></p>
        <p className="citation"><sup>10</sup> H.R. 5142, 118th Congress. Vaccine Injury Compensation Modernization Act. <a href="https://www.congress.gov/bill/118th-congress/house-bill/5142/text" target="_blank" rel="noopener noreferrer">congress.gov</a></p>
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
