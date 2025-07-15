'use client'

import { useState } from 'react'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, eachDayOfInterval } from 'date-fns'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface AnalyticsData {
  conversations: {
    total: number
    byChannel: Record<string, number>
    trend: Array<{ date: string; count: number }>
    responseTime: number
    resolutionRate: number
  }
  campaigns: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    converted: number
    roi: number
    topPerforming: Array<{ name: string; conversion: number }>
  }
  revenue: {
    total: number
    byChannel: Record<string, number>
    trend: Array<{ date: string; amount: number }>
    averageOrderValue: number
    lifetimeValue: number
  }
  customers: {
    total: number
    new: number
    returning: number
    churnRate: number
    satisfaction: number
    topLocations: Array<{ location: string; count: number }>
  }
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('week')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedMetric, setSelectedMetric] = useState<'conversations' | 'campaigns' | 'revenue' | 'customers'>('revenue')

  // Mock data - will be replaced with real data from Supabase
  const analyticsData: AnalyticsData = {
    conversations: {
      total: 1234,
      byChannel: {
        whatsapp: 678,
        facebook: 234,
        instagram: 189,
        tiktok: 89,
        web: 44
      },
      trend: eachDayOfInterval({ 
        start: subDays(new Date(), 6), 
        end: new Date() 
      }).map(date => ({
        date: format(date, 'MMM d'),
        count: Math.floor(Math.random() * 50) + 100
      })),
      responseTime: 2.5, // minutes
      resolutionRate: 87 // percentage
    },
    campaigns: {
      sent: 5678,
      delivered: 5432,
      opened: 3210,
      clicked: 987,
      converted: 234,
      roi: 324, // percentage
      topPerforming: [
        { name: 'Weekend Flash Sale', conversion: 12.5 },
        { name: 'New Product Launch', conversion: 10.2 },
        { name: 'Customer Appreciation', conversion: 8.7 },
        { name: 'Holiday Special', conversion: 7.3 },
        { name: 'Referral Program', conversion: 6.8 }
      ]
    },
    revenue: {
      total: 2456789,
      byChannel: {
        whatsapp: 1234567,
        facebook: 567890,
        instagram: 345678,
        tiktok: 234567,
        web: 104987
      },
      trend: eachDayOfInterval({ 
        start: subDays(new Date(), 6), 
        end: new Date() 
      }).map(date => ({
        date: format(date, 'MMM d'),
        amount: Math.floor(Math.random() * 100000) + 200000
      })),
      averageOrderValue: 5670,
      lifetimeValue: 45670
    },
    customers: {
      total: 1892,
      new: 234,
      returning: 1658,
      churnRate: 5.2,
      satisfaction: 4.5,
      topLocations: [
        { location: 'Westlands', count: 456 },
        { location: 'CBD', count: 389 },
        { location: 'Kilimani', count: 234 },
        { location: 'Karen', count: 189 },
        { location: 'Lavington', count: 156 }
      ]
    }
  }

  const getDateRangeText = () => {
    switch (dateRange) {
      case 'today':
        return format(new Date(), 'MMMM d, yyyy')
      case 'week':
        return `${format(startOfWeek(new Date()), 'MMM d')} - ${format(endOfWeek(new Date()), 'MMM d, yyyy')}`
      case 'month':
        return format(new Date(), 'MMMM yyyy')
      case 'custom':
        return startDate && endDate ? `${format(new Date(startDate), 'MMM d')} - ${format(new Date(endDate), 'MMM d, yyyy')}` : 'Select dates'
      default:
        return ''
    }
  }

  const revenueChartData = {
    labels: analyticsData.revenue.trend.map(d => d.date),
    datasets: [
      {
        label: 'Revenue (KSH)',
        data: analyticsData.revenue.trend.map(d => d.amount),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  }

  const conversationChartData = {
    labels: analyticsData.conversations.trend.map(d => d.date),
    datasets: [
      {
        label: 'Conversations',
        data: analyticsData.conversations.trend.map(d => d.count),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1
      }
    ]
  }

  const channelChartData = {
    labels: Object.keys(analyticsData.revenue.byChannel).map(channel => 
      channel.charAt(0).toUpperCase() + channel.slice(1)
    ),
    datasets: [
      {
        label: 'Revenue by Channel',
        data: Object.values(analyticsData.revenue.byChannel),
        backgroundColor: [
          'rgba(37, 211, 102, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(0, 0, 0, 0.8)',
          'rgba(107, 114, 128, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  }

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'KSH ' + value.toLocaleString()
          }
        }
      }
    }
  }

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right'
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
                <p className="mt-1 text-sm text-gray-600">Track your business performance and insights</p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Custom Range</option>
              </select>
              
              {dateRange === 'custom' && (
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-600 font-medium">{getDateRangeText()}</p>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mt-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      KSH {analyticsData.revenue.total.toLocaleString()}
                    </dd>
                    <dd className="text-sm text-green-600">↑ 12% from last period</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-green-100 rounded-full">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Conversations</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {analyticsData.conversations.total.toLocaleString()}
                    </dd>
                    <dd className="text-sm text-green-600">↑ 23% from last period</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Conversion Rate</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {((analyticsData.campaigns.converted / analyticsData.campaigns.sent) * 100).toFixed(1)}%
                    </dd>
                    <dd className="text-sm text-green-600">↑ 3.2% from last period</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {analyticsData.customers.total.toLocaleString()}
                    </dd>
                    <dd className="text-sm text-green-600">+{analyticsData.customers.new} new this period</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Analytics Content */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Revenue Trend Chart */}
          <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
            <div style={{ height: '300px' }}>
              <Line data={revenueChartData} options={chartOptions} />
            </div>
          </div>

          {/* Channel Performance */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Channel</h3>
            <div style={{ height: '300px' }}>
              <Doughnut data={channelChartData} options={doughnutOptions} />
            </div>
          </div>

          {/* Conversation Analytics */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Conversation Volume</h3>
            <div style={{ height: '250px' }}>
              <Bar data={conversationChartData} options={barChartOptions} />
            </div>
          </div>

          {/* Campaign Performance */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Funnel</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Sent</span>
                  <span className="text-sm text-gray-900">{analyticsData.campaigns.sent.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Delivered</span>
                  <span className="text-sm text-gray-900">{analyticsData.campaigns.delivered.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(analyticsData.campaigns.delivered / analyticsData.campaigns.sent) * 100}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Opened</span>
                  <span className="text-sm text-gray-900">{analyticsData.campaigns.opened.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(analyticsData.campaigns.opened / analyticsData.campaigns.sent) * 100}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Clicked</span>
                  <span className="text-sm text-gray-900">{analyticsData.campaigns.clicked.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(analyticsData.campaigns.clicked / analyticsData.campaigns.sent) * 100}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Converted</span>
                  <span className="text-sm text-gray-900">{analyticsData.campaigns.converted.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(analyticsData.campaigns.converted / analyticsData.campaigns.sent) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Locations */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Customer Locations</h3>
            <div className="space-y-3">
              {analyticsData.customers.topLocations.map((location, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">{index + 1}. {location.location}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">{location.count} customers</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(location.count / analyticsData.customers.topLocations[0].count) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white shadow rounded-lg p-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Average Response Time</h4>
            <p className="text-2xl font-bold text-gray-900">{analyticsData.conversations.responseTime} min</p>
            <p className="text-sm text-green-600 mt-1">↓ 0.5 min from last period</p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Resolution Rate</h4>
            <p className="text-2xl font-bold text-gray-900">{analyticsData.conversations.resolutionRate}%</p>
            <p className="text-sm text-green-600 mt-1">↑ 2% from last period</p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Customer Satisfaction</h4>
            <div className="flex items-center">
              <p className="text-2xl font-bold text-gray-900">{analyticsData.customers.satisfaction}</p>
              <div className="ml-2 flex">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i} 
                    className={`w-5 h-5 ${i < Math.floor(analyticsData.customers.satisfaction) ? 'text-yellow-400' : 'text-gray-300'}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">Based on {analyticsData.customers.total} reviews</p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Campaign ROI</h4>
            <p className="text-2xl font-bold text-green-600">+{analyticsData.campaigns.roi}%</p>
            <p className="text-sm text-gray-600 mt-1">Return on investment</p>
          </div>
        </div>

        {/* Top Performing Campaigns */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Top Performing Campaigns</h3>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              {analyticsData.campaigns.topPerforming.map((campaign, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-medium text-sm">
                      {index + 1}
                    </span>
                    <span className="ml-3 font-medium text-gray-900">{campaign.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-2">{campaign.conversion}% conversion</span>
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">📊 Need Detailed Reports?</h3>
          <p className="text-sm text-blue-800 mb-4">
            Export your analytics data in various formats for deeper analysis or sharing with stakeholders.
          </p>
          <div className="flex gap-3">
            <button className="bg-white text-blue-600 px-4 py-2 rounded-md border border-blue-300 hover:bg-blue-50 font-medium text-sm">
              Export as PDF
            </button>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-md border border-blue-300 hover:bg-blue-50 font-medium text-sm">
              Export as Excel
            </button>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-md border border-blue-300 hover:bg-blue-50 font-medium text-sm">
              Schedule Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}