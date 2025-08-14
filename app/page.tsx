import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-6">
          Average Joe's Takeoffs
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Professional contractor management platform. 
          Streamline your takeoffs, manage projects, and grow your business.
        </p>
        
        <div className="space-x-4">
          <Link 
            href="/auth/signin"
            className="inline-block bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Get Started
          </Link>
          <Link 
            href="/dashboard"
            className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-700 transition"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}