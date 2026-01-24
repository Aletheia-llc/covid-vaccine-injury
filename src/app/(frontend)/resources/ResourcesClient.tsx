'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { track } from '@vercel/analytics'
import { BarChart3, ClipboardList, RefreshCw, Building2, TrendingUp, FileText, Search, Scale, Mail } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'

// Map icon names to Lucide components
const iconMap: Record<string, React.ReactNode> = {
  'bar-chart': <BarChart3 size={16} />,
  'trending-up': <TrendingUp size={16} />,
  'file-text': <FileText size={16} />,
  'search': <Search size={16} />,
  'scale': <Scale size={16} />,
  'clipboard': <ClipboardList size={16} />,
}

interface Resource {
  category: string
  name: string
  program: string
  description: string
  frequency: string
  url: string
  icon: string
}

interface ResourcesClientProps {
  resources: Resource[]
  counts: {
    total: number
    cicp: number
    vicp: number
    both: number
  }
}

type SortField = 'category' | 'name'

function getFrequencyClass(freq: string): string {
  if (freq === 'Monthly' || freq === 'Weekly') return 'monthly'
  if (freq === 'Quarterly') return 'quarterly'
  if (freq === 'One-time') return 'onetime'
  return 'other'
}

export default function ResourcesClient({ resources, counts }: ResourcesClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [programFilter, setProgramFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortField, setSortField] = useState<SortField>('category')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    const cats = [...new Set(resources.map(r => r.category))]
    return cats.sort()
  }, [resources])

  // Filter and sort resources
  const filteredResources = useMemo(() => {
    const filtered = resources.filter(r => {
      const matchesSearch = searchTerm === '' ||
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.category.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesProgram = programFilter === 'all' || r.program === programFilter
      const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter

      return matchesSearch && matchesProgram && matchesCategory
    })

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortField].toLowerCase()
      const bVal = b[sortField].toLowerCase()
      if (sortDirection === 'asc') {
        return aVal.localeCompare(bVal)
      } else {
        return bVal.localeCompare(aVal)
      }
    })

    return filtered
  }, [resources, searchTerm, programFilter, categoryFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleResourceClick = (resource: Resource) => {
    track('resource_clicked', {
      name: resource.name,
      program: resource.program,
      category: resource.category
    })
  }

  return (
    <>
      {/* Navigation */}
      <Header activePage="resources" />

      {/* Hero Section */}
      <section className="resources-hero">
        <div className="resources-hero-inner">
          <div className="hero-badge animate-in"><BarChart3 size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Data Repository</div>
          <h1 className="resources-hero-title animate-in delay-1">
            CICP & VICP <span className="accent">Data Resources</span>
          </h1>
          <p className="resources-hero-subtitle animate-in delay-2">
            Comprehensive repository of official government data sources, research reports, and regulatory documents for vaccine injury compensation programs.
          </p>
          <div className="resources-hero-stats animate-in delay-3">
            <div className="resources-hero-stat">
              <div className="resources-hero-stat-number">{counts.total}</div>
              <div className="resources-hero-stat-label">Total Resources</div>
            </div>
            <div className="resources-hero-stat">
              <div className="resources-hero-stat-number cicp">{counts.cicp}</div>
              <div className="resources-hero-stat-label">CICP Resources</div>
            </div>
            <div className="resources-hero-stat">
              <div className="resources-hero-stat-number vicp">{counts.vicp}</div>
              <div className="resources-hero-stat-label">VICP Resources</div>
            </div>
            <div className="resources-hero-stat">
              <div className="resources-hero-stat-number both">{counts.both}</div>
              <div className="resources-hero-stat-label">Both Programs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="resources-main">
        <div className="resources-content-inner">
          {/* Filters */}
          <div className="filters-section">
            <div className="filters-row">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search resources, injuries, keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="filter-select"
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
              >
                <option value="all">All Programs</option>
                <option value="CICP">CICP Only</option>
                <option value="VICP">VICP Only</option>
                <option value="Both">Both Programs</option>
              </select>
              <select
                className="filter-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="results-count">
            Showing <span>{filteredResources.length}</span> of {counts.total} resources
          </div>

          {/* Resources Table */}
          <div className="resources-table">
            <div className="table-header">
              <div className="sortable" onClick={() => handleSort('category')}>
                Category {sortField === 'category' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
              </div>
              <div className="sortable" onClick={() => handleSort('name')}>
                Resource {sortField === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
              </div>
              <div>Program</div>
              <div>Description</div>
              <div>Updates</div>
              <div>Link</div>
            </div>
            <div className="table-body">
              {filteredResources.map((resource, index) => (
                <div key={index} className="table-row">
                  <div className="category-cell">
                    <span className="category-icon">{iconMap[resource.icon] || resource.icon}</span>
                    {resource.category}
                  </div>
                  <div>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resource-name"
                      onClick={() => handleResourceClick(resource)}
                    >
                      {resource.name}
                    </a>
                  </div>
                  <div>
                    <span className={`program-badge ${resource.program.toLowerCase()}`}>
                      {resource.program}
                    </span>
                  </div>
                  <div className="description-cell">{resource.description}</div>
                  <div className={`frequency-cell ${getFrequencyClass(resource.frequency)}`}>
                    {resource.frequency}
                  </div>
                  <div className="link-cell">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-btn"
                      title="Open resource"
                      onClick={() => handleResourceClick(resource)}
                    >
                      ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend Section */}
          <section className="legend-section">
            <h3 className="legend-title"><ClipboardList size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Reference Guide</h3>
            <div className="legend-grid">
              <div className="legend-card">
                <h4>Program Colors</h4>
                <div className="legend-item">
                  <div className="legend-color cicp"></div>
                  <span><strong>CICP</strong> -Countermeasures Injury Compensation Program (COVID vaccines)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color vicp"></div>
                  <span><strong>VICP</strong> -Vaccine Injury Compensation Program (routine vaccines)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color both"></div>
                  <span><strong>Both</strong> -Resources applicable to both programs</span>
                </div>
              </div>
              <div className="legend-card">
                <h4><RefreshCw size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />Update Frequency</h4>
                <div className="legend-item">
                  <span className="freq-dot monthly">●</span>
                  <span><strong>Monthly/Weekly</strong> -Regularly updated official data</span>
                </div>
                <div className="legend-item">
                  <span className="freq-dot quarterly">●</span>
                  <span><strong>Quarterly</strong> -Updated every 3 months</span>
                </div>
                <div className="legend-item">
                  <span className="freq-dot other">●</span>
                  <span><strong>As amended</strong> -Updated when regulations change</span>
                </div>
                <div className="legend-item">
                  <span className="freq-dot onetime">●</span>
                  <span><strong>One-time</strong> -Static resource (research paper, report)</span>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Links */}
          <div className="quick-links">
            <h3>Key Official Sources</h3>
            <div className="quick-links-grid">
              <a href="https://www.hrsa.gov/cicp" target="_blank" rel="noopener noreferrer" className="quick-link">
                <div className="quick-link-icon"><Building2 size={24} /></div>
                <div>
                  <div className="quick-link-text">HRSA CICP</div>
                  <div className="quick-link-desc">Official CICP program page</div>
                </div>
              </a>
              <a href="https://www.hrsa.gov/vaccine-compensation" target="_blank" rel="noopener noreferrer" className="quick-link">
                <div className="quick-link-icon"><Scale size={24} /></div>
                <div>
                  <div className="quick-link-text">HRSA VICP</div>
                  <div className="quick-link-desc">Official VICP program page</div>
                </div>
              </a>
              <a href="https://crsreports.congress.gov/product/pdf/R/R46982" target="_blank" rel="noopener noreferrer" className="quick-link">
                <div className="quick-link-icon"><ClipboardList size={24} /></div>
                <div>
                  <div className="quick-link-text">CRS Report</div>
                  <div className="quick-link-desc">Congressional CICP analysis</div>
                </div>
              </a>
              <a href="https://www.gao.gov/products/gao-25-107368" target="_blank" rel="noopener noreferrer" className="quick-link">
                <div className="quick-link-icon"><ClipboardList size={24} /></div>
                <div>
                  <div className="quick-link-text">GAO Report</div>
                  <div className="quick-link-desc">Dec 2024 CICP audit</div>
                </div>
              </a>
            </div>
          </div>

          {/* Sign Up CTA */}
          <div className="resources-signup-cta">
            <Mail size={24} />
            <div>
              <h4>Stay Updated</h4>
              <p>Get the latest data and advocacy news delivered to your inbox.</p>
            </div>
            <Link href="/#subscribe" className="signup-cta-btn" onClick={() => track('cta_clicked', { location: 'resources', type: 'sign_up' })}>
              Sign Up
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
