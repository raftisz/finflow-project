import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import IncomePage from './pages/IncomePage';
import ExpensePage from './pages/ExpensePage';
import AssistantPage from './pages/AssistantPage';
import ReportsPage from './pages/ReportsPage';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { AuthContext } from './context/AuthContext';
import { DataContext } from './context/DataContext';
import { useFinancialData } from './hooks/useFinancialData';

const PAGES = {
  dashboard: { label: 'Dashboard', icon: '📊' },
  income:    { label: 'รายรับ',     icon: '💰' },
  expenses:  { label: 'ค่าใช้จ่าย',  icon: '💸' },
  assistant: { label: 'AI Assistant', icon: '🤖' },
  reports:   { label: 'Reports',    icon: '📋' },
};

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ff_user')); } catch { return null; }
  });
  const [page, setPage] = useState('dashboard');
  const data = useFinancialData(user?.token);

  const logout = () => { setUser(null); localStorage.removeItem('ff_user'); };

  if (!user) return <Login onLogin={(u) => { setUser(u); localStorage.setItem('ff_user', JSON.stringify(u)); }} />;

  const PageComponent = { dashboard: Dashboard, income: IncomePage, expenses: ExpensePage, assistant: AssistantPage, reports: ReportsPage }[page];

  return (
    <AuthContext.Provider value={{ user, logout }}>
      <DataContext.Provider value={data}>
        <div className="app">
          <Sidebar pages={PAGES} activePage={page} onNavigate={setPage} />
          <div className="main">
            {page !== 'assistant' && <Topbar title={PAGES[page].label} page={page} />}
            <div className={page === 'assistant' ? '' : 'content'}>
              <PageComponent />
            </div>
          </div>
        </div>
      </DataContext.Provider>
    </AuthContext.Provider>
  );
}
