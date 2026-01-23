import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { isAdminAuthenticated, unauthorizedResponse } from '@/lib/auth'
import { createRequestLogger } from '@/lib/logger'

export async function GET() {
  const requestId = crypto.randomUUID()
  const log = createRequestLogger({ requestId, path: '/api/survey/stats', method: 'GET' })

  // Require admin authentication
  const isAuthed = await isAdminAuthenticated()
  if (!isAuthed) {
    return unauthorizedResponse()
  }

  try {
    const payload = await getPayload({ config })

    const responses = await payload.find({
      collection: 'survey-responses',
      limit: 1000,
      sort: '-createdAt',
    })

    const docs = responses.docs

    // Single-pass aggregation for all statistics
    // Much more efficient than multiple .filter() calls
    const stats = {
      total: 0,
      new: 0,
      reviewed: 0,
      q1: { yes: 0, no: 0, unsure: 0 },
      q2: { yes: 0, no: 0 },
      q8: { yes: 0, somewhat: 0, no: 0 },
      reforms: {} as Record<string, number>,
    }

    for (const d of docs) {
      stats.total++

      // Status counts
      if (d.status === 'new') stats.new++
      else if (d.status === 'reviewed') stats.reviewed++

      // Q1 (belief breakdown)
      if (d.q1 === 'yes') stats.q1.yes++
      else if (d.q1 === 'no') stats.q1.no++
      else if (d.q1 === 'unsure') stats.q1.unsure++

      // Q2 (impacted breakdown)
      if (d.q2 === 'yes') stats.q2.yes++
      else if (d.q2 === 'no') stats.q2.no++

      // Q8 (satisfaction breakdown)
      if (d.q8 === 'yes') stats.q8.yes++
      else if (d.q8 === 'somewhat') stats.q8.somewhat++
      else if (d.q8 === 'no') stats.q8.no++

      // Q9 (reforms - array field)
      const q9Value = d.q9
      if (q9Value && Array.isArray(q9Value)) {
        for (const reform of q9Value) {
          if (typeof reform === 'string') {
            stats.reforms[reform] = (stats.reforms[reform] || 0) + 1
          }
        }
      }
    }

    // Format top reforms
    const topReforms = Object.entries(stats.reforms)
      .map(([reform, count]) => ({ reform, count }))
      .sort((a, b) => b.count - a.count)

    // Recent submissions (last 10)
    const recentSubmissions = docs.slice(0, 10).map((d) => ({
      id: d.id,
      createdAt: d.createdAt,
      q1: d.q1,
      q2: d.q2,
      q8: d.q8,
      zip: d.zip,
    }))

    return NextResponse.json(
      {
        total: stats.total,
        new: stats.new,
        reviewed: stats.reviewed,
        beliefBreakdown: stats.q1,
        impactedBreakdown: stats.q2,
        satisfactionBreakdown: stats.q8,
        topReforms,
        recentSubmissions,
      },
      { headers: { 'X-Request-ID': requestId } }
    )
  } catch (error) {
    log.error({ err: error, event: 'survey_stats_failed' }, 'Failed to fetch survey stats')
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500, headers: { 'X-Request-ID': requestId } }
    )
  }
}
