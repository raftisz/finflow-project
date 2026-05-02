import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

// ─── fake auth delay (ms) — remove when real backend is ready ────────────────
const FAKE_DELAY = 800

export default function Login() {
  const { login } = useAuth()

  const [isReg,    setIsReg]    = useState(false)
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [pass,     setPass]     = useState('')
  const [errors,   setErrors]   = useState({})   // field-level errors
  const [busy,     setBusy]     = useState(false)

  // ─── validation ─────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (isReg && !name.trim())         e.name  = 'กรุณากรอกชื่อของคุณ'
    if (!email.trim())                  e.email = 'กรุณากรอก Email'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'รูปแบบ Email ไม่ถูกต้อง'
    if (!pass)                          e.pass  = 'กรุณากรอก Password'
    else if (pass.length < 4)           e.pass  = 'Password ต้องมีอย่างน้อย 4 ตัวอักษร'
    return e
  }

  // ─── submit ──────────────────────────────────────────────────────────────
  const submit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setBusy(true)
    setErrors({})

    // Fake async delay — swap this block for a real fetch() later
    await new Promise(r => setTimeout(r, FAKE_DELAY))

    const user = {
      name:  isReg ? name.trim() : email.split('@')[0],
      email: email.trim().toLowerCase(),
      token: `fake-token-${Date.now()}`,   // replace with real JWT later
    }
    login(user)  // saves to localStorage + sets global state
    setBusy(false)
  }

  const demo = () => login({ name: 'Demo User', email: 'demo@finflow.app', token: 'demo' })

  const handleKey = (e) => { if (e.key === 'Enter' && !busy) submit() }

  return (
    <div style={S.wrap}>
      <div style={S.card}>

        {/* Logo */}
        <div style={S.logoWrap}>
          <div style={S.logoMark}>
            <span style={S.dot} />
            FinFlow
          </div>
          <div style={S.logoSub}>Personal Financial Secretary</div>
        </div>

        {/* Tab: Login / Register */}
        <div style={S.tabs}>
          <button style={{ ...S.tab, ...(isReg ? {} : S.tabActive) }} onClick={() => { setIsReg(false); setErrors({}) }}>
            เข้าสู่ระบบ
          </button>
          <button style={{ ...S.tab, ...(isReg ? S.tabActive : {}) }} onClick={() => { setIsReg(true);  setErrors({}) }}>
            สมัครใหม่
          </button>
        </div>

        {/* Name field (register only) */}
        {isReg && (
          <Field label="ชื่อของคุณ" error={errors.name}>
            <input
              style={{ ...S.input, ...(errors.name ? S.inputErr : {}) }}
              placeholder="สมชาย ใจดี"
              value={name}
              onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name:'' })) }}
              onKeyDown={handleKey}
            />
          </Field>
        )}

        {/* Email */}
        <Field label="Email" error={errors.email}>
          <input
            style={{ ...S.input, ...(errors.email ? S.inputErr : {}) }}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email:'' })) }}
            onKeyDown={handleKey}
          />
        </Field>

        {/* Password */}
        <Field label="Password" error={errors.pass}>
          <input
            style={{ ...S.input, ...(errors.pass ? S.inputErr : {}) }}
            type="password"
            placeholder="••••••••"
            value={pass}
            onChange={e => { setPass(e.target.value); setErrors(p => ({ ...p, pass:'' })) }}
            onKeyDown={handleKey}
          />
        </Field>

        {/* Submit */}
        <button
          style={{ ...S.btnPrimary, ...(busy ? S.btnDisabled : {}) }}
          onClick={submit}
          disabled={busy}
        >
          {busy
            ? <><Spinner /> กำลังดำเนินการ...</>
            : isReg ? '✅ สร้างบัญชี' : '🔑 เข้าสู่ระบบ'
          }
        </button>

        {/* Divider */}
        <div style={S.divider}><span style={S.dividerText}>หรือ</span></div>

        {/* Demo */}
        <button style={S.btnGhost} onClick={demo}>
          🚀 ลองใช้งาน Demo (ไม่ต้องสมัคร)
        </button>

        {/* Footnote */}
        <p style={S.note}>
          {isReg
            ? <>มีบัญชีแล้ว? <span style={S.link} onClick={() => { setIsReg(false); setErrors({}) }}>เข้าสู่ระบบ</span></>
            : <>ยังไม่มีบัญชี? <span style={S.link} onClick={() => { setIsReg(true); setErrors({}) }}>สมัครใหม่</span></>
          }
        </p>

        {/* Dev hint — remove this block in production */}
        <p style={S.devHint}>⚠️ Fake auth — ใช้ email/password อะไรก็ได้</p>

      </div>
    </div>
  )
}

/* ─── helper components ───────────────────────────────────────────────────── */
function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={S.label}>{label}</label>
      {children}
      {error && <div style={S.errText}>{error}</div>}
    </div>
  )
}

function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: 12, height: 12,
      border: '2px solid #0d0f1466', borderTopColor: '#0d0f14',
      borderRadius: '50%', animation: 'spin .6s linear infinite',
      marginRight: 6,
    }} />
  )
}

/* ─── styles (inline so no CSS file changes needed) ──────────────────────── */
const S = {
  wrap: {
    minHeight: '100vh', background: '#0d0f14',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
  },
  card: {
    background: '#13161e', border: '1px solid rgba(255,255,255,0.13)',
    borderRadius: 12, padding: '36px 32px',
    width: '100%', maxWidth: 380,
  },
  logoWrap: { textAlign: 'center', marginBottom: 24 },
  logoMark: {
    fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700,
    color: '#f0f2f8', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  dot: {
    display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
    background: '#22d3a0', flexShrink: 0,
  },
  logoSub: { fontSize: 11, color: '#535e72', marginTop: 4, letterSpacing: '.4px' },

  // Tabs
  tabs: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    background: '#1a1e2a', borderRadius: 8,
    padding: 3, marginBottom: 20, gap: 3,
  },
  tab: {
    padding: '7px 0', borderRadius: 6, border: 'none',
    background: 'transparent', color: '#8892a4',
    fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
  },
  tabActive: { background: '#222840', color: '#f0f2f8', fontWeight: 500 },

  // Form
  label: { display: 'block', fontSize: 12, color: '#8892a4', marginBottom: 5 },
  input: {
    width: '100%', padding: '9px 12px',
    background: '#1a1e2a', border: '1px solid rgba(255,255,255,0.13)',
    borderRadius: 8, color: '#f0f2f8',
    fontFamily: 'inherit', fontSize: 13, outline: 'none',
    boxSizing: 'border-box', transition: 'border-color .15s',
  },
  inputErr: { borderColor: '#ff6b7a' },
  errText:  { fontSize: 11, color: '#ff6b7a', marginTop: 4 },

  // Buttons
  btnPrimary: {
    width: '100%', padding: '10px 0',
    background: '#22d3a0', color: '#0d0f14',
    border: 'none', borderRadius: 8,
    fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'opacity .15s',
  },
  btnDisabled: { opacity: .6, cursor: 'default' },
  btnGhost: {
    width: '100%', padding: '9px 0',
    background: 'transparent', border: '1px solid rgba(255,255,255,0.13)',
    borderRadius: 8, color: '#8892a4',
    fontFamily: 'inherit', fontSize: 13, cursor: 'pointer',
    transition: 'all .15s',
  },

  divider: {
    position: 'relative', textAlign: 'center',
    margin: '14px 0',
    borderTop: '1px solid rgba(255,255,255,0.07)',
  },
  dividerText: {
    position: 'relative', top: -10,
    background: '#13161e', padding: '0 10px',
    fontSize: 12, color: '#535e72',
  },

  note: { fontSize: 12, color: '#535e72', textAlign: 'center', marginTop: 14 },
  link: { color: '#22d3a0', cursor: 'pointer' },

  devHint: {
    marginTop: 16, padding: '6px 10px',
    background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.2)',
    borderRadius: 6, fontSize: 11, color: '#f5c842', textAlign: 'center',
  },
}

/* ─── spinner keyframe (injected once) ───────────────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('ff-spin')) {
  const s = document.createElement('style')
  s.id = 'ff-spin'
  s.textContent = '@keyframes spin { to { transform: rotate(360deg) } }'
  document.head.appendChild(s)
}
