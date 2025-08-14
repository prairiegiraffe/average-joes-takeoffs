import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is authenticated, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-6">
            Average Joe's Takeoffs
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Professional contractor management platform. Streamline your takeoffs, 
            manage projects, and grow your contracting business.
          </p>
          
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link href="/auth/signin">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-blue-700">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Professional Takeoffs</h3>
              <p>Accurate material calculations and cost estimates for your projects.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Project Management</h3>
              <p>Track progress, manage customers, and organize your business efficiently.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Multi-Tenant SaaS</h3>
              <p>Secure, scalable platform designed for growing contractor businesses.</p>
            </div>
          </div>

          <div className="mt-8 text-sm opacity-75">
            <p>🚀 Built with Next.js 14, Supabase, and modern best practices</p>
          </div>
        </div>
      </div>
    </div>
  )
}