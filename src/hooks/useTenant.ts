'use client'

import { useEffect, useState } from 'react'
import { Tenant } from '@/types/database'

/**
 * Hook to get current tenant information
 * This would normally fetch from your database
 */
export function useTenant() {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch tenant data from Supabase
    // For now, we'll simulate it
    const fetchTenant = async () => {
      try {
        // Get tenant ID from URL or headers
        const pathSegments = window.location.pathname.split('/').filter(Boolean)
        const tenantId = pathSegments[0]
        
        if (!tenantId || tenantId === 'auth') {
          setLoading(false)
          return
        }

        // Simulate tenant data
        const mockTenant: Tenant = {
          id: '1234',
          name: tenantId.replace('-', ' ').replace(/_/g, ' '),
          industry_type: 'hotel', // This would come from database
          subdomain: tenantId,
          settings: {
            branding: {
              primary_color: '#3b82f6',
            },
            features: {
              whatsapp_enabled: true,
              facebook_enabled: true,
              google_enabled: true,
              ai_assistant_enabled: true,
            },
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        setTenant(mockTenant)
      } catch (error) {
        console.error('Error fetching tenant:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTenant()
  }, [])

  return { tenant, loading }
}