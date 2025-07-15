'use client'

import { useState } from 'react'

interface RevenueData {
  month: string
  revenue: number
  leads: number
}

interface RevenueChartProps {
  data: RevenueData[]
  currency?: string
}

export default function RevenueChart({ data, currency = 'KSH' }: RevenueChartProps) {
  const [viewType, setViewType] = useState<'revenue' | 'leads'>('revenue')
  
  const maxValue = Math.max(...data.map(d => viewType === 'revenue' ? d.revenue : d.leads))
  
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Performance Overview</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewType('revenue')}
              className={`px-3 py-1 text-sm rounded-md ${
                viewType === 'revenue' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setViewType('leads')}
              className={`px-3 py-1 text-sm rounded-md ${
                viewType === 'leads' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Leads
            </button>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex items-end space-x-2" style={{ height: '200px' }}>
            {data.map((item, index) => {
              const value = viewType === 'revenue' ? item.revenue : item.leads
              const height = (value / maxValue) * 100
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-200 rounded-t relative group">
                    <div 
                      className="bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {viewType === 'revenue' 
                          ? `${currency} ${value.toLocaleString()}`
                          : `${value} leads`
                        }
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                </div>
              )
            })}
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total {viewType === 'revenue' ? 'Revenue' : 'Leads'}</p>
            <p className="text-2xl font-semibold text-gray-900">
              {viewType === 'revenue' 
                ? `${currency} ${data.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}`
                : `${data.reduce((sum, d) => sum + d.leads, 0).toLocaleString()}`
              }
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Average Monthly</p>
            <p className="text-2xl font-semibold text-gray-900">
              {viewType === 'revenue' 
                ? `${currency} ${Math.round(data.reduce((sum, d) => sum + d.revenue, 0) / data.length).toLocaleString()}`
                : `${Math.round(data.reduce((sum, d) => sum + d.leads, 0) / data.length).toLocaleString()}`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}