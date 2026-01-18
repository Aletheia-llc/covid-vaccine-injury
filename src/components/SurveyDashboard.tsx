'use client'

import React, { useEffect, useState } from 'react'

interface SurveyStats {
  total: number
  new: number
  reviewed: number
  beliefBreakdown: { yes: number; no: number; unsure: number }
  impactedBreakdown: { yes: number; no: number }
  satisfactionBreakdown: { yes: number; somewhat: number; no: number }
  topReforms: Array<{ reform: string; count: number }>
  recentSubmissions: Array<{
    id: string
    createdAt: string
    q1: string
    q2: string
    q8: string
    zip?: string
  }>
}

export default function SurveyDashboard() {
  const [stats, setStats] = useState<SurveyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/survey/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading stats')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/survey/export')
      if (!response.ok) throw new Error('Export failed')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `survey-responses-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (_err) {
      alert('Failed to export data')
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading survey analytics...</div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error || 'No data available'}</div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Survey Analytics</h2>
        <button style={styles.exportBtn} onClick={handleExport}>
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div style={styles.cardGrid}>
        <div style={styles.card}>
          <div style={styles.cardNumber}>{stats.total}</div>
          <div style={styles.cardLabel}>Total Responses</div>
        </div>
        <div style={{ ...styles.card, borderColor: '#c4a052' }}>
          <div style={{ ...styles.cardNumber, color: '#c4a052' }}>{stats.new}</div>
          <div style={styles.cardLabel}>New (Unreviewed)</div>
        </div>
        <div style={{ ...styles.card, borderColor: '#2d5a3d' }}>
          <div style={{ ...styles.cardNumber, color: '#2d5a3d' }}>{stats.reviewed}</div>
          <div style={styles.cardLabel}>Reviewed</div>
        </div>
      </div>

      {/* Breakdown Charts */}
      <div style={styles.chartsGrid}>
        {/* Belief Breakdown */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Believe Injuries Are Real?</h3>
          <div style={styles.barChart}>
            <BarItem label="Yes" count={stats.beliefBreakdown.yes} total={stats.total} color="#2d5a3d" />
            <BarItem label="No" count={stats.beliefBreakdown.no} total={stats.total} color="#8b2635" />
            <BarItem label="Unsure" count={stats.beliefBreakdown.unsure} total={stats.total} color="#b8860b" />
          </div>
        </div>

        {/* Impact Breakdown */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Personally Impacted?</h3>
          <div style={styles.barChart}>
            <BarItem label="Yes" count={stats.impactedBreakdown.yes} total={stats.total} color="#2d5a3d" />
            <BarItem label="No" count={stats.impactedBreakdown.no} total={stats.total} color="#666" />
          </div>
        </div>

        {/* Satisfaction Breakdown */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Satisfied with System?</h3>
          <div style={styles.barChart}>
            <BarItem label="Yes" count={stats.satisfactionBreakdown.yes} total={stats.total} color="#2d5a3d" />
            <BarItem label="Somewhat" count={stats.satisfactionBreakdown.somewhat} total={stats.total} color="#b8860b" />
            <BarItem label="No" count={stats.satisfactionBreakdown.no} total={stats.total} color="#8b2635" />
          </div>
        </div>

        {/* Top Reforms */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Most Requested Reforms</h3>
          <div style={styles.barChart}>
            {stats.topReforms.slice(0, 5).map((reform) => (
              <BarItem
                key={reform.reform}
                label={formatReform(reform.reform)}
                count={reform.count}
                total={stats.total}
                color="#0d1b2a"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      <div style={styles.recentSection}>
        <h3 style={styles.chartTitle}>Recent Submissions</h3>
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <div style={styles.tableCell}>Date</div>
            <div style={styles.tableCell}>Believes Real</div>
            <div style={styles.tableCell}>Impacted</div>
            <div style={styles.tableCell}>Satisfied</div>
            <div style={styles.tableCell}>ZIP</div>
          </div>
          {stats.recentSubmissions.map((sub) => (
            <div key={sub.id} style={styles.tableRow}>
              <div style={styles.tableCell}>{new Date(sub.createdAt).toLocaleDateString()}</div>
              <div style={styles.tableCell}>{sub.q1 || '-'}</div>
              <div style={styles.tableCell}>{sub.q2 || '-'}</div>
              <div style={styles.tableCell}>{sub.q8 || '-'}</div>
              <div style={styles.tableCell}>{sub.zip || '-'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BarItem({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percent = total > 0 ? (count / total) * 100 : 0
  return (
    <div style={styles.barItem}>
      <div style={styles.barLabel}>
        <span>{label}</span>
        <span>{count} ({percent.toFixed(0)}%)</span>
      </div>
      <div style={styles.barTrack}>
        <div style={{ ...styles.barFill, width: `${percent}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

function formatReform(reform: string): string {
  const map: Record<string, string> = {
    'vicp-transfer': 'Transfer to VICP',
    'deadline': 'Extend Deadline',
    'pain-suffering': 'Pain & Suffering',
    'attorney-fees': 'Attorney Fees',
    'judicial-review': 'Judicial Review',
    'injury-table': 'Injury Table',
  }
  return map[reform] || reform
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#0d1b2a',
    margin: 0,
  },
  exportBtn: {
    background: '#0d1b2a',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    color: '#666',
  },
  error: {
    textAlign: 'center',
    padding: '60px',
    color: '#8b2635',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '32px',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
    border: '2px solid #e0e0e0',
  },
  cardNumber: {
    fontSize: '42px',
    fontWeight: 700,
    color: '#0d1b2a',
    lineHeight: 1,
    marginBottom: '8px',
  },
  cardLabel: {
    fontSize: '14px',
    color: '#666',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
    marginBottom: '32px',
  },
  chartCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #e0e0e0',
  },
  chartTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#0d1b2a',
    marginBottom: '16px',
    marginTop: 0,
  },
  barChart: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  barItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  barLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#333',
  },
  barTrack: {
    height: '8px',
    background: '#f0f0f0',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  recentSection: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #e0e0e0',
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '2px solid #e0e0e0',
    fontWeight: 600,
    fontSize: '13px',
    color: '#0d1b2a',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '13px',
    color: '#333',
  },
  tableCell: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}
