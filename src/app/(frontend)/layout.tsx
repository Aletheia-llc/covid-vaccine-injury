import React from 'react'
import Script from 'next/script'
import './styles.css'
import AnalyticsWrapper from './components/AnalyticsWrapper'
import { WebVitals } from './components/WebVitals'

export const metadata = {
  title: 'U.S. Covid Vaccine Injuries | Fair Compensation for Americans',
  description: '14,075 COVID-19 vaccine injury claims filed with CICP. Only 44 compensated - a 0.3% approval rate vs. 49% for VICP. Learn about the compensation gap and take action for reform.',
  keywords: 'COVID vaccine injury, CICP, vaccine compensation, VICP, vaccine injury claim, PREP Act, myocarditis, vaccine side effects, HRSA, vaccine injury reform',
  authors: [{ name: 'U.S. Covid Vaccine Injuries' }],
  openGraph: {
    type: 'website',
    url: 'https://covidvaccineinjury.us/',
    title: 'U.S. Covid Vaccine Injuries | 1.6M Reports. 14,075 Claims. 44 Compensated.',
    description: 'The CICP has a 0.3% approval rate. Americans injured by COVID vaccines deserve fair compensation. Learn the facts and take action.',
    siteName: 'U.S. Covid Vaccine Injuries',
    images: [
      {
        url: 'https://covidvaccineinjury.us/og-image.png',
        width: 1200,
        height: 630,
        alt: 'U.S. Covid Vaccine Injuries - Fair Compensation for Americans',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'U.S. Covid Vaccine Injuries | 1.6M Reports. 14,075 Claims. 44 Compensated.',
    description: 'The CICP has a 0.3% approval rate. Americans deserve fair compensation. Learn the facts and take action.',
    images: ['https://covidvaccineinjury.us/og-image.png'],
  },
  robots: 'index, follow',
  metadataBase: new URL('https://covidvaccineinjury.us'),
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {/* Preconnect to external resources for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preload critical fonts for better LCP */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap"
          as="style"
        />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%23d4a84b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z'/><path d='m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z'/><path d='M7 21h10'/><path d='M12 3v18'/><path d='M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2'/></svg>" />
        <link rel="canonical" href="https://covidvaccineinjury.us/" />
        {/* reCAPTCHA v3 - only load if site key is configured */}
        {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
          <Script
            src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
            strategy="afterInteractive"
          />
        )}
      </head>
      <body>
        {/* Accessibility: Skip link for keyboard navigation */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div id="main-content">
          {children}
        </div>
        {/* Analytics loaded conditionally based on cookie consent */}
        <AnalyticsWrapper />
        {/* Web Vitals reporting */}
        <WebVitals />
      </body>
    </html>
  )
}
