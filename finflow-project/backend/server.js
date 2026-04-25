const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Anthropic = require('@anthropic-ai/sdk');
const db = require('./db/database');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'finflow-secret-key-change-in-prod';

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// ─── AUTH MIDDLEWARE ──────────────────────────────────────────────────────────
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ─── AUTH ROUTES ──────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const hash = await bcrypt.hash(password, 10);
  const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hash);
  const token = jwt.sign({ id: result.lastInsertRowid, email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: result.lastInsertRowid, name, email } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// ─── INCOME ROUTES ────────────────────────────────────────────────────────────
app.get('/api/income', auth, (req, res) => {
  const { month, app: appName, platform } = req.query;
  let query = 'SELECT * FROM income WHERE user_id = ?';
  const params = [req.user.id];
  if (month) { query += ' AND date LIKE ?'; params.push(`${month}%`); }
  if (appName) { query += ' AND app_name LIKE ?'; params.push(`%${appName}%`); }
  if (platform) { query += ' AND platform = ?'; params.push(platform); }
  query += ' ORDER BY date DESC';
  res.json(db.prepare(query).all(...params));
});

app.post('/api/income', auth, (req, res) => {
  const { date, app_name, platform, amount, category } = req.body;
  if (!date || !app_name || !amount) return res.status(400).json({ error: 'Required fields missing' });
  const result = db.prepare(
    'INSERT INTO income (user_id, date, app_name, platform, amount, category) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.user.id, date, app_name, platform || 'App Store', amount, category || 'App Sale');
  res.json({ id: result.lastInsertRowid, ...req.body });
});

app.delete('/api/income/:id', auth, (req, res) => {
  db.prepare('DELETE FROM income WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

// ─── EXPENSE ROUTES ───────────────────────────────────────────────────────────
app.get('/api/expenses', auth, (req, res) => {
  const { month, category } = req.query;
  let query = 'SELECT * FROM expenses WHERE user_id = ?';
  const params = [req.user.id];
  if (month) { query += ' AND date LIKE ?'; params.push(`${month}%`); }
  if (category) { query += ' AND category = ?'; params.push(category); }
  query += ' ORDER BY date DESC';
  res.json(db.prepare(query).all(...params));
});

app.post('/api/expenses', auth, (req, res) => {
  const { date, name, category, amount, recurring } = req.body;
  if (!date || !name || !amount) return res.status(400).json({ error: 'Required fields missing' });
  const result = db.prepare(
    'INSERT INTO expenses (user_id, date, name, category, amount, recurring) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.user.id, date, name, category || 'Other', amount, recurring ? 1 : 0);
  res.json({ id: result.lastInsertRowid, ...req.body });
});

app.delete('/api/expenses/:id', auth, (req, res) => {
  db.prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

// ─── SUMMARY / STATS ──────────────────────────────────────────────────────────
app.get('/api/summary', auth, (req, res) => {
  const { month } = req.query;
  const uid = req.user.id;
  const monthFilter = month || new Date().toISOString().slice(0, 7);

  const totalIncome = db.prepare(
    'SELECT COALESCE(SUM(amount),0) as total FROM income WHERE user_id=? AND date LIKE ?'
  ).get(uid, `${monthFilter}%`).total;

  const totalExpenses = db.prepare(
    'SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE user_id=? AND date LIKE ?'
  ).get(uid, `${monthFilter}%`).total;

  const topApps = db.prepare(
    'SELECT app_name, SUM(amount) as total FROM income WHERE user_id=? AND date LIKE ? GROUP BY app_name ORDER BY total DESC LIMIT 5'
  ).all(uid, `${monthFilter}%`);

  const expByCategory = db.prepare(
    'SELECT category, SUM(amount) as total FROM expenses WHERE user_id=? AND date LIKE ? GROUP BY category ORDER BY total DESC'
  ).all(uid, `${monthFilter}%`);

  // Month-over-month
  const [y, m] = monthFilter.split('-').map(Number);
  const prevDate = new Date(y, m - 2);
  const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  const prevIncome = db.prepare(
    'SELECT COALESCE(SUM(amount),0) as total FROM income WHERE user_id=? AND date LIKE ?'
  ).get(uid, `${prevMonth}%`).total;

  res.json({
    month: monthFilter,
    totalIncome, totalExpenses,
    netProfit: totalIncome - totalExpenses,
    topApps, expByCategory,
    prevMonthIncome: prevIncome,
    incomeChange: prevIncome ? ((totalIncome - prevIncome) / prevIncome * 100).toFixed(1) : null
  });
});

// ─── AI ASSISTANT ─────────────────────────────────────────────────────────────
app.post('/api/assistant', auth, async (req, res) => {
  const { messages, month } = req.body;
  const uid = req.user.id;
  const monthFilter = month || new Date().toISOString().slice(0, 7);

  // Build real-time financial context
  const totalIncome = db.prepare('SELECT COALESCE(SUM(amount),0) as t FROM income WHERE user_id=? AND date LIKE ?').get(uid, `${monthFilter}%`).t;
  const totalExpenses = db.prepare('SELECT COALESCE(SUM(amount),0) as t FROM expenses WHERE user_id=? AND date LIKE ?').get(uid, `${monthFilter}%`).t;
  const topApps = db.prepare('SELECT app_name, SUM(amount) as total FROM income WHERE user_id=? GROUP BY app_name ORDER BY total DESC LIMIT 5').all(uid);
  const topCats = db.prepare('SELECT category, SUM(amount) as total FROM expenses WHERE user_id=? GROUP BY category ORDER BY total DESC').all(uid);
  const allTime = db.prepare('SELECT COALESCE(SUM(amount),0) as t FROM income WHERE user_id=?').get(uid).t;

  const context = `
Financial data for ${monthFilter}:
- Monthly Income: $${totalIncome.toLocaleString()}
- Monthly Expenses: $${totalExpenses.toLocaleString()}
- Net Profit: $${(totalIncome - totalExpenses).toLocaleString()}
- All-time Income: $${allTime.toLocaleString()}
- Top Apps: ${topApps.map(a => `${a.app_name} ($${a.total})`).join(', ')}
- Expense Categories: ${topCats.map(c => `${c.category} ($${c.total})`).join(', ')}
  `.trim();

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `You are FinFlow Secretary, a smart personal financial assistant for app developers.
Answer in the same language the user writes (Thai or English).
Be concise, use numbers from the data, add occasional emoji for friendliness.
Give actionable insights when relevant.

${context}`,
      messages: messages.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }))
    });
    res.json({ reply: response.content[0].text });
  } catch (err) {
    res.status(500).json({ error: 'AI error', details: err.message });
  }
});

// ─── EXPORT CSV ───────────────────────────────────────────────────────────────
app.get('/api/export/csv', auth, (req, res) => {
  const { month } = req.query;
  const uid = req.user.id;
  const filter = month || new Date().toISOString().slice(0, 7);

  const incRows = db.prepare('SELECT * FROM income WHERE user_id=? AND date LIKE ?').all(uid, `${filter}%`);
  const expRows = db.prepare('SELECT * FROM expenses WHERE user_id=? AND date LIKE ?').all(uid, `${filter}%`);

  const csv = [
    'Type,Date,Name,Category/Platform,Amount',
    ...incRows.map(r => `Income,${r.date},${r.app_name},${r.platform},${r.amount}`),
    ...expRows.map(r => `Expense,${r.date},${r.name},${r.category},-${r.amount}`)
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=finflow-${filter}.csv`);
  res.send(csv);
});

app.listen(PORT, () => console.log(`✅ FinFlow API running on http://localhost:${PORT}`));
