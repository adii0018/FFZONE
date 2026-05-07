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

const InputField = ({ icon: Icon, type='text', placeholder, value, onChange, right }) => (
  <div className="relative">
    <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FF007F]/60" />
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
      toast.success('Welcome back! 🔥'); navigate('/dashboard')
    } catch (err) { toast.error(err.response?.data?.error || 'Invalid credentials.') }
    finally { setLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register/', { name, email, phone, uid, password: pass })
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      toast.success('Account created! Welcome 🔥'); navigate('/dashboard')
    } catch (err) { toast.error(err.response?.data?.error || 'Registration failed.') }
    finally { setLoading(false) }
  }

  const eyeBtn = <button type="button" onClick={() => setShowPass(!showPass)} className="text-white/40 hover:text-white">
    {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
  </button>

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-10 relative bg-[#05070A]"
      style={{
        backgroundImage: `url('/auth-bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-black/45 z-0"></div>
      <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <GiFlame className="text-[#FF007F] text-3xl" />
            <span className="text-2xl font-black">FF<span className="text-[#FF007F]">ZONE</span></span>
          </Link>
          <h1 className="text-2xl font-black text-white">{tab==='login' ? 'Welcome Back' : 'Join the Battle'}</h1>
          <p className="text-white/50 text-sm mt-1">{tab==='login' ? 'Login to your account' : 'Create your free account'}</p>
        </div>

        <div className="flex bg-[#0E121A] rounded-xl p-1 mb-6 border border-[rgba(255,0,127,0.15)]">
          {['login','register'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tab===t ? 'bg-[#FF007F] text-white' : 'text-white/50 hover:text-white'}`}>
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
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiZap/>Login</>}
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
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><GiFlame/>Create Account</>}
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

