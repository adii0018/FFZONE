/**
 * FFZone – Auth Page (Login + Register + Google OAuth)
 */
import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMail, FiLock, FiUser, FiPhone, FiZap, FiEye, FiEyeOff } from 'react-icons/fi'
import { GiFlame, GiCrossedSwords } from 'react-icons/gi'
import { useGoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import api from '../lib/api'
import useAuthStore from '../store/authStore'
import AuthLoader from '../components/AuthLoader'

/* ── Reusable input field ───────────────────────────────────────────── */
const InputField = ({ icon: Icon, type = 'text', placeholder, value, onChange, right }) => {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position: 'relative', marginTop: 12 }}>
      <Icon
        size={15}
        style={{
          position: 'absolute',
          left: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          color: focused ? '#00f5ff' : 'rgba(0,245,255,0.4)',
          pointerEvents: 'none',
          transition: 'color 0.2s',
        }}
      />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.04)',
          border: 'none',
          borderLeft: `2px solid ${focused ? '#00f5ff' : 'transparent'}`,
          borderRight: `2px solid ${focused ? '#00f5ff' : 'transparent'}`,
          padding: '13px 44px 13px 42px',
          borderRadius: 16,
          color: '#fff',
          fontSize: 14,
          boxShadow: 'rgba(0,245,255,0.1) 0px 8px 12px -5px',
          outline: 'none',
          transition: 'border-color 0.2s ease',
          boxSizing: 'border-box',
        }}
      />
      {right && (
        <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
          {right}
        </div>
      )}
    </div>
  )
}

/* ── Google SVG icon ────────────────────────────────────────────────── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 488 512" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
  </svg>
)

export default function AuthPage() {
  const [params] = useSearchParams()
  const [tab, setTab] = useState(params.get('tab') === 'register' ? 'register' : 'login')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')

  // Register form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [uid, setUid] = useState('')
  const [pass, setPass] = useState('')

  /* ── Handlers ──────────────────────────────────────────────────── */
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(loginEmail, loginPass)
      toast.success('Welcome back! 🔥')
      navigate('/dashboard')
    } catch (err) {
      const s   = err.response?.status
      const msg = err.response?.data?.error || ''
      if (!err.response)                                              toast.error('⚡ Server unreachable. Check your connection.')
      else if (s === 403 || msg.toLowerCase().includes('banned'))    toast.error('🚫 Your account has been banned. Contact support.')
      else if (s === 401 || msg.toLowerCase().includes('invalid'))   toast.error('❌ Wrong email or password. Please try again.')
      else if (s === 400)                                             toast.error('⚠️ Please enter a valid email and password.')
      else if (s >= 500)                                              toast.error('🔧 Server error. Please try again in a moment.')
      else                                                            toast.error(msg || 'Login failed. Please try again.')
    } finally { setLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register/', { name, email, phone, uid, password: pass })
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      toast.success('Account created! Welcome to FFZone 🔥')
      navigate('/dashboard')
    } catch (err) {
      const s    = err.response?.status
      const data = err.response?.data || {}
      if (!err.response)                                              toast.error('⚡ Server unreachable. Check your connection.')
      else if (data.error?.toLowerCase().includes('email already'))  toast.error('📧 This email is already registered. Try logging in.')
      else if (data.email)                                            toast.error('📧 Enter a valid email address.')
      else if (data.password)                                         toast.error('🔒 Password must be at least 6 characters.')
      else if (data.phone)                                            toast.error('📱 Enter a valid phone number.')
      else if (data.uid)                                              toast.error('🎮 Enter a valid Free Fire UID.')
      else if (s >= 500)                                              toast.error('🔧 Server error. Please try again in a moment.')
      else                                                            toast.error(data.error || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true)
    try {
      // Fetch user info from Google using the access token
      const res      = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      })
      const userInfo = await res.json()

      // Send to our backend for verification + JWT issuance
      const { data } = await api.post('/auth/google/', {
        credential: tokenResponse.access_token,
        email:      userInfo.email,
        name:       userInfo.name,
        picture:    userInfo.picture,
      })

      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      toast.success(data.created ? 'Account created via Google! 🔥' : 'Welcome back! 🔥')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Google login failed. Try again.')
    } finally { setLoading(false) }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError:   () => toast.error('Google sign-in was cancelled or failed.'),
  })

  /* ── Styles ─────────────────────────────────────────────────────── */
  const cardStyle = {
    background: 'linear-gradient(160deg, #0d1f3c 0%, #071428 100%)',
    borderRadius: 28,
    padding: '28px 32px 32px',
    border: '2px solid rgba(0,245,255,0.18)',
    boxShadow: 'rgba(0,245,255,0.22) 0px 30px 40px -20px, rgba(0,0,0,0.6) 0px 10px 30px',
  }

  const tabBarStyle = {
    display: 'flex',
    background: 'rgba(0,0,0,0.35)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 22,
    border: '1px solid rgba(0,245,255,0.12)',
  }

  const tabBtn = (active) => ({
    flex: 1,
    padding: '9px 0',
    borderRadius: 10,
    border: 'none',
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: active ? 'linear-gradient(45deg, #0a84ff, #00f5ff)' : 'transparent',
    color: active ? '#050d1a' : 'rgba(255,255,255,0.4)',
    boxShadow: active ? 'rgba(0,245,255,0.35) 0px 6px 14px -6px' : 'none',
  })

  const submitBtnStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    fontWeight: 800,
    fontSize: 15,
    background: 'linear-gradient(45deg, #0a84ff 0%, #00f5ff 100%)',
    color: '#050d1a',
    padding: '14px 0',
    marginTop: 20,
    borderRadius: 16,
    border: 'none',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1,
    boxShadow: 'rgba(0,245,255,0.4) 0px 18px 14px -14px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  }

  const eyeBtn = (
    <button type="button" onClick={() => setShowPass(!showPass)}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex' }}>
      {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
    </button>
  )

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 relative"
      style={{
        backgroundImage: `url('/auth-bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundColor: '#050d1a',
      }}
    >
      {loading && <AuthLoader message={tab === 'login' ? 'Logging in...' : 'Creating account...'} />}
      <div className="absolute inset-0 bg-black/50 z-0" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{ width: '100%', maxWidth: 360, position: 'relative', zIndex: 10 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 10, textDecoration: 'none' }}>
            <GiFlame style={{ color: '#00f5ff', fontSize: 28 }} />
            <span style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>
              FF<span style={{ color: '#00f5ff' }}>ZONE</span>
            </span>
          </Link>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0 }}>
            {tab === 'login' ? 'Welcome Back' : 'Join the Battle'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 }}>
            {tab === 'login' ? 'Login to your account' : 'Create your free account'}
          </p>
        </div>

        {/* Card */}
        <div style={cardStyle}>
          {/* Tab switcher */}
          <div style={tabBarStyle}>
            {['login', 'register'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={tabBtn(tab === t)}>
                {t === 'login' ? 'Login' : 'Register'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'login' ? (
              <motion.form key="login"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLogin}>
                <InputField icon={FiMail} type="email" placeholder="E-mail" value={loginEmail} onChange={setLoginEmail} />
                <InputField icon={FiLock} type={showPass ? 'text' : 'password'} placeholder="Password" value={loginPass} onChange={setLoginPass} right={eyeBtn} />
                <div style={{ textAlign: 'right', marginTop: 8 }}>
                  <a href="#" style={{ color: '#00f5ff', fontSize: 11, textDecoration: 'none' }}>Forgot Password?</a>
                </div>
                <button type="submit" disabled={loading} style={submitBtnStyle}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = 'rgba(0,245,255,0.5) 0px 22px 14px -18px' }}}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'rgba(0,245,255,0.4) 0px 18px 14px -14px' }}
                  onMouseDown={e => { if (!loading) e.currentTarget.style.transform = 'scale(0.97)' }}
                  onMouseUp={e => { if (!loading) e.currentTarget.style.transform = 'scale(1.03)' }}>
                  <FiZap /> Login
                </button>
              </motion.form>
            ) : (
              <motion.form key="register"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRegister}>
                <InputField icon={FiUser} placeholder="Full Name" value={name} onChange={setName} />
                <InputField icon={FiMail} type="email" placeholder="E-mail" value={email} onChange={setEmail} />
                <InputField icon={FiPhone} placeholder="Phone Number" value={phone} onChange={setPhone} />
                <InputField icon={GiCrossedSwords} placeholder="Free Fire UID" value={uid} onChange={setUid} />
                <InputField icon={FiLock} type={showPass ? 'text' : 'password'} placeholder="Password (min 6)" value={pass} onChange={setPass} right={eyeBtn} />
                <button type="submit" disabled={loading} style={submitBtnStyle}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = 'rgba(0,245,255,0.5) 0px 22px 14px -18px' }}}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'rgba(0,245,255,0.4) 0px 18px 14px -14px' }}
                  onMouseDown={e => { if (!loading) e.currentTarget.style.transform = 'scale(0.97)' }}
                  onMouseUp={e => { if (!loading) e.currentTarget.style.transform = 'scale(1.03)' }}>
                  <GiFlame /> Create Account
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* ── Divider ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 16px' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, whiteSpace: 'nowrap' }}>Or continue with</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* ── Google Button ── */}
          <button
            type="button"
            onClick={() => googleLogin()}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              width: '100%',
              padding: '12px 0',
              borderRadius: 16,
              border: '2px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s ease',
              boxShadow: 'rgba(0,0,0,0.3) 0px 4px 12px',
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
                e.currentTarget.style.transform = 'scale(1.02)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
            onMouseDown={e => { if (!loading) e.currentTarget.style.transform = 'scale(0.98)' }}
            onMouseUp={e => { if (!loading) e.currentTarget.style.transform = 'scale(1.02)' }}
          >
            <GoogleIcon />
            Sign in with Google
          </button>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 16 }}>
          By joining, you agree to our{' '}
          <a href="/terms" style={{ color: '#00f5ff', textDecoration: 'none' }}>Terms of Service</a>.
        </p>
      </motion.div>
    </div>
  )
}
