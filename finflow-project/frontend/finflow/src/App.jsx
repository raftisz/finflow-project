import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { DataProvider } from './context/DataContext.jsx'
import Sidebar  from './components/Sidebar.jsx'
import Topbar   from './components/Topbar.jsx'
import Login    from './pages/Login.jsx'
import Dashboard  from './pages/Dashboard.jsx'
import IncomePage from './pages/IncomePage.jsx'
import ExpensePage  from './pages/ExpensePage.jsx'
import AssistantPage from './pages/AssistantPage.jsx'
import ReportsPage  from './pages/ReportsPage.jsx'

const PAGES = {
  dashboard: { label: 'Dashboard',    icon: '📊' },
  income:    { label: 'รายรับ',        icon: '💰' },
  expenses:  { label: 'ค่าใช้จ่าย',    icon: '💸' },
  assistant: { label: 'AI Assistant', icon: '🤖' },
  reports:   { label: 'Reports',      icon: '📋' },
}

const PAGE_NOTES = {
  dashboard: 'ยินดีต้อนรับกลับมา! ตรวจสอบภาพรวมการเงินของคุณ',
  income:    'อย่าลืมบันทึกรายรับทุกครั้งที่มีเงินเข้า 💰',
  expenses:  'ติดตามค่าใช้จ่ายสม่ำเสมอช่วยประหยัดได้มาก',
  assistant: 'ถามผมได้เลย! ผมรู้ทุกอย่างเกี่ยวกับตัวเลขของคุณ',
  reports:   'Export รายงานไว้สำหรับยื่นภาษีหรือวิเคราะห์ย้อนหลัง',
}

const COMPONENTS = { dashboard: Dashboard, income: IncomePage, expenses: ExpensePage, assistant: AssistantPage, reports: ReportsPage }

function Shell() {
  const { user } = useAuth()
  const [page, setPage] = useState('dashboard')

  if (!user) return <Login />

  const PageComp = COMPONENTS[page]

  return (
    <DataProvider>
      <div className="app">
        <Sidebar pages={PAGES} active={page} onNav={setPage} note={PAGE_NOTES[page]} />
        <div className="main">
          {page !== 'assistant' && <Topbar title={PAGES[page].label} page={page} />}
          {page === 'assistant'
            ? <PageComp />
            : <div className="content"><PageComp /></div>
          }
        </div>
      </div>
    </DataProvider>
  )
}

export default function App() {
  return <AuthProvider><Shell /></AuthProvider>
}
