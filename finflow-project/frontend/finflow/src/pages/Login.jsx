import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../hooks/useApi.js'

export default function Login() {
  const { login } = useAuth()
  const [isReg, setIsReg]     = useState(false)
  const [name,  setName]      = useState('')
  const [email, setEmail]     = useState('')
  const [pass,  setPass]      = useState('')
  const [err,   setErr]       = useState('')
  const [busy,  setBusy]      = useState(false)

  const hasBackend = !!import.meta.env.VITE_API_URL

  const submit = async () => {
    if (!email || !pass) return setErr('กรุณากรอก email และ password')
    setBusy(true); setErr('')
    try {
      let user
      if (hasBackend) {
        user = isReg
          ? await api.auth.register(name || email.split('@')[0], email, pass)
          : await api.auth.login(email, pass)
      } else {
        // Demo mode — no backend needed
        user = { name: name || email.split('@')[0], email, token: 'demo' }
      }
      login(user)
    } catch (e) {
      setErr(e.message || 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง')
    }
    setBusy(false)
  }

  const demo = () => login({ name: 'Demo User', email: 'demo@finflow.app', token: 'demo' })

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-mark"><span className="logo-dot" />FinFlow</div>
          <div className="logo-sub">Personal Financial Secretary</div>
        </div>

        {err && <div className="login-err">{err}</div>}

        {isReg && (
          <div className="fg">
            <label>ชื่อของคุณ</label>
            <input placeholder="สมชาย" value={name} onChange={e => setName(e.target.value)} />
          </div>
        )}

        <div className="fg">
          <label>อีเมล</label>
          <input
            type="email" placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className="fg">
          <label>รหัสผ่าน</label>
          <input
            type="password" placeholder="••••••••"
            value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
        </div>

        <button
          className="btn btn-primary"
          style={{ width:'100%', justifyContent:'center', padding:'10px' }}
          onClick={submit}
          disabled={busy}
        >
          {busy ? 'กำลังดำเนินการ...' : isReg ? 'สร้างบัญชี' : 'เข้าสู่ระบบ'}
        </button>

        <div className="login-divider">หรือ</div>

        <button
          className="btn btn-ghost"
          style={{ width:'100%', justifyContent:'center', fontSize:12 }}
          onClick={demo}
        >
          🚀 ลองใช้งาน Demo (ไม่ต้องสมัคร)
        </button>

        <div className="login-toggle">
          {isReg ? 'มีบัญชีแล้ว? ' : 'ยังไม่มีบัญชี? '}
          <span onClick={() => { setIsReg(!isReg); setErr('') }}>
            {isReg ? 'เข้าสู่ระบบ' : 'สมัครใหม่'}
          </span>
        </div>
      </div>
    </div>
  )
}
