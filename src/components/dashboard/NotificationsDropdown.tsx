'use client'

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Notification } from '@/hooks/useRealtimeNotifications'

interface NotificationsDropdownProps {
  notifications: Notification[]
  unreadCount: number
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function NotificationsDropdown({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead
}: NotificationsDropdownProps) {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="relative text-gray-500 hover:text-gray-700">
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-2 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Menu.Item key={notification.id}>
                  {({ active }) => (
                    <div
                      className={classNames(
                        active ? 'bg-gray-50' : '',
                        notification.read ? '' : 'bg-blue-50',
                        'px-4 py-3 cursor-pointer border-b border-gray-100 last:border-0'
                      )}
                      onClick={() => !notification.read && onMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {notification.type === 'conversation' && (
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                              </svg>
                            </div>
                          )}
                          {notification.type === 'lead' && (
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                              <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                          {notification.type === 'sale' && (
                            <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                              <svg className="h-4 w-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          )}
                          {(notification.type === 'info' || notification.type === 'success' || notification.type === 'warning' || notification.type === 'error') && (
                            <div className={classNames(
                              'h-8 w-8 rounded-full flex items-center justify-center',
                              notification.type === 'info' && 'bg-blue-100',
                              notification.type === 'success' && 'bg-green-100',
                              notification.type === 'warning' && 'bg-yellow-100',
                              notification.type === 'error' && 'bg-red-100'
                            )}>
                              <svg className={classNames(
                                'h-4 w-4',
                                notification.type === 'info' && 'text-blue-600',
                                notification.type === 'success' && 'text-green-600',
                                notification.type === 'warning' && 'text-yellow-600',
                                notification.type === 'error' && 'text-red-600'
                              )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="flex-shrink-0">
                            <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Menu.Item>
              ))
            )}
          </div>

          <div className="px-4 py-2 border-t border-gray-200">
            <a
              href="/notifications"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all notifications
            </a>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}