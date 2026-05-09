/**
 * FFZone – Auth Page (Login + Register with OTP)
 */
import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMail, FiLock, FiUser, FiPhone, FiZap, FiEye, FiEyeOff } from 'react-icons/fi'
import { GiFlame, GiCrossedSwords } from 'react-icons/gi'
import toast from 'react-hot-toast'
import api from '../lib/api'
import useAuthStore from '../store/authStore'
import AuthLoader from '../components/AuthLoader'

const InputField = ({ icon: Icon, type='text', placeholder, value, onChange, right }) => (
  <div className="relative">
    <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00f5ff]/60" />
    <input type={type} placeholder={placeholder} value={value}
      onChange={e => onChange(e.target.value)} className="input-dark pl-10 pr-10" required />
    {right && <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>}
  </div>
)

export default function AuthPage() {
  const [params] = useSearchParams()
  const [tab, setTab] = useState(params.get('tab') === 'register' ? 'register' : 'login')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [uid, setUid] = useState('')
  const [pass, setPass] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await login(loginEmail, loginPass)
      toast.success('Welcome back! 🔥')
      navigate('/dashboard')
    } catch (err) {
      const status = err.response?.status
      const msg    = err.response?.data?.error || ''

      if (!err.response) {
        toast.error('⚡ Server unreachable. Check your connection.')
      } else if (status === 403 || msg.toLowerCase().includes('banned')) {
        toast.error('🚫 Your account has been banned. Contact support.')
      } else if (status === 401 || msg.toLowerCase().includes('invalid')) {
        toast.error('❌ Wrong email or password. Please try again.')
      } else if (status === 400) {
        toast.error('⚠️ Please enter a valid email and password.')
      } else if (status >= 500) {
        toast.error('🔧 Server error. Please try again in a moment.')
      } else {
        toast.error(msg || 'Login failed. Please try again.')
      }
    }
    finally { setLoading(false) }
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
      const status = err.response?.status
      const data   = err.response?.data || {}

      if (!err.response) {
        toast.error('⚡ Server unreachable. Check your connection.')
      } else if (data.error?.toLowerCase().includes('email already')) {
        toast.error('📧 This email is already registered. Try logging in.')
      } else if (data.email) {
        toast.error('📧 Enter a valid email address.')
      } else if (data.password) {
        toast.error('🔒 Password must be at least 6 characters.')
      } else if (data.phone) {
        toast.error('📱 Enter a valid phone number.')
      } else if (data.uid) {
        toast.error('🎮 Enter a valid Free Fire UID.')
      } else if (status >= 500) {
        toast.error('🔧 Server error. Please try again in a moment.')
      } else {
        toast.error(data.error || 'Registration failed. Please try again.')
      }
    }
    finally { setLoading(false) }
  }

  const eyeBtn = <button type="button" onClick={() => setShowPass(!showPass)} className="text-white/40 hover:text-white">
    {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
  </button>

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-10 relative bg-[#050d1a]"
      style={{
        backgroundImage: `url('/auth-bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Auth loader overlay */}
      {loading && (
        <AuthLoader message={tab === 'login' ? 'Logging in...' : 'Creating account...'} />
      )}
      <div className="absolute inset-0 bg-black/45 z-0"></div>
      <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <GiFlame className="text-[#00f5ff] text-3xl" />
            <span className="text-2xl font-black">FF<span className="text-[#00f5ff]">ZONE</span></span>
          </Link>
          <h1 className="text-2xl font-black text-white">{tab==='login' ? 'Welcome Back' : 'Join the Battle'}</h1>
          <p className="text-white/50 text-sm mt-1">{tab==='login' ? 'Login to your account' : 'Create your free account'}</p>
        </div>

        <div className="flex bg-[#071428] rounded-xl p-1 mb-6 border border-[rgba(0,245,255,0.15)]">
          {['login','register'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tab===t ? 'bg-[#00f5ff] text-[#050d1a]' : 'text-white/50 hover:text-white'}`}>
              {t === 'login' ? 'Login' : 'Register'}
            </button>
          ))}
        </div>

        <div className="card p-6">
          <AnimatePresence mode="wait">
            {tab === 'login' ? (
              <motion.form key="login" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}}
                onSubmit={handleLogin} className="space-y-4">
                <InputField icon={FiMail} type="email" placeholder="Email" value={loginEmail} onChange={setLoginEmail} />
                <InputField icon={FiLock} type={showPass?'text':'password'} placeholder="Password" value={loginPass} onChange={setLoginPass} right={eyeBtn} />
                <button type="submit" disabled={loading} className="btn-fire w-full py-3 flex items-center justify-center gap-2">
                  <FiZap/>Login
                </button>
              </motion.form>
            ) : (
              <motion.form key="register" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
                onSubmit={handleRegister} className="space-y-3">
                <InputField icon={FiUser} placeholder="Full Name" value={name} onChange={setName} />
                <InputField icon={FiMail} type="email" placeholder="Email" value={email} onChange={setEmail} />
                <InputField icon={FiPhone} placeholder="Phone Number" value={phone} onChange={setPhone} />
                <InputField icon={GiCrossedSwords} placeholder="Free Fire UID" value={uid} onChange={setUid} />
                <InputField icon={FiLock} type={showPass?'text':'password'} placeholder="Password (min 6)" value={pass} onChange={setPass} right={eyeBtn} />
                <button type="submit" disabled={loading} className="btn-fire w-full py-3 flex items-center justify-center gap-2 mt-2">
                  <GiFlame/>Create Account
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
        <p className="text-center text-white/30 text-xs mt-4">By joining, you agree to our Terms of Service.</p>
      </motion.div>
    </div>
  )
}

