import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'

const resources = [
  { title: "Table 1: COVID-19 Claims by Alleged Countermeasure", description: "Claims breakdown by vaccine manufacturer and other COVID countermeasures", url: "https://www.hrsa.gov/cicp/cicp-data", category: "cicp-stats" as const, sourceType: "government" as const, order: 1 },
  { title: "Table 2: COVID-19 Claims by Alleged Injury", description: "Claims categorized by injury type (myocarditis, GBS, etc.)", url: "https://www.hrsa.gov/cicp/cicp-data", category: "cicp-stats" as const, sourceType: "government" as const, order: 2 },
  { title: "Table 3: COVID-19 Claims Filed by Fiscal Year", description: "Annual filing trends for COVID-19 countermeasure claims", url: "https://www.hrsa.gov/cicp/cicp-data", category: "cicp-stats" as const, sourceType: "government" as const, order: 3 },
  { title: "Table 4: CICP Claims Compensated", description: "Detailed compensation data including injury type and amount paid", url: "https://www.hrsa.gov/cicp/cicp-data/table-4", category: "cicp-stats" as const, sourceType: "government" as const, order: 4 },
  { title: "Table 5: Claims Denied - Records Not Submitted", description: "Claims denied due to missing medical documentation", url: "https://www.hrsa.gov/cicp/cicp-data", category: "cicp-stats" as const, sourceType: "government" as const, order: 5 },
  { title: "Table 6: Claims Denied - Filing Deadline Missed", description: "Claims denied for missing 1-year filing deadline", url: "https://www.hrsa.gov/cicp/cicp-data", category: "cicp-stats" as const, sourceType: "government" as const, order: 6 },
  { title: "Table 7: Claims Denied - Standard of Proof Not Met", description: "Claims denied on medical/scientific evidence grounds", url: "https://www.hrsa.gov/cicp/cicp-data", category: "cicp-stats" as const, sourceType: "government" as const, order: 7 },
  { title: "Table 8: Claims Ineligible - Not Covered", description: "Claims for products not covered under PREP Act declarations", url: "https://www.hrsa.gov/cicp/cicp-data", category: "cicp-stats" as const, sourceType: "government" as const, order: 8 },
  { title: "Table 9: Non-COVID Countermeasure Claims", description: "H1N1, smallpox, anthrax, and other countermeasure claims", url: "https://www.hrsa.gov/cicp/cicp-data", category: "cicp-stats" as const, sourceType: "government" as const, order: 9 },
  { title: "Table 10: Reconsideration Requests", description: "Appeals data showing outcomes of reconsideration reviews", url: "https://www.hrsa.gov/cicp/cicp-data", category: "cicp-stats" as const, sourceType: "government" as const, order: 10 },
  { title: "VICP Monthly Statistics Report", description: "Comprehensive monthly data on petitions filed, adjudicated, and compensated", url: "https://www.hrsa.gov/vaccine-compensation/data", category: "vicp-stats" as const, sourceType: "government" as const, order: 11 },
  { title: "VICP Data & Statistics Archive", description: "Historical statistics reports dating back to program inception", url: "https://www.hrsa.gov/vaccine-compensation/data", category: "vicp-stats" as const, sourceType: "government" as const, order: 12 },
  { title: "Vaccine Injury Table", description: "Official table of covered vaccines and presumptive injuries", url: "https://www.hrsa.gov/vaccine-compensation/table", category: "vicp-stats" as const, sourceType: "government" as const, order: 13 },
  { title: "VICP Adjudication Statistics", description: "Detailed breakdown of petition outcomes by vaccine type", url: "https://www.hrsa.gov/vaccine-compensation/data/adjudication", category: "vicp-stats" as const, sourceType: "government" as const, order: 14 },
  { title: "U.S. Court of Federal Claims - Vaccine Cases", description: "Published decisions from the Office of Special Masters", url: "https://www.uscfc.uscourts.gov/vaccine-programoffice-special-masters", category: "legislation" as const, sourceType: "legal" as const, order: 15 },
  { title: "Special Masters Decisions Database", description: "Searchable database of VICP case decisions", url: "https://www.uscfc.uscourts.gov/", category: "legislation" as const, sourceType: "legal" as const, order: 16 },
  { title: "GAO-25-107368: CICP Operations Report", description: "December 2024 GAO report on CICP challenges and recommendations", url: "https://www.gao.gov/products/gao-25-107368", category: "gao" as const, sourceType: "government" as const, order: 17 },
  { title: "HHS OIG Vaccine Program Reports", description: "Inspector General reports on vaccine compensation programs", url: "https://oig.hhs.gov/", category: "gao" as const, sourceType: "government" as const, order: 18 },
  { title: "CRS Report R46982: CICP Overview", description: "Congressional Research Service analysis of CICP structure and issues", url: "https://crsreports.congress.gov/product/pdf/R/R46982", category: "legislation" as const, sourceType: "government" as const, order: 19 },
  { title: "CRS Report IF12213: VICP Overview", description: "Congressional Research Service analysis of VICP and Special Masters", url: "https://www.congress.gov/crs-product/IF12213", category: "legislation" as const, sourceType: "government" as const, order: 20 },
  { title: "Zhao et al. (2022) - CICP Reform Analysis", description: "Journal of Law & Biosciences article on CICP reform options", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8977129/", category: "legislation" as const, sourceType: "academic" as const, order: 21 },
  { title: "CICP Final Rule (42 CFR Part 110)", description: "Official regulations governing CICP administration", url: "https://www.federalregister.gov/documents/2011/10/07/2011-25858/countermeasures-injury-compensation-program-cicp-administrative-implementation-final-rule", category: "prep-act" as const, sourceType: "government" as const, order: 22 },
  { title: "Covered Countermeasures List", description: "Current list of all PREP Act covered countermeasures", url: "https://www.hrsa.gov/cicp/covered-countermeasures", category: "prep-act" as const, sourceType: "government" as const, order: 23 },
  { title: "Vaccine Injury Table Revisions (2021)", description: "Most recent major Federal Register table revision", url: "https://www.federalregister.gov/documents/2021/01/21/2021-01211/national-vaccine-injury-compensation-program-revisions-to-the-vaccine-injury-table", category: "vicp-stats" as const, sourceType: "government" as const, order: 24 },
  { title: "CICP Fact Sheet", description: "Program overview and filing guidance for claimants", url: "https://www.hrsa.gov/sites/default/files/hrsa/cicp/cicpfactsheet.pdf", category: "cicp-stats" as const, sourceType: "government" as const, order: 25 },
  { title: "VICP Program Booklet", description: "Comprehensive program guide for petitioners", url: "https://www.hrsa.gov/sites/default/files/hrsa/vicp/about-vaccine-injury-compensation-program-booklet.pdf", category: "vicp-stats" as const, sourceType: "government" as const, order: 26 },
  { title: "HRSA CICP-VICP Comparison", description: "Official side-by-side comparison of both programs", url: "https://www.hrsa.gov/cicp/cicp-vicp", category: "cicp-stats" as const, sourceType: "government" as const, order: 27 },
  { title: "CICP FAQ", description: "Frequently asked questions about CICP eligibility and process", url: "https://www.hrsa.gov/cicp/faq", category: "cicp-stats" as const, sourceType: "government" as const, order: 28 },
  { title: "VICP FAQ", description: "Frequently asked questions about VICP eligibility and process", url: "https://www.hrsa.gov/vaccine-compensation/faq", category: "vicp-stats" as const, sourceType: "government" as const, order: 29 },
  { title: "CICP Request for Benefits Form", description: "Official claim submission form for CICP", url: "https://www.hrsa.gov/cicp/filing", category: "cicp-stats" as const, sourceType: "government" as const, order: 30 },
  { title: "VICP Petition Forms", description: "Required forms for filing VICP petitions", url: "https://www.hrsa.gov/vaccine-compensation/filing", category: "vicp-stats" as const, sourceType: "government" as const, order: 31 },
]

const faqs = [
  // VICP FAQs
  {
    question: "What is the VICP?",
    answer: "The Vaccine Injury Compensation Program (VICP) is a federal no-fault program established in 1986 to compensate individuals injured by covered childhood vaccines. It provides a streamlined alternative to traditional litigation.",
    category: "vicp" as const,
    order: 1,
  },
  {
    question: "What vaccines are covered by VICP?",
    answer: "VICP covers vaccines recommended by the CDC for routine administration to children, including DTaP, MMR, Polio, Hepatitis B, Hib, Varicella, Pneumococcal, Rotavirus, Hepatitis A, Meningococcal, HPV, and seasonal influenza vaccines.",
    category: "vicp" as const,
    order: 2,
  },
  {
    question: "What is the VICP compensation rate?",
    answer: "The VICP has compensated approximately 36% of all petitions adjudicated since 1988, with over $5 billion paid out to date. The average compensated claim receives around $600,000.",
    category: "vicp" as const,
    order: 3,
  },
  {
    question: "How do I file a VICP claim?",
    answer: "VICP claims are filed in the U.S. Court of Federal Claims. You must file within 3 years of symptom onset. An attorney is recommended but not required. The petition must include medical records documenting the injury.",
    category: "vicp" as const,
    order: 4,
  },
  // CICP FAQs
  {
    question: "What is the CICP?",
    answer: "The Countermeasures Injury Compensation Program (CICP) is an administrative program that provides compensation for serious injuries caused by covered countermeasures, including COVID-19 vaccines, under the PREP Act.",
    category: "cicp" as const,
    order: 1,
  },
  {
    question: "Why is CICP compensation so low?",
    answer: "CICP has compensated only about 4% of COVID-19 vaccine injury claims filed. The program has a strict 1-year filing deadline, requires a higher standard of proof, provides no legal representation, and offers limited benefits with caps on lost wages and no pain and suffering damages.",
    category: "cicp" as const,
    order: 2,
  },
  {
    question: "What is the CICP filing deadline?",
    answer: "Claims must be filed within 1 year of receiving the covered countermeasure or the date of injury, whichever is later. This is significantly shorter than VICP's 3-year deadline.",
    category: "cicp" as const,
    order: 3,
  },
  {
    question: "Can I appeal a CICP denial?",
    answer: "CICP allows one request for reconsideration by the same agency that made the initial decision. There is no independent judicial review or appeal to federal court, unlike VICP which allows appeals to the Court of Federal Claims.",
    category: "cicp" as const,
    order: 4,
  },
  {
    question: "What benefits does CICP provide?",
    answer: "CICP covers reasonable medical expenses not covered by other sources, lost wages (capped at $50,000 per year), and death benefits ($370,376). Unlike VICP, CICP does not provide compensation for pain and suffering, future lost earnings, or attorneys' fees.",
    category: "cicp" as const,
    order: 5,
  },
  // PREP Act FAQs
  {
    question: "What is the PREP Act?",
    answer: "The Public Readiness and Emergency Preparedness (PREP) Act, passed in 2005, provides broad liability immunity to manufacturers, distributors, and administrators of covered medical countermeasures during declared public health emergencies.",
    category: "prep-act" as const,
    order: 1,
  },
  {
    question: "How does the PREP Act affect my ability to sue?",
    answer: "The PREP Act provides near-complete immunity from lawsuits for vaccine manufacturers and healthcare providers. The only exception is for 'willful misconduct,' which requires proving the defendant acted intentionally to cause harm—an extremely high legal bar.",
    category: "prep-act" as const,
    order: 2,
  },
  {
    question: "When does the COVID-19 PREP Act declaration expire?",
    answer: "The COVID-19 PREP Act declaration was extended through December 31, 2024, and may be extended further. After expiration, new injuries may have different legal options, but injuries occurring during the declaration period remain covered under CICP.",
    category: "prep-act" as const,
    order: 3,
  },
  // Reform FAQs
  {
    question: "What reforms are being proposed for CICP?",
    answer: "Proposed reforms include: extending the filing deadline from 1 to 3+ years, allowing judicial review of denials, providing attorneys' fees, adding pain and suffering compensation, creating an independent appeals process, and potentially moving COVID vaccines to VICP.",
    category: "reform" as const,
    order: 1,
  },
  {
    question: "Could COVID-19 vaccines be added to VICP?",
    answer: "Yes, legislation has been proposed (like the VACCINE Act) to move COVID-19 vaccines from CICP to VICP, which would provide significantly better compensation, longer filing deadlines, judicial oversight, and attorneys' fees for injured individuals.",
    category: "reform" as const,
    order: 2,
  },
  {
    question: "How can I support reform efforts?",
    answer: "Contact your Congressional representatives to express support for CICP reform legislation. Share your story with advocacy organizations. The VICP Trust Fund has over $4.8 billion in reserves that could help fund expanded compensation for COVID vaccine injuries.",
    category: "reform" as const,
    order: 3,
  },
]

async function seed() {
  const payload = await getPayload({ config })

  console.log('Seeding resources...')
  for (const resource of resources) {
    try {
      await payload.create({
        collection: 'resources',
        data: resource,
      })
      console.log(`Created resource: ${resource.title}`)
    } catch (_error) {
      console.log(`Resource may already exist: ${resource.title}`)
    }
  }

  console.log('\nSeeding FAQs...')
  for (const faq of faqs) {
    try {
      await payload.create({
        collection: 'faqs',
        data: {
          question: faq.question,
          answer: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [{ type: 'text', text: faq.answer, version: 1 }],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
          category: faq.category,
          order: faq.order,
        },
      })
      console.log(`Created FAQ: ${faq.question}`)
    } catch (_error) {
      console.log(`FAQ may already exist: ${faq.question}`)
    }
  }

  console.log('\nSeeding complete!')
  process.exit(0)
}

seed()
