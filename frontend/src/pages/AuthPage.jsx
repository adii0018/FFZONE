/**
 * FFZone – Auth Page (Login + Register + Google OAuth)
 */
import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMail, FiLock, FiUser, FiPhone, FiZap, FiEye, FiEyeOff, FiArrowLeft, FiHome } from 'react-icons/fi'
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
    <div className="relative mt-3">
      <Icon
        size={15}
        className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${
          focused ? 'text-[#00f5ff]' : 'text-[#00f5ff]/40'
        }`}
      />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required
        className={`w-full bg-white/[0.04] py-3.5 pl-10 pr-11 rounded-2xl text-white text-sm outline-none transition-all duration-200 ${
          focused 
            ? 'border-l-2 border-r-2 border-[#00f5ff] shadow-[0_8px_12px_-5px_rgba(0,245,255,0.1)]' 
            : 'border-l-2 border-r-2 border-transparent shadow-[0_8px_12px_-5px_rgba(0,245,255,0.1)]'
        }`}
      />
      {right && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
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

  /* ── Removed inline styles - using Tailwind classes below ─────────── */

  const eyeBtn = (
    <button 
      type="button" 
      onClick={() => setShowPass(!showPass)}
      className="bg-transparent border-none cursor-pointer text-white/40 hover:text-white/60 transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]"
    >
      {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
    </button>
  )

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-10 sm:py-16 relative"
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

      {/* ── Navigation Buttons ────────────────────────────────── */}
      <div className="absolute top-4 sm:top-6 left-4 right-4 sm:left-10 sm:right-10 flex items-center justify-between z-[20]">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 min-h-[44px] rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-[#00f5ff]/10 hover:border-[#00f5ff]/30 transition-all active:scale-95 group"
        >
          <FiArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs sm:text-sm font-bold">Back</span>
        </button>
        
        <Link 
          to="/"
          className="flex items-center gap-2 px-3 sm:px-4 py-2 min-h-[44px] rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-[#00f5ff]/10 hover:border-[#00f5ff]/30 transition-all active:scale-95 group"
        >
          <FiHome size={18} />
          <span className="text-xs sm:text-sm font-bold">Home</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[360px] sm:max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-7">
          <Link to="/" className="inline-flex items-center gap-2 mb-2.5 no-underline">
            <GiFlame className="text-[#00f5ff] text-2xl sm:text-3xl" />
            <span className="text-xl sm:text-2xl font-black text-white">
              FF<span className="text-[#00f5ff]">ZONE</span>
            </span>
          </Link>
          <h1 className="text-lg sm:text-xl font-black text-white m-0">
            {tab === 'login' ? 'Welcome Back' : 'Join the Battle'}
          </h1>
          <p className="text-white/40 text-xs sm:text-[13px] mt-1">
            {tab === 'login' ? 'Login to your account' : 'Create your free account'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-gradient-to-br from-[#0d1f3c] to-[#071428] rounded-[24px] sm:rounded-[28px] p-5 sm:p-7 sm:pb-8 border-2 border-[#00f5ff]/[0.18] shadow-[0_30px_40px_-20px_rgba(0,245,255,0.22),0_10px_30px_rgba(0,0,0,0.6)]">
          {/* Tab switcher */}
          <div className="flex bg-black/35 rounded-[14px] p-1 mb-5 sm:mb-[22px] border border-[#00f5ff]/[0.12]">
            {['login', 'register'].map(t => (
              <button 
                key={t} 
                onClick={() => setTab(t)} 
                className={`flex-1 py-2.5 sm:py-[9px] rounded-[10px] border-none font-bold text-xs sm:text-[13px] cursor-pointer transition-all duration-200 min-h-[44px] ${
                  tab === t 
                    ? 'bg-gradient-to-r from-[#0a84ff] to-[#00f5ff] text-[#050d1a] shadow-[0_6px_14px_-6px_rgba(0,245,255,0.35)]' 
                    : 'bg-transparent text-white/40 hover:text-white/60'
                }`}
              >
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
                <div className="text-right mt-2">
                  <a href="#" className="text-[#00f5ff] text-[11px] no-underline hover:underline">Forgot Password?</a>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className={`flex items-center justify-center gap-2 w-full font-extrabold text-sm sm:text-[15px] bg-gradient-to-r from-[#0a84ff] to-[#00f5ff] text-[#050d1a] py-3.5 mt-5 rounded-2xl border-none shadow-[0_18px_14px_-14px_rgba(0,245,255,0.4)] transition-all duration-200 min-h-[44px] ${
                    loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-[1.03] hover:shadow-[0_22px_14px_-18px_rgba(0,245,255,0.5)] active:scale-[0.97]'
                  }`}
                >
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
                <button 
                  type="submit" 
                  disabled={loading}
                  className={`flex items-center justify-center gap-2 w-full font-extrabold text-sm sm:text-[15px] bg-gradient-to-r from-[#0a84ff] to-[#00f5ff] text-[#050d1a] py-3.5 mt-5 rounded-2xl border-none shadow-[0_18px_14px_-14px_rgba(0,245,255,0.4)] transition-all duration-200 min-h-[44px] ${
                    loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-[1.03] hover:shadow-[0_22px_14px_-18px_rgba(0,245,255,0.5)] active:scale-[0.97]'
                  }`}
                >
                  <GiFlame /> Create Account
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 my-4 sm:my-5">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-white/30 text-[11px] whitespace-nowrap">Or continue with</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {/* ── Google Button ── */}
          <button
            type="button"
            onClick={() => googleLogin()}
            disabled={loading}
            className={`flex items-center justify-center gap-2.5 w-full py-3 rounded-2xl border-2 border-white/10 bg-white/5 text-white text-sm font-semibold shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-200 min-h-[44px] ${
              loading 
                ? 'cursor-not-allowed opacity-60' 
                : 'cursor-pointer hover:bg-white/10 hover:border-white/25 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <GoogleIcon />
            Sign in with Google
          </button>
        </div>

        <p className="text-center text-white/25 text-[11px] mt-4">
          By joining, you agree to our{' '}
          <a href="/terms" className="text-[#00f5ff] no-underline hover:underline">Terms of Service</a>.
        </p>
      </motion.div>
    </div>
  )
}
