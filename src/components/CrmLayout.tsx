import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { ToastProvider } from './Toast'

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-glr-gray-light">
      <ToastProvider />
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
