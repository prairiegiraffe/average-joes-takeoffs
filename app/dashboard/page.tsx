'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/signin')
        return
      }
      
      setUser(user)
      setLoading(false)
    }
    
    checkUser()
  }, [router])
  
  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Contractor Dashboard
              </h1>
              <p className="text-gray-600">Welcome back, {user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Active Projects</h3>
            <p className="text-3xl font-bold text-blue-600">0</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Total Customers</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Takeoffs</h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
          </div>
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400">
              New Takeoff
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400">
              Add Customer
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400">
              View Projects
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400">
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}