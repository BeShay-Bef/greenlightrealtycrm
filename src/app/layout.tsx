import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
