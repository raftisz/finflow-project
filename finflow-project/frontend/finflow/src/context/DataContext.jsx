import { createContext, useContext, useState, useCallback } from 'react'
import { api } from '../hooks/useApi.js'
import { useAuth } from './AuthContext.jsx'

// ─── SAMPLE DATA (shown when backend is not configured) ────────────────────────
const SAMPLE_INCOME = [
  { id:1,  date:'2025-04-01', app_name:'WordCraft Pro', platform:'App Store',  amount:1420, category:'App Sale' },
  { id:2,  date:'2025-04-03', app_name:'FinanceFlow',   platform:'Play Store', amount:890,  category:'App Sale' },
  { id:3,  date:'2025-04-05', app_name:'MindMap AI',    platform:'App Store',  amount:2100, category:'Subscription' },
  { id:4,  date:'2025-04-08', app_name:'WordCraft Pro', platform:'Play Store', amount:760,  category:'App Sale' },
  { id:5,  date:'2025-04-10', app_name:'HealthTrack',   platform:'App Store',  amount:540,  category:'In-App Purchase' },
  { id:6,  date:'2025-04-12', app_name:'MindMap AI',    platform:'Play Store', amount:1830, category:'Subscription' },
  { id:7,  date:'2025-03-05', app_name:'WordCraft Pro', platform:'App Store',  amount:1200, category:'App Sale' },
  { id:8,  date:'2025-03-12', app_name:'MindMap AI',    platform:'App Store',  amount:1750, category:'Subscription' },
]
const SAMPLE_EXPENSES = [
  { id:1, date:'2025-04-01', name:'Google Ads',       category:'Ads',          amount:650, recurring:true },
  { id:2, date:'2025-04-01', name:'Apple Search Ads', category:'Ads',          amount:420, recurring:true },
  { id:3, date:'2025-04-05', name:'AWS Server',       category:'Server',       amount:180, recurring:true },
  { id:4, date:'2025-04-08', name:'Figma Pro',        category:'Tools',        amount:45,  recurring:true },
  { id:5, date:'2025-04-10', name:'OpenAI API',       category:'API',          amount:120, recurring:false },
  { id:6, date:'2025-04-15', name:'App Store Connect',category:'Subscription', amount:99,  recurring:true },
]

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const { user } = useAuth()
  const hasBackend = !!import.meta.env.VITE_API_URL

  // Use sample data when no backend is configured
  const [income,   setIncome]   = useState(SAMPLE_INCOME)
  const [expenses, setExpenses] = useState(SAMPLE_EXPENSES)
  const [loading,  setLoading]  = useState(false)

  const currentMonth = new Date().toISOString().slice(0, 7)

  // Compute summary from local state
  const summary = (() => {
    const thisM = '2025-04', lastM = '2025-03'
    const mInc = income.filter(x => x.date.startsWith(thisM)).reduce((s,x) => s+x.amount, 0)
    const mExp = expenses.filter(x => x.date.startsWith(thisM)).reduce((s,x) => s+x.amount, 0)
    const lInc = income.filter(x => x.date.startsWith(lastM)).reduce((s,x) => s+x.amount, 0)
    const appMap = {}
    income.filter(x => x.date.startsWith(thisM)).forEach(x => { appMap[x.app_name] = (appMap[x.app_name]||0)+x.amount })
    const topApps = Object.entries(appMap).sort((a,b)=>b[1]-a[1]).map(([app_name,total])=>({app_name,total}))
    const catMap  = {}
    expenses.filter(x => x.date.startsWith(thisM)).forEach(x => { catMap[x.category] = (catMap[x.category]||0)+x.amount })
    const expByCategory = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).map(([category,total])=>({category,total}))
    return {
      totalIncome: mInc, totalExpenses: mExp, netProfit: mInc-mExp,
      topApps, expByCategory,
      prevMonthIncome: lInc,
      incomeChange: lInc ? ((mInc-lInc)/lInc*100).toFixed(1) : null,
    }
  })()

  // ─── INCOME ───────────────────────────────────────────────────────────────
  const addIncome = async (data) => {
    if (hasBackend && user?.token) {
      try {
        const item = await api.income.create(user.token, data)
        setIncome(p => [item, ...p])
        return item
      } catch (e) { console.error(e) }
    }
    const item = { ...data, id: Date.now(), amount: parseFloat(data.amount) }
    setIncome(p => [item, ...p])
    return item
  }

  const removeIncome = async (id) => {
    if (hasBackend && user?.token) {
      try { await api.income.remove(user.token, id) } catch (e) { console.error(e) }
    }
    setIncome(p => p.filter(x => x.id !== id))
  }

  // ─── EXPENSES ─────────────────────────────────────────────────────────────
  const addExpense = async (data) => {
    if (hasBackend && user?.token) {
      try {
        const item = await api.expenses.create(user.token, data)
        setExpenses(p => [item, ...p])
        return item
      } catch (e) { console.error(e) }
    }
    const item = { ...data, id: Date.now(), amount: parseFloat(data.amount) }
    setExpenses(p => [item, ...p])
    return item
  }

  const removeExpense = async (id) => {
    if (hasBackend && user?.token) {
      try { await api.expenses.remove(user.token, id) } catch (e) { console.error(e) }
    }
    setExpenses(p => p.filter(x => x.id !== id))
  }

  // ─── AI ASSISTANT ──────────────────────────────────────────────────────────
  const askAssistant = async (messages) => {
    if (!hasBackend || !user?.token) throw new Error('No backend configured.')
    const data = await api.assistant.chat(user.token, messages, currentMonth)
    return data.reply
  }

  const exportCSV = (month) => {
    const m = month || currentMonth
    const rows = [
      ['Type','Date','Name/App','Platform/Category','Amount'],
      ...income.filter(x=>x.date.startsWith(m)).map(x=>['Income',x.date,x.app_name,x.platform,x.amount]),
      ...expenses.filter(x=>x.date.startsWith(m)).map(x=>['Expense',x.date,x.name,x.category,-x.amount]),
    ]
    const csv = rows.map(r=>r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type:'text/csv' }))
    a.download = `finflow-${m}.csv`
    a.click()
  }

  return (
    <DataContext.Provider value={{
      income, expenses, summary, loading, hasBackend,
      addIncome, removeIncome, addExpense, removeExpense, askAssistant, exportCSV,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() { return useContext(DataContext) }
