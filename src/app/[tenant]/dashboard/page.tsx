'use client'

import { useTenant } from '@/hooks/useTenant'
import { getIndustryConfig } from '@/config/industries'
import ChatInterface from '@/components/chat/ChatInterface'

export default function TenantDashboard() {
  const { tenant, loading } = useTenant()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Tenant not found</div>
      </div>
    )
  }

  const industryConfig = getIndustryConfig(tenant.industry_type)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl mr-2">{industryConfig.icon}</span>
              <h1 className="text-xl font-semibold">{tenant.name}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-700 hover:text-gray-900">Settings</button>
              <button className="text-gray-700 hover:text-gray-900">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold mb-6">
            {industryConfig.name} Dashboard
          </h2>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Conversations
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        24
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Customers
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        342
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Conversion Rate
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        68%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Revenue This Month
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Ksh 124,500
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Industry-Specific Features */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {industryConfig.features.map((feature, index) => (
                <button
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <div className="text-sm font-medium text-gray-900">{feature}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Conversations */}
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Conversations</h3>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-gray-600">WhatsApp: Do you have rooms available for next weekend?</p>
                  </div>
                  <span className="text-sm text-gray-500">2 min ago</span>
                </div>
              </div>
              <div className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Jane Smith</p>
                    <p className="text-sm text-gray-600">Facebook: What time do you open tomorrow?</p>
                  </div>
                  <span className="text-sm text-gray-500">15 min ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}