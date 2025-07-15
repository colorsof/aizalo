'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'conversation' | 'lead' | 'sale'
  title: string
  message: string
  timestamp: string
  read: boolean
  data?: any
}

export function useRealtimeNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    let channel: RealtimeChannel | null = null

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) throw error

        const formattedNotifications = data?.map(n => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          timestamp: n.created_at,
          read: n.read,
          data: n.data
        })) || []

        setNotifications(formattedNotifications)
        setUnreadCount(formattedNotifications.filter(n => !n.read).length)
        setLoading(false)
      } catch (err) {
        console.error('Notifications fetch error:', err)
        setLoading(false)
      }
    }

    const setupRealtime = async () => {
      await fetchNotifications()

      // Subscribe to new notifications
      channel = supabase
        .channel(`notifications:${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            const newNotification: Notification = {
              id: payload.new.id,
              type: payload.new.type,
              title: payload.new.title,
              message: payload.new.message,
              timestamp: payload.new.created_at,
              read: payload.new.read,
              data: payload.new.data
            }

            setNotifications(prev => [newNotification, ...prev])
            if (!newNotification.read) {
              setUnreadCount(prev => prev + 1)
            }

            // Show browser notification if permitted
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(newNotification.title, {
                body: newNotification.message,
                icon: '/icon.png',
                tag: newNotification.id
              })
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            setNotifications(prev =>
              prev.map(n => n.id === payload.new.id ? {
                ...n,
                read: payload.new.read
              } : n)
            )
            
            // Update unread count
            if (payload.old.read !== payload.new.read) {
              setUnreadCount(prev => payload.new.read ? prev - 1 : prev + 1)
            }
          }
        )
        .subscribe()
    }

    setupRealtime()

    // Cleanup
    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [userId])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (error) throw error
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }, [userId])

  const markAllAsRead = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) throw error
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
    }
  }, [userId])

  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }, [])

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    requestPermission
  }
}