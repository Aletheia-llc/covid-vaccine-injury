import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

export async function GET() {
  try {
    const payload = await getPayload({ config })

    const { docs } = await payload.find({
      collection: 'statistics',
      where: {
        displayOnHomepage: { equals: true },
      },
      sort: 'displayOrder',
      limit: 100,
    })

    // Transform into a keyed object for easy access
    const statistics: Record<string, {
      value: string
      numericValue: number | null
      label: string
      source: string
      sourceUrl: string | null
      asOfDate: string
      program: string
    }> = {}

    for (const doc of docs) {
      statistics[doc.key] = {
        value: doc.value,
        numericValue: doc.numericValue ?? null,
        label: doc.label,
        source: doc.source,
        sourceUrl: doc.sourceUrl ?? null,
        asOfDate: doc.asOfDate,
        program: doc.program,
      }
    }

    return NextResponse.json({
      success: true,
      statistics,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to fetch statistics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
