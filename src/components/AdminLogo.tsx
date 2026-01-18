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
      <span style={{ fontSize: '28px' }}>⚖️</span>
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
