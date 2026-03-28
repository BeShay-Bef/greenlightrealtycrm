import type { Metadata } from 'next'
import { Barlow_Condensed, Montserrat } from 'next/font/google'
import './globals.css'

const barlowCondensed = Barlow_Condensed({
  weight: ['700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-heading',
})

const montserrat = Montserrat({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'GreenLight Realty CRM',
  description: 'Broker portal for GreenLight Realty agents, leads, and documents',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${montserrat.variable}`}>
      <body>{children}</body>
    </html>
  )
}
