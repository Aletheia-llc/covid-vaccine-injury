'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface NavProps {
  activeLink?: string
}

export default function Nav({ activeLink }: NavProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Close menu when clicking a link
  const handleLinkClick = () => {
    setIsOpen(false)
  }

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="nav-logo" onClick={handleLinkClick}>
          <span>U.S. Covid Vaccine Injuries</span>
        </Link>

        <button
          className={`nav-toggle ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
          <li>
            <Link
              href="/#data"
              className={activeLink === 'data' ? 'active' : ''}
              onClick={handleLinkClick}
            >
              Data
            </Link>
          </li>
          <li>
            <Link
              href="/#comparison"
              className={activeLink === 'comparison' ? 'active' : ''}
              onClick={handleLinkClick}
            >
              Programs
            </Link>
          </li>
          <li>
            <Link
              href="/faq"
              className={activeLink === 'faq' ? 'active' : ''}
              onClick={handleLinkClick}
            >
              FAQ
            </Link>
          </li>
          <li>
            <Link
              href="/resources"
              className={activeLink === 'resources' ? 'active' : ''}
              onClick={handleLinkClick}
            >
              Resources
            </Link>
          </li>
          <li>
            <Link
              href="/survey"
              className={activeLink === 'survey' ? 'active' : ''}
              onClick={handleLinkClick}
            >
              Survey
            </Link>
          </li>
          <li className="mobile-only">
            <Link
              href="/#action"
              className="nav-cta mobile"
              onClick={handleLinkClick}
            >
              Take Action
            </Link>
          </li>
        </ul>

        <Link href="/#action" className="nav-cta">
          Take Action
        </Link>
      </div>
    </nav>
  )
}
