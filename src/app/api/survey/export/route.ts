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
      limit: 10000,
      sort: '-createdAt',
    })

    // Create CSV content
    const headers = [
      'ID',
      'Date',
      'Believes Injuries Real (Q1)',
      'Impacted (Q2)',
      'Who Impacted (Q3)',
      'Severity (Q4)',
      'Medical Treatment (Q5)',
      'Filed CICP (Q6)',
      'CICP Outcome (Q7)',
      'Satisfied with System (Q8)',
      'Desired Reforms (Q9)',
      'Comments',
      'ZIP Code',
      'Email',
      'Status',
    ]

    // Log if we hit the limit (pagination may be needed)
    if (responses.docs.length >= 10000) {
      log.warn('survey_export_limit_reached', {
        message: 'Export hit 10,000 record limit. Some responses may be missing.',
        totalDocs: responses.totalDocs,
      })
    }

    // Escape CSV values properly - handles all special characters
    const escapeCSV = (value: string): string => {
      // Normalize all line endings to spaces for CSV compatibility
      let escaped = value.replace(/\r\n/g, ' ').replace(/\r/g, ' ').replace(/\n/g, ' ')
      // Escape double quotes by doubling them
      escaped = escaped.replace(/"/g, '""')
      // Wrap in quotes if contains special characters
      if (escaped.includes(',') || escaped.includes('"') || escaped.includes(';')) {
        return `"${escaped}"`
      }
      return escaped
    }

    const rows = responses.docs.map((doc) => [
      doc.id,
      new Date(doc.createdAt).toISOString(),
      doc.q1 || '',
      doc.q2 || '',
      doc.q3 || '',
      doc.q4 || '',
      doc.q5 || '',
      doc.q6 || '',
      doc.q7 || '',
      doc.q8 || '',
      Array.isArray(doc.q9) ? doc.q9.join('; ') : '',
      doc.comments || '',
      doc.zip || '',
      doc.email || '',
      doc.status || '',
    ])

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => escapeCSV(String(cell))).join(',')),
    ].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="survey-responses-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    log.error('survey_export_error', { error })
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 })
  }
}
