import { NextRequest, NextResponse } from 'next/server'
import yaml from 'js-yaml'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { log } from '@/lib/logger'

interface WIMRResult {
  name: string
  party: string
  state: string
  district: string
  phone: string
  office: string
  link: string
}

interface WIMRResponse {
  results: WIMRResult[]
}

interface LegislatorTerm {
  type: string
  state: string
  district?: number
  contact_form?: string
  url?: string
  phone?: string
}

interface Legislator {
  id: { bioguide: string }
  name: { official_full?: string; first: string; last: string }
  terms: LegislatorTerm[]
}

interface Representative {
  name: string
  office: string
  party: string
  phone: string
  website: string
  contactForm: string
  state: string
  district: string
}

// Cache for legislators data
let legislatorsCache: Legislator[] | null = null
let legislatorsCacheTime = 0
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

async function getLegislatorsData(): Promise<Legislator[]> {
  const now = Date.now()

  if (legislatorsCache && (now - legislatorsCacheTime) < CACHE_DURATION) {
    return legislatorsCache
  }

  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/unitedstates/congress-legislators/main/legislators-current.yaml',
      { next: { revalidate: 86400 } }
    )

    if (!response.ok) {
      log.error('legislators_fetch_failed', { status: response.status })
      return []
    }

    const yamlText = await response.text()
    const data = yaml.load(yamlText) as Legislator[]

    legislatorsCache = data
    legislatorsCacheTime = now

    return data
  } catch (error) {
    log.error('legislators_fetch_error', { error })
    return []
  }
}

function findContactForm(legislators: Legislator[], name: string, state: string): string {
  // Normalize the name for matching
  const normalizedName = name.toLowerCase().trim()

  for (const legislator of legislators) {
    const officialName = legislator.name.official_full?.toLowerCase() || ''
    const fullName = `${legislator.name.first} ${legislator.name.last}`.toLowerCase()

    if (officialName.includes(normalizedName) ||
        normalizedName.includes(officialName) ||
        fullName.includes(normalizedName) ||
        normalizedName.includes(fullName) ||
        normalizedName.includes(legislator.name.last.toLowerCase())) {

      // Get the most recent term
      const currentTerm = legislator.terms[legislator.terms.length - 1]

      if (currentTerm && currentTerm.state === state && currentTerm.contact_form) {
        return currentTerm.contact_form
      }
    }
  }

  return ''
}

export async function GET(request: NextRequest) {
  // Rate limiting: 30 lookups per hour per IP
  const clientIP = getClientIP(request)
  const rateLimit = await checkRateLimit(`reps:${clientIP}`, {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 30
  })

  if (!rateLimit.success) {
    const retryAfterSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.max(1, retryAfterSeconds)) }
      }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const zipCode = searchParams.get('zip')

  if (!zipCode || !/^\d{5}$/.test(zipCode)) {
    return NextResponse.json(
      { error: 'Please enter a valid 5-digit ZIP code' },
      { status: 400 }
    )
  }

  try {
    // Fetch both data sources in parallel
    const [wimrResponse, legislators] = await Promise.all([
      fetch(
        `https://whoismyrepresentative.com/getall_mems.php?zip=${zipCode}&output=json`,
        {
          headers: { 'User-Agent': 'CovidVaccineInjury/1.0' }
        }
      ),
      getLegislatorsData()
    ])

    if (!wimrResponse.ok) {
      throw new Error(`API returned ${wimrResponse.status}`)
    }

    const text = await wimrResponse.text()

    // Handle case where no results are found
    if (text.includes('<!DOCTYPE') || text.includes('<html')) {
      return NextResponse.json(
        { error: 'No representatives found for this ZIP code. Please verify and try again.' },
        { status: 404 }
      )
    }

    let data: WIMRResponse
    try {
      data = JSON.parse(text)
    } catch {
      return NextResponse.json(
        { error: 'Unable to parse response. Please try again.' },
        { status: 500 }
      )
    }

    if (!data.results || data.results.length === 0) {
      return NextResponse.json(
        { error: 'No representatives found for this ZIP code.' },
        { status: 404 }
      )
    }

    // Process the response and enrich with contact form data
    const representatives: Representative[] = data.results.map((rep) => {
      const isSenator = !rep.district || rep.district === ''
      const officeName = isSenator
        ? `U.S. Senator - ${rep.state}`
        : `U.S. Representative - ${rep.state} District ${rep.district}`

      // Try to find contact form URL from legislators data
      let contactForm = findContactForm(legislators, rep.name, rep.state)

      // Fallback: construct likely contact URL from website
      if (!contactForm && rep.link) {
        // Most congressional sites use /contact
        contactForm = rep.link.replace(/\/$/, '') + '/contact'
      }

      return {
        name: rep.name,
        office: officeName,
        party: rep.party || 'Unknown',
        phone: rep.phone || '',
        website: rep.link || '',
        contactForm: contactForm,
        state: rep.state,
        district: rep.district || ''
      }
    })

    // Sort so Senators appear first
    representatives.sort((a, b) => {
      const aIsSenator = a.office.includes('Senator')
      const bIsSenator = b.office.includes('Senator')
      if (aIsSenator && !bIsSenator) return -1
      if (!aIsSenator && bIsSenator) return 1
      return 0
    })

    return NextResponse.json({
      representatives,
      source: 'whoismyrepresentative.com + unitedstates/congress-legislators'
    })
  } catch (error) {
    log.error('representative_lookup_error', { error })
    return NextResponse.json(
      { error: 'Unable to look up representatives. Please try the official directories below.' },
      { status: 500 }
    )
  }
}
