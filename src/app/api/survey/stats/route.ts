import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { isAdminAuthenticated, unauthorizedResponse } from '@/lib/auth'
import { log } from '@/lib/logger'

export async function GET() {
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

    // Calculate statistics
    const total = docs.length
    const newCount = docs.filter((d) => d.status === 'new').length
    const reviewed = docs.filter((d) => d.status === 'reviewed').length

    // Belief breakdown (q1)
    const beliefBreakdown = {
      yes: docs.filter((d) => d.q1 === 'yes').length,
      no: docs.filter((d) => d.q1 === 'no').length,
      unsure: docs.filter((d) => d.q1 === 'unsure').length,
    }

    // Impacted breakdown (q2)
    const impactedBreakdown = {
      yes: docs.filter((d) => d.q2 === 'yes').length,
      no: docs.filter((d) => d.q2 === 'no').length,
    }

    // Satisfaction breakdown (q8)
    const satisfactionBreakdown = {
      yes: docs.filter((d) => d.q8 === 'yes').length,
      somewhat: docs.filter((d) => d.q8 === 'somewhat').length,
      no: docs.filter((d) => d.q8 === 'no').length,
    }

    // Top reforms (q9) - with proper type narrowing
    const reformCounts: Record<string, number> = {}
    for (const d of docs) {
      const q9Value = d.q9
      if (q9Value && Array.isArray(q9Value)) {
        for (const reform of q9Value) {
          if (typeof reform === 'string') {
            reformCounts[reform] = (reformCounts[reform] || 0) + 1
          }
        }
      }
    }

    const topReforms = Object.entries(reformCounts)
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

    return NextResponse.json({
      total,
      new: newCount,
      reviewed,
      beliefBreakdown,
      impactedBreakdown,
      satisfactionBreakdown,
      topReforms,
      recentSubmissions,
    })
  } catch (error) {
    log.error('survey_stats_error', { error })
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
