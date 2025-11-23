'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { authService } from '@/lib/auth'
import { showToast } from '@/lib/toast'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authService.register(formData)
      showToast.success('Registration successful! Please login.')
      router.push('/login')
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Registration failed. Please try again.'
      setError(errorMessage)
      showToast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#D9BFA0] via-[#A69677] to-[#D9BFA0] px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 border-2 border-[#A69677]">
        <h1 className="text-3xl font-bold text-center mb-8 text-black">
          Create Account
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-[#BF8A49]/20 border-2 border-[#BF8A49] text-black rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-black mb-2">
              Full Name
            </label>
            <input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-2 border-2 border-[#A69677] rounded-lg focus:ring-2 focus:ring-[#403B33] focus:border-[#403B33] bg-white text-black transition"
              placeholder="John Doe"
            />
          </div>

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
              className="w-full px-4 py-2 border-2 border-[#A69677] rounded-lg focus:ring-2 focus:ring-[#403B33] focus:border-[#403B33] bg-white text-black transition"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border-2 border-[#A69677] rounded-lg focus:ring-2 focus:ring-[#403B33] focus:border-[#403B33] bg-white text-black transition"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#403B33] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#2d2822] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-black">
          Already have an account?{' '}
          <Link href="/login" className="text-[#403B33] hover:text-[#2d2822] font-semibold underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
