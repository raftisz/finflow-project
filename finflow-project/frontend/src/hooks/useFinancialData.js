import { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export function useFinancialData(token) {
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchAll = useCallback(async (month) => {
    if (!token) return;
    setLoading(true);
    try {
      const m = month || new Date().toISOString().slice(0, 7);
      const [incRes, expRes, sumRes] = await Promise.all([
        fetch(`${API}/income?month=${m}`, { headers }),
        fetch(`${API}/expenses?month=${m}`, { headers }),
        fetch(`${API}/summary?month=${m}`, { headers }),
      ]);
      setIncome(await incRes.json());
      setExpenses(await expRes.json());
      setSummary(await sumRes.json());
    } catch (err) {
      console.error('Fetch error:', err);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addIncome = async (data) => {
    const res = await fetch(`${API}/income`, { method: 'POST', headers, body: JSON.stringify(data) });
    const item = await res.json();
    setIncome(prev => [item, ...prev]);
    fetchAll(); // refresh summary
    return item;
  };

  const addExpense = async (data) => {
    const res = await fetch(`${API}/expenses`, { method: 'POST', headers, body: JSON.stringify(data) });
    const item = await res.json();
    setExpenses(prev => [item, ...prev]);
    fetchAll();
    return item;
  };

  const deleteIncome = async (id) => {
    await fetch(`${API}/income/${id}`, { method: 'DELETE', headers });
    setIncome(prev => prev.filter(x => x.id !== id));
    fetchAll();
  };

  const deleteExpense = async (id) => {
    await fetch(`${API}/expenses/${id}`, { method: 'DELETE', headers });
    setExpenses(prev => prev.filter(x => x.id !== id));
    fetchAll();
  };

  const askAssistant = async (messages, month) => {
    const res = await fetch(`${API}/assistant`, {
      method: 'POST', headers,
      body: JSON.stringify({ messages, month })
    });
    const data = await res.json();
    return data.reply;
  };

  const exportCSV = (month) => {
    const m = month || new Date().toISOString().slice(0, 7);
    window.open(`${API}/export/csv?month=${m}`, '_blank');
  };

  return { income, expenses, summary, loading, fetchAll, addIncome, addExpense, deleteIncome, deleteExpense, askAssistant, exportCSV };
}
