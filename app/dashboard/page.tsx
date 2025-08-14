'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-xl text-gray-700">Loading...</div>
        </div>
      </div>
    )
  }
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠', current: true },
    { name: 'Takeoffs', href: '/takeoffs', icon: '📐', current: false },
    { name: 'Projects', href: '/projects', icon: '🏗️', current: false },
    { name: 'Customers', href: '/customers', icon: '👥', current: false },
    { name: 'Calculator', href: '/calculator', icon: '🧮', current: false },
    { name: 'Reports', href: '/reports', icon: '📊', current: false },
    { name: 'Settings', href: '/settings', icon: '⚙️', current: false },
  ]
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-center h-16 px-4 bg-gray-800">
          <h1 className="text-xl font-bold text-white">Average Joe's</h1>
        </div>
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  className={`${
                    item.current
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors duration-200"
          >
            <span className="mr-3 text-lg">🚪</span>
            Sign Out
          </button>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-gray-900 p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
        >
          <span className="sr-only">Open sidebar</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="lg:ml-4">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600 mt-1">Welcome back, {user?.email}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">🏗️</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-500">Active Projects</div>
                    <div className="text-2xl font-bold text-gray-900">0</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">👥</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-500">Total Customers</div>
                    <div className="text-2xl font-bold text-gray-900">0</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">📐</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-500">Total Takeoffs</div>
                    <div className="text-2xl font-bold text-gray-900">0</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">💰</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-500">Revenue</div>
                    <div className="text-2xl font-bold text-gray-900">$0</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="group relative bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl mb-2">📐</span>
                    <span className="font-medium">New Takeoff</span>
                  </div>
                </button>
                
                <button className="group relative bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl mb-2">👤</span>
                    <span className="font-medium">Add Customer</span>
                  </div>
                </button>
                
                <button className="group relative bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl mb-2">🏗️</span>
                    <span className="font-medium">New Project</span>
                  </div>
                </button>
                
                <button className="group relative bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl mb-2">🧮</span>
                    <span className="font-medium">Calculator</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  )
}