interface QuickAction {
  label: string
  description: string
  icon: React.ReactNode
  onClick: () => void
  color: string
}

interface QuickActionsProps {
  actions: QuickAction[]
}

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-4 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <div className={`flex-shrink-0 rounded-lg p-3 ${action.color}`}>
                <div className="h-6 w-6 text-white">
                  {action.icon}
                </div>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">{action.label}</p>
                <p className="text-sm text-gray-500 truncate">{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}