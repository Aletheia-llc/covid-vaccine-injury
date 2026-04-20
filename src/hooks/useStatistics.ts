'use client'

import { useState, useEffect } from 'react'

export interface Statistic {
  value: string
  numericValue: number | null
  label: string
  source: string
  sourceUrl: string | null
  asOfDate: string
  program: string
}

export interface StatisticsData {
  // CICP
  cicp_claims_filed: Statistic
  cicp_compensated: Statistic
  cicp_approval_rate: Statistic
  cicp_decisions_rendered: Statistic
  cicp_pending_percent: Statistic
  cicp_denial_rate: Statistic
  cicp_avg_decision_time: Statistic
  cicp_total_paid: Statistic
  cicp_median_payment: Statistic
  cicp_outlier_payment: Statistic
  cicp_others_total: Statistic
  // VICP
  vicp_approval_rate: Statistic
  vicp_total_compensated: Statistic
  vicp_total_claims: Statistic
  vicp_total_paid: Statistic
  vicp_average_award: Statistic
  // General
  trust_fund_balance: Statistic
  [key: string]: Statistic
}

// Default fallback values (used if CMS is unavailable)
const defaultStatistics: StatisticsData = {
  cicp_claims_filed: { value: '14,075', numericValue: 14075, label: 'CICP Claims Filed', source: 'HRSA CICP Data', sourceUrl: 'https://www.hrsa.gov/cicp/cicp-data', asOfDate: '2026-01-01', program: 'cicp' },
  cicp_compensated: { value: '44', numericValue: 44, label: 'Americans Compensated', source: 'HRSA CICP Data', sourceUrl: 'https://www.hrsa.gov/cicp/cicp-data', asOfDate: '2026-01-01', program: 'cicp' },
  cicp_approval_rate: { value: '0.3%', numericValue: 0.3, label: 'CICP Approval Rate', source: 'HRSA CICP Data', sourceUrl: 'https://www.hrsa.gov/cicp/cicp-data', asOfDate: '2026-01-01', program: 'cicp' },
  cicp_decisions_rendered: { value: '6,421', numericValue: 6421, label: 'Decisions Rendered', source: 'HRSA CICP Data', sourceUrl: 'https://www.hrsa.gov/cicp/cicp-data', asOfDate: '2026-01-01', program: 'cicp' },
  cicp_pending_percent: { value: '54%', numericValue: 54, label: 'Claims Still Pending', source: 'HRSA CICP Data', sourceUrl: 'https://www.hrsa.gov/cicp/cicp-data', asOfDate: '2026-01-01', program: 'cicp' },
  cicp_denial_rate: { value: '98.6%', numericValue: 98.6, label: 'Decided Claims Denied', source: 'HRSA CICP Data', sourceUrl: 'https://www.hrsa.gov/cicp/cicp-data', asOfDate: '2026-01-01', program: 'cicp' },
  cicp_avg_decision_time: { value: '24 mo', numericValue: 24, label: 'Average Time to Decision', source: 'GAO Report GAO-25-107368', sourceUrl: 'https://www.gao.gov/products/gao-25-107368', asOfDate: '2024-12-01', program: 'cicp' },
  cicp_total_paid: { value: '$6.5M', numericValue: 6500000, label: 'CICP Total Paid', source: 'HRSA CICP Data', sourceUrl: 'https://www.hrsa.gov/cicp/cicp-data', asOfDate: '2026-01-01', program: 'cicp' },
  cicp_median_payment: { value: '$4,132', numericValue: 4132, label: 'Typical CICP Payment', source: 'HRSA Table 4', sourceUrl: 'https://www.hrsa.gov/cicp/cicp-data/table-4', asOfDate: '2026-01-01', program: 'cicp' },
  cicp_outlier_payment: { value: '$5.94M', numericValue: 5940000, label: 'Single TTS Case Payment', source: 'HRSA CICP Data', sourceUrl: 'https://www.hrsa.gov/cicp/cicp-data', asOfDate: '2026-01-01', program: 'cicp' },
  cicp_others_total: { value: '$575K', numericValue: 575000, label: 'Other 43 Cases Total', source: 'HRSA CICP Data', sourceUrl: 'https://www.hrsa.gov/cicp/cicp-data', asOfDate: '2026-01-01', program: 'cicp' },
  vicp_approval_rate: { value: '~49%', numericValue: 49, label: 'VICP Approval Rate', source: 'HRSA VICP Data', sourceUrl: 'https://www.hrsa.gov/vaccine-compensation/data', asOfDate: '2026-03-01', program: 'vicp' },
  vicp_total_compensated: { value: '12,889', numericValue: 12889, label: 'VICP Total Compensated', source: 'HRSA VICP Data', sourceUrl: 'https://www.hrsa.gov/vaccine-compensation/data', asOfDate: '2026-03-01', program: 'vicp' },
  vicp_total_claims: { value: '~29,670', numericValue: 29670, label: 'VICP Total Claims', source: 'HRSA VICP Data', sourceUrl: 'https://www.hrsa.gov/vaccine-compensation/data', asOfDate: '2026-03-01', program: 'vicp' },
  vicp_total_paid: { value: '$4.97B', numericValue: 4970000000, label: 'VICP Total Paid (Awards)', source: 'HRSA VICP Data', sourceUrl: 'https://www.hrsa.gov/vaccine-compensation/data', asOfDate: '2026-03-01', program: 'vicp' },
  vicp_average_award: { value: '$386,000', numericValue: 386000, label: 'Average VICP Award', source: 'HRSA VICP Data', sourceUrl: 'https://www.hrsa.gov/vaccine-compensation/data', asOfDate: '2026-03-01', program: 'vicp' },
  trust_fund_balance: { value: '$4.5B', numericValue: 4500000000, label: 'VICP Trust Fund Balance', source: 'HRSA VICP Data', sourceUrl: 'https://www.hrsa.gov/vaccine-compensation/data', asOfDate: '2026-03-01', program: 'general' },
}

export function useStatistics() {
  const [statistics, setStatistics] = useState<StatisticsData>(defaultStatistics)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStatistics() {
      try {
        const response = await fetch('/api/statistics')
        const data = await response.json()

        if (data.success && data.statistics) {
          // Merge with defaults to ensure all keys exist
          setStatistics({ ...defaultStatistics, ...data.statistics })
        }
      } catch (err) {
        console.error('Failed to fetch statistics:', err)
        setError('Failed to load statistics')
        // Keep using default values
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [])

  // Helper to get a numeric value with fallback
  const getNumeric = (key: keyof StatisticsData): number => {
    return statistics[key]?.numericValue ?? defaultStatistics[key]?.numericValue ?? 0
  }

  // Helper to get display value
  const getValue = (key: keyof StatisticsData): string => {
    return statistics[key]?.value ?? defaultStatistics[key]?.value ?? ''
  }

  return {
    statistics,
    loading,
    error,
    getNumeric,
    getValue,
  }
}
