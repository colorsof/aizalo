/**
 * Industry configuration for the multitenant platform
 * Add new industries here and they'll automatically appear throughout the app
 */

import { TenantIndustry } from '@/types/database'

export interface IndustryConfig {
  id: TenantIndustry
  name: string
  description: string
  icon: string
  color: string
  features: string[]
  modules: string[]
}

export const INDUSTRIES: Record<TenantIndustry, IndustryConfig> = {
  hotel: {
    id: 'hotel',
    name: 'Hotels',
    description: 'Hospitality and accommodation services',
    icon: '🏨',
    color: 'blue',
    features: [
      'Room availability management',
      'Booking automation',
      'Guest communication',
      'Review management',
      'Housekeeping coordination'
    ],
    modules: ['rooms', 'bookings', 'guests', 'housekeeping', 'reviews']
  },
  hardware_store: {
    id: 'hardware_store',
    name: 'Hardware Stores',
    description: 'Building materials and tools retail',
    icon: '🔧',
    color: 'green',
    features: [
      'Inventory management',
      'Price quotations',
      'Supplier coordination',
      'Bulk order processing',
      'Product availability'
    ],
    modules: ['inventory', 'suppliers', 'quotes', 'orders', 'customers']
  },
  law_firm: {
    id: 'law_firm',
    name: 'Law Firms',
    description: 'Legal services and consultancy',
    icon: '⚖️',
    color: 'purple',
    features: [
      'Case management',
      'Client communication',
      'Document automation',
      'Billing inquiries',
      'Appointment scheduling'
    ],
    modules: ['cases', 'clients', 'documents', 'billing', 'calendar']
  },
  auto_parts: {
    id: 'auto_parts',
    name: 'Auto Parts',
    description: 'Vehicle parts and accessories',
    icon: '🚗',
    color: 'red',
    features: [
      'Parts compatibility checker',
      'VIN lookup',
      'Inventory tracking',
      'Warranty management',
      'Mechanic coordination'
    ],
    modules: ['parts', 'vehicles', 'warranties', 'mechanics', 'orders']
  },
  restaurant: {
    id: 'restaurant',
    name: 'Restaurants',
    description: 'Food service and dining',
    icon: '🍽️',
    color: 'orange',
    features: [
      'Table reservations',
      'Menu inquiries',
      'Order management',
      'Delivery tracking',
      'Special requests'
    ],
    modules: ['reservations', 'menu', 'orders', 'delivery', 'kitchen']
  },
  pharmacy: {
    id: 'pharmacy',
    name: 'Pharmacies',
    description: 'Medication and health products',
    icon: '💊',
    color: 'teal',
    features: [
      'Prescription management',
      'Drug availability',
      'Insurance verification',
      'Refill reminders',
      'Health consultations'
    ],
    modules: ['prescriptions', 'inventory', 'insurance', 'consultations', 'refills']
  },
  supermarket: {
    id: 'supermarket',
    name: 'Supermarkets',
    description: 'Grocery and general retail',
    icon: '🛒',
    color: 'yellow',
    features: [
      'Product search',
      'Price checking',
      'Delivery scheduling',
      'Loyalty programs',
      'Special offers'
    ],
    modules: ['products', 'pricing', 'delivery', 'loyalty', 'promotions']
  },
  clinic: {
    id: 'clinic',
    name: 'Clinics',
    description: 'Healthcare services',
    icon: '🏥',
    color: 'pink',
    features: [
      'Appointment booking',
      'Patient inquiries',
      'Test results',
      'Prescription requests',
      'Emergency triage'
    ],
    modules: ['appointments', 'patients', 'lab', 'prescriptions', 'triage']
  },
  gym: {
    id: 'gym',
    name: 'Gyms & Fitness',
    description: 'Fitness and wellness centers',
    icon: '💪',
    color: 'indigo',
    features: [
      'Membership inquiries',
      'Class scheduling',
      'Personal training',
      'Equipment availability',
      'Nutrition guidance'
    ],
    modules: ['memberships', 'classes', 'trainers', 'equipment', 'nutrition']
  },
  salon: {
    id: 'salon',
    name: 'Salons & Spas',
    description: 'Beauty and wellness services',
    icon: '💇',
    color: 'rose',
    features: [
      'Appointment booking',
      'Service inquiries',
      'Stylist selection',
      'Product recommendations',
      'Loyalty rewards'
    ],
    modules: ['appointments', 'services', 'staff', 'products', 'loyalty']
  },
  real_estate: {
    id: 'real_estate',
    name: 'Real Estate',
    description: 'Property sales and rentals',
    icon: '🏡',
    color: 'emerald',
    features: [
      'Property inquiries',
      'Virtual tours',
      'Price negotiations',
      'Document processing',
      'Viewing schedules'
    ],
    modules: ['properties', 'tours', 'negotiations', 'documents', 'viewings']
  }
}

/**
 * Get list of all available industries
 */
export function getIndustries(): IndustryConfig[] {
  return Object.values(INDUSTRIES)
}

/**
 * Get configuration for a specific industry
 */
export function getIndustryConfig(industry: TenantIndustry): IndustryConfig {
  return INDUSTRIES[industry]
}