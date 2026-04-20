import { getPayload } from 'payload'
import config from '@payload-config'
import ResourcesClient from './ResourcesClient'

// Force dynamic rendering to avoid build-time database connection
export const dynamic = 'force-dynamic'

// Revalidate every 60 seconds so CMS changes appear quickly
export const revalidate = 60

// Map CMS categories to display categories (icon names map to Lucide components in ResourcesClient)
const categoryMap: Record<string, { label: string; icon: string }> = {
  'cicp-stats': { label: 'CICP Data', icon: 'bar-chart' },
  'vicp-stats': { label: 'VICP Data', icon: 'trending-up' },
  'prep-act': { label: 'Regulatory', icon: 'file-text' },
  'gao': { label: 'Oversight', icon: 'search' },
  'legislation': { label: 'Legal', icon: 'scale' },
}

// Hardcoded resources — always available regardless of CMS state
const hardcodedResources = [
  // CICP Data
  { category: 'CICP Data', name: 'Table 1: COVID-19 Claims by Alleged Countermeasure', program: 'CICP', description: 'Claims breakdown by vaccine manufacturer and other COVID countermeasures', frequency: 'As updated', url: 'https://www.hrsa.gov/cicp/cicp-data', icon: 'bar-chart' },
  { category: 'CICP Data', name: 'Table 2: COVID-19 Claims by Alleged Injury', program: 'CICP', description: 'Claims categorized by injury type (myocarditis, GBS, etc.)', frequency: 'As updated', url: 'https://www.hrsa.gov/cicp/cicp-data', icon: 'bar-chart' },
  { category: 'CICP Data', name: 'Table 3: COVID-19 Claims Filed by Fiscal Year', program: 'CICP', description: 'Annual filing trends for COVID-19 countermeasure claims', frequency: 'As updated', url: 'https://www.hrsa.gov/cicp/cicp-data', icon: 'bar-chart' },
  { category: 'CICP Data', name: 'Table 4: CICP Claims Compensated', program: 'CICP', description: 'Detailed compensation data including injury type and amount paid', frequency: 'As updated', url: 'https://www.hrsa.gov/cicp/cicp-data/table-4', icon: 'bar-chart' },
  { category: 'CICP Data', name: 'Table 5: Claims Denied - Records Not Submitted', program: 'CICP', description: 'Claims denied due to missing medical documentation', frequency: 'As updated', url: 'https://www.hrsa.gov/cicp/cicp-data', icon: 'bar-chart' },
  { category: 'CICP Data', name: 'Table 6: Claims Denied - Filing Deadline Missed', program: 'CICP', description: 'Claims denied for missing 1-year filing deadline', frequency: 'As updated', url: 'https://www.hrsa.gov/cicp/cicp-data', icon: 'bar-chart' },
  { category: 'CICP Data', name: 'Table 7: Claims Denied - Standard of Proof Not Met', program: 'CICP', description: 'Claims denied on medical/scientific evidence grounds', frequency: 'As updated', url: 'https://www.hrsa.gov/cicp/cicp-data', icon: 'bar-chart' },
  { category: 'CICP Data', name: 'Table 8: Claims Ineligible - Not Covered', program: 'CICP', description: 'Claims for products not covered under PREP Act declarations', frequency: 'As updated', url: 'https://www.hrsa.gov/cicp/cicp-data', icon: 'bar-chart' },
  { category: 'CICP Data', name: 'Table 9: Non-COVID Countermeasure Claims', program: 'CICP', description: 'H1N1, smallpox, anthrax, and other countermeasure claims', frequency: 'As updated', url: 'https://www.hrsa.gov/cicp/cicp-data', icon: 'bar-chart' },
  { category: 'CICP Data', name: 'Table 10: Reconsideration Requests', program: 'CICP', description: 'Appeals data showing outcomes of reconsideration reviews', frequency: 'As updated', url: 'https://www.hrsa.gov/cicp/cicp-data', icon: 'bar-chart' },
  { category: 'CICP Data', name: 'HRSA CICP-VICP Comparison', program: 'CICP', description: 'Official side-by-side comparison of both programs', frequency: 'As updated', url: 'https://www.hrsa.gov/cicp/cicp-vicp', icon: 'bar-chart' },
  { category: 'CICP Data', name: 'CICP Fact Sheet', program: 'CICP', description: 'Program overview and filing guidance for claimants', frequency: 'As updated', url: 'https://www.hrsa.gov/sites/default/files/hrsa/cicp/cicpfactsheet.pdf', icon: 'bar-chart' },
  { category: 'CICP Data', name: 'CICP FAQ', program: 'CICP', description: 'Frequently asked questions about CICP eligibility and process', frequency: 'As updated', url: 'https://www.hrsa.gov/cicp/faq', icon: 'bar-chart' },
  { category: 'CICP Data', name: 'CICP Request for Benefits Form', program: 'CICP', description: 'Official claim submission form for CICP', frequency: 'As updated', url: 'https://www.hrsa.gov/cicp/filing', icon: 'bar-chart' },

  // VICP Data
  { category: 'VICP Data', name: 'VICP Monthly Statistics Report (March 2026)', program: 'VICP', description: 'Petitions filed, adjudications, awards paid, and dose distribution — primary source for H.R. 5142 financial model', frequency: 'Monthly', url: 'https://www.hrsa.gov/sites/default/files/hrsa/vicp/vicp-stats-03-01-26.pdf', icon: 'trending-up' },
  { category: 'VICP Data', name: 'VICP Data & Statistics Archive', program: 'VICP', description: 'Historical statistics reports dating back to program inception', frequency: 'As updated', url: 'https://www.hrsa.gov/vaccine-compensation/data', icon: 'trending-up' },
  { category: 'VICP Data', name: 'Vaccine Injury Table', program: 'VICP', description: 'Official table of covered vaccines and presumptive injuries', frequency: 'As updated', url: 'https://www.hrsa.gov/vaccine-compensation/table', icon: 'trending-up' },
  { category: 'VICP Data', name: 'VICP Adjudication Statistics', program: 'VICP', description: 'Detailed breakdown of petition outcomes by vaccine type', frequency: 'As updated', url: 'https://www.hrsa.gov/vaccine-compensation/data/adjudication', icon: 'trending-up' },
  { category: 'VICP Data', name: 'Vaccine Injury Table Revisions (2021)', program: 'VICP', description: 'Most recent major Federal Register table revision', frequency: 'As updated', url: 'https://www.federalregister.gov/documents/2021/01/21/2021-01211/national-vaccine-injury-compensation-program-revisions-to-the-vaccine-injury-table', icon: 'trending-up' },
  { category: 'VICP Data', name: 'VICP Program Booklet', program: 'VICP', description: 'Comprehensive program guide for petitioners', frequency: 'As updated', url: 'https://www.hrsa.gov/sites/default/files/hrsa/vicp/about-vaccine-injury-compensation-program-booklet.pdf', icon: 'trending-up' },
  { category: 'VICP Data', name: 'VICP FAQ', program: 'VICP', description: 'Frequently asked questions about VICP eligibility and process', frequency: 'As updated', url: 'https://www.hrsa.gov/vaccine-compensation/faq', icon: 'trending-up' },
  { category: 'VICP Data', name: 'VICP Petition Forms', program: 'VICP', description: 'Required forms for filing VICP petitions', frequency: 'As updated', url: 'https://www.hrsa.gov/vaccine-compensation/filing', icon: 'trending-up' },
  { category: 'VICP Data', name: 'CDC MMWR: RSV Vaccine Safety Findings', program: 'VICP', description: 'GBS rates of 4.4-6.5 per million doses in adults 60+ — used for new vaccine claim projections', frequency: 'July 2024', url: 'https://www.cdc.gov/mmwr/volumes/73/wr/mm7321a3.htm', icon: 'trending-up' },
  { category: 'VICP Data', name: 'FDA: RSV Vaccine GBS Warning Requirement', program: 'VICP', description: 'January 2025 safety communication requiring GBS warning on Abrysvo and Arexvy', frequency: 'January 2025', url: 'https://www.fda.gov/safety/medical-product-safety-information/fda-requires-guillain-barre-syndrome-gbs-warning-prescribing-information-rsv-vaccines-abrysvo-and', icon: 'trending-up' },

  // Regulatory
  { category: 'Regulatory', name: 'CICP Final Rule (42 CFR Part 110)', program: 'CICP', description: 'Official regulations governing CICP administration', frequency: 'As updated', url: 'https://www.federalregister.gov/documents/2011/10/07/2011-25858/countermeasures-injury-compensation-program-cicp-administrative-implementation-final-rule', icon: 'file-text' },
  { category: 'Regulatory', name: 'Covered Countermeasures List', program: 'CICP', description: 'Current list of all PREP Act covered countermeasures', frequency: 'As updated', url: 'https://www.hrsa.gov/cicp/covered-countermeasures', icon: 'file-text' },

  // Oversight
  { category: 'Oversight', name: 'GAO-25-107368: CICP Operations Report', program: 'Both', description: 'December 2024 GAO report on CICP challenges and recommendations', frequency: 'December 2024', url: 'https://www.gao.gov/products/gao-25-107368', icon: 'search' },
  { category: 'Oversight', name: 'GAO-15-142: Vaccine Injury Program Administration', program: 'Both', description: 'GAO report on VICP administrative costs across three agencies (USCFC, HRSA, DOJ) with staffing data', frequency: '2015', url: 'https://www.gao.gov/products/gao-15-142', icon: 'search' },
  { category: 'Oversight', name: 'HHS OIG Vaccine Program Reports', program: 'Both', description: 'Inspector General reports on vaccine compensation programs', frequency: 'As updated', url: 'https://oig.hhs.gov/', icon: 'search' },

  // Legal
  { category: 'Legal', name: 'H.R. 5142: Vaccine Injury Compensation Modernization Act', program: 'Both', description: 'Full bill text — raises special masters to 10+, adds COVID vaccines to VICP, increases excise to $2.20', frequency: '118th Congress', url: 'https://www.congress.gov/bill/118th-congress/house-bill/5142/text', icon: 'scale' },
  { category: 'Legal', name: 'U.S. Court of Federal Claims - Vaccine Cases', program: 'Both', description: 'Published decisions from the Office of Special Masters', frequency: 'As updated', url: 'https://www.uscfc.uscourts.gov/vaccine-programoffice-special-masters', icon: 'scale' },
  { category: 'Legal', name: 'Special Masters Decisions Database', program: 'Both', description: 'Searchable database of VICP case decisions', frequency: 'As updated', url: 'https://www.uscfc.uscourts.gov/', icon: 'scale' },
  { category: 'Legal', name: 'CRS Report R46982: CICP Overview', program: 'Both', description: 'Congressional Research Service analysis of CICP structure and issues', frequency: 'April 2025', url: 'https://crsreports.congress.gov/product/pdf/R/R46982', icon: 'scale' },
  { category: 'Legal', name: 'CRS Report IF12213: VICP Overview', program: 'Both', description: 'Congressional Research Service analysis of VICP and Special Masters', frequency: 'As updated', url: 'https://www.congress.gov/crs-product/IF12213', icon: 'scale' },
  { category: 'Legal', name: 'CRS IF12625 & IF13011: Judiciary Budget Requests', program: 'Both', description: 'Office of Special Masters budget: $10M/yr for 8 masters (~$1.25M per master fully loaded)', frequency: 'FY2025-2026', url: 'https://www.everycrsreport.com/reports/IF13011.html', icon: 'scale' },
  { category: 'Legal', name: '42 U.S.C. 300aa-12: Special Master Compensation', program: 'Both', description: 'Statutory salary caps — Chief Special Master: Executive Schedule Level IV ($197K); others: Level V ($185K)', frequency: 'U.S. Code', url: 'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title42-section300aa-12&num=0&edition=prelim', icon: 'scale' },
  { category: 'Legal', name: '26 U.S.C. 9510: Vaccine Injury Compensation Trust Fund', program: 'Both', description: 'Statutory framework for the Trust Fund including administrative expense caps and excise tax provisions', frequency: 'U.S. Code', url: 'https://www.law.cornell.edu/uscode/text/26/9510', icon: 'scale' },
  { category: 'Legal', name: 'OPM Executive Schedule Pay Tables (2026)', program: 'Both', description: 'Current salary rates: Level IV ($197,200) and Level V ($184,900) — sets special master pay', frequency: '2026', url: 'https://www.opm.gov/policy-data-oversight/pay-leave/salaries-wages/salary-tables/26Tables/exec/html/EX.aspx', icon: 'scale' },
  { category: 'Legal', name: 'Zhao et al. (2022) - CICP Reform Analysis', program: 'Both', description: 'Journal of Law & Biosciences article on CICP reform options and Trust Fund interest income', frequency: '2022', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8977129/', icon: 'scale' },

  // Independent Analysis (third-party, not affiliated with this site)
  { category: 'Independent Analysis', name: 'HowBadIsMyBatch — Vaccine Lot Data Explorer', program: 'Both', description: 'Third-party tool correlating COVID-19 vaccine batch codes with VAERS adverse event reports. Maintained independently by Frank Knoll. Not affiliated with this site; methodology and conclusions are the author\'s own.', frequency: 'Updated regularly', url: 'https://knollfrank.github.io/HowBadIsMyBatch/batchCodes.html', icon: 'search' },
]

export default async function ResourcesPage() {
  let cmsResources: typeof hardcodedResources = []

  try {
    const payload = await getPayload({ config })
    const resourcesData = await payload.find({
      collection: 'resources',
      limit: 100,
      sort: 'order',
    })

    cmsResources = resourcesData.docs.map((doc) => {
      const catInfo = categoryMap[doc.category] || { label: doc.category, icon: 'file-text' }
      let program = 'Both'
      if (doc.category === 'cicp-stats' || doc.category === 'prep-act') {
        program = 'CICP'
      } else if (doc.category === 'vicp-stats') {
        program = 'VICP'
      }

      return {
        category: catInfo.label,
        name: doc.title,
        program,
        description: doc.description || '',
        frequency: 'As updated',
        url: doc.url,
        icon: catInfo.icon,
      }
    })
  } catch {
    // CMS unavailable — fall through to hardcoded data
  }

  // Always use hardcoded resources as the canonical set (includes all financial model sources)
  const resources = hardcodedResources

  const counts = {
    total: resources.length,
    cicp: resources.filter(r => r.program === 'CICP').length,
    vicp: resources.filter(r => r.program === 'VICP').length,
    both: resources.filter(r => r.program === 'Both').length,
  }

  return <ResourcesClient resources={resources} counts={counts} />
}
