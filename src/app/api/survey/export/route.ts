import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET() {
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
      (doc.comments || '').replace(/"/g, '""').replace(/\n/g, ' '),
      doc.zip || '',
      doc.email || '',
      doc.status || '',
    ])

    // Escape CSV values
    const escapeCSV = (value: string) => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value}"`
      }
      return value
    }

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
    console.error('Error exporting survey data:', error)
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 })
  }
}
