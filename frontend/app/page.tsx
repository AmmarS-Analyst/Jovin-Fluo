import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#D9BFA0] via-[#A69677] to-[#D9BFA0]">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-black mb-4">
            Welcome to Jovin Fluo
          </h1>
          <p className="text-xl text-black mb-8">
            Transform your data into actionable insights
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="bg-[#403B33] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2d2822] transition shadow-lg"
            >
              Get Started
            </Link>
            <Link
              href="/register"
              className="bg-white text-[#403B33] px-6 py-3 rounded-lg font-semibold border-2 border-[#403B33] hover:bg-[#D9BFA0] transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
