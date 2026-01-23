import React from 'react'

export default function AdminLogo() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 0',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#d4a84b"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="M7 21h10" />
        <path d="M12 3v18" />
        <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '16px',
            fontWeight: 600,
            color: '#ffffff',
            lineHeight: 1.2,
          }}
        >
          U.S. Covid Vaccine Injuries
        </span>
        <span
          style={{
            fontSize: '11px',
            color: '#c4a052',
            fontWeight: 500,
            letterSpacing: '0.5px',
          }}
        >
          Content Management
        </span>
      </div>
    </div>
  )
}
