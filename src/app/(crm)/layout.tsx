import CrmLayout from '@/components/CrmLayout'

// Force dynamic rendering — all CRM pages require auth and live data
export const dynamic = 'force-dynamic'

export default function CrmGroupLayout({ children }: { children: React.ReactNode }) {
  return <CrmLayout>{children}</CrmLayout>
}
