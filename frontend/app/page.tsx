import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Jovin Fluo - Data Analytics Platform',
  description: 'Upload your data, create beautiful dashboards, and export insights. Free and open-source.',
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to Jovin Fluo
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Transform your data into actionable insights
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Get Started
            </Link>
            <Link
              href="/register"
              className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

