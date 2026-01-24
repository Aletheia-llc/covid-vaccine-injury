'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Scale, Dices } from 'lucide-react'
import { track } from '@vercel/analytics'

interface HeaderProps {
  activePage?: 'home' | 'faq' | 'resources' | 'survey' | 'donate'
  onRouletteOpen?: () => void
}

export default function Header({ activePage, onRouletteOpen }: HeaderProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const handleRouletteClick = () => {
    setMobileNavOpen(false)
    if (onRouletteOpen) {
      onRouletteOpen()
    }
    track('roulette_opened', { location: 'nav' })
  }

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="nav-logo">
          <Scale size={20} />
          <span>U.S. Covid Vaccine Injuries</span>
        </Link>
        <button
          className={`nav-toggle ${mobileNavOpen ? 'active' : ''}`}
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileNavOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <ul className={`nav-links ${mobileNavOpen ? 'open' : ''}`}>
          <li><Link href="/#funnel" onClick={() => setMobileNavOpen(false)}>The Gap</Link></li>
          <li><Link href="/#comparison" onClick={() => setMobileNavOpen(false)}>Compare Programs</Link></li>
          <li><Link href="/#trustfund" onClick={() => setMobileNavOpen(false)}>Trust Fund</Link></li>
          <li><Link href="/faq" className={activePage === 'faq' ? 'active' : ''} onClick={() => setMobileNavOpen(false)}>FAQ</Link></li>
          <li><Link href="/resources" className={activePage === 'resources' ? 'active' : ''} onClick={() => setMobileNavOpen(false)}>Data</Link></li>
          <li><Link href="/survey" className={activePage === 'survey' ? 'active' : ''} onClick={() => setMobileNavOpen(false)}>Survey</Link></li>
          {onRouletteOpen && (
            <li>
              <button className="nav-link-btn" onClick={handleRouletteClick}>
                <Dices size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Roulette
              </button>
            </li>
          )}
          <li className="mobile-only">
            <Link href="/#action" className="nav-cta mobile" onClick={() => { setMobileNavOpen(false); track('cta_clicked', { location: 'nav_mobile', type: 'contact_congress' }) }}>Contact Congress</Link>
          </li>
          <li className="mobile-only">
            <Link href="/#subscribe" className="nav-cta mobile secondary" onClick={() => { setMobileNavOpen(false); track('cta_clicked', { location: 'nav_mobile', type: 'sign_up' }) }}>Sign Up</Link>
          </li>
        </ul>
        <div className="nav-cta-group">
          <Link href="/#action" className="nav-cta" onClick={() => track('cta_clicked', { location: 'nav', type: 'contact_congress' })}>Contact Congress</Link>
          <Link href="/#subscribe" className="nav-cta secondary" onClick={() => track('cta_clicked', { location: 'nav', type: 'sign_up' })}>Sign Up</Link>
        </div>
      </div>
    </nav>
  )
}
