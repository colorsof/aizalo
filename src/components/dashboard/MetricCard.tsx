interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    trend: 'up' | 'down'
  }
  icon: React.ReactNode
  color?: 'blue' | 'green' | 'yellow' | 'red'
  action?: {
    label: string
    href: string
  }
}

export default function MetricCard({
  title,
  value,
  change,
  icon,
  color = 'blue',
  action
}: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${colorClasses[color]}`}>
            <div className="h-6 w-6 text-white">
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">
                  {value}
                </div>
              </dd>
            </dl>
            {change && (
              <div className="flex items-center text-sm">
                <span className={`font-medium ${change.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {change.trend === 'up' ? '↑' : '↓'} {Math.abs(change.value)}%
                </span>
                <span className="text-gray-500 ml-2">from last week</span>
              </div>
            )}
          </div>
        </div>
      </div>
      {action && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <a href={action.href} className="font-medium text-blue-600 hover:text-blue-500">
              {action.label}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}