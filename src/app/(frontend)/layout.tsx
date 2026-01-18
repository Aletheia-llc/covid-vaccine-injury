import React from 'react'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/react'
import './styles.css'

export const metadata = {
  title: 'U.S. Covid Vaccine Injuries | Fair Compensation for Americans',
  description: '14,046 COVID-19 vaccine injury claims filed with CICP. Only 42 compensated - a 0.3% approval rate vs. 48% for VICP. Learn about the compensation gap and take action for reform.',
  keywords: 'COVID vaccine injury, CICP, vaccine compensation, VICP, vaccine injury claim, PREP Act, myocarditis, vaccine side effects, HRSA, vaccine injury reform',
  authors: [{ name: 'U.S. Covid Vaccine Injuries' }],
  openGraph: {
    type: 'website',
    url: 'https://covidvaccineinjury.us/',
    title: 'U.S. Covid Vaccine Injuries | 1.6M Reports. 14,046 Claims. 42 Compensated.',
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
    title: 'U.S. Covid Vaccine Injuries | 1.6M Reports. 14,046 Claims. 42 Compensated.',
    description: 'The CICP has a 0.3% approval rate. Americans deserve fair compensation. Learn the facts and take action.',
    images: ['https://covidvaccineinjury.us/og-image.png'],
  },
  robots: 'index, follow',
  metadataBase: new URL('https://covidvaccineinjury.us'),
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚖️</text></svg>" />
        <link rel="canonical" href="https://covidvaccineinjury.us/" />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TDMSS3W1GS"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-TDMSS3W1GS');
          `}
        </Script>
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
