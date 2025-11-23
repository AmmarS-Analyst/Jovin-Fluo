'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import { authService } from '@/lib/auth'
import { showToast } from '@/lib/toast'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authService.login(formData)
      showToast.success('Login successful!')
      router.push('/dashboard')
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Login failed. Please try again.'
      setError(errorMessage)
      showToast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#D9BFA0] via-[#A69677] to-[#D9BFA0] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border-2 border-[#A69677]"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">
            Jovin Fluo
          </h1>
          <p className="text-black">Sign in to your account</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-[#BF8A49]/20 border-2 border-[#BF8A49] text-black rounded-xl"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border-2 border-[#A69677] rounded-xl focus:ring-2 focus:ring-[#403B33] focus:border-[#403B33] bg-white text-black transition"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 pr-12 border-2 border-[#A69677] rounded-xl focus:ring-2 focus:ring-[#403B33] focus:border-[#403B33] bg-white text-black transition"
                placeholder="••••••••"
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black hover:text-black/70 p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#403B33] border-[#A69677] rounded focus:ring-[#403B33]"
              />
              <span className="ml-2 text-sm text-black">Remember me</span>
            </label>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full bg-[#403B33] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#2d2822] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-black">
          Don't have an account?{' '}
          <Link href="/register" className="text-[#403B33] hover:text-[#2d2822] font-semibold underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
