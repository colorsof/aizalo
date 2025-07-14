/**
 * Hardware Store Industry Configuration
 * Optimized for Nairobi's construction boom
 */

export const hardwareStoreConfig = {
  industry: 'hardware_store',
  displayName: 'Hardware & Construction Supplies',
  icon: '🔨',
  description: 'AI assistant for hardware stores, construction suppliers, and building materials',
  
  // Special features for hardware stores
  features: {
    multiItemQuotes: true,
    photoSearch: true,
    deliveryScheduling: true,
    priceAlerts: true,
    inventoryTracking: true,
    bulkOrders: true,
  },

  // Common product categories
  categories: [
    {
      id: 'cement',
      name: 'Cement & Concrete',
      keywords: ['cement', 'concrete', 'mortar', 'grout'],
      units: ['bags', 'tons'],
    },
    {
      id: 'steel',
      name: 'Steel & Iron',
      keywords: ['steel bars', 'iron sheets', 'reinforcement', 'rebar', 'mabati'],
      units: ['pieces', 'tons', 'sheets'],
    },
    {
      id: 'tiles',
      name: 'Tiles & Flooring',
      keywords: ['tiles', 'floor tiles', 'wall tiles', 'ceramic', 'porcelain'],
      units: ['boxes', 'square meters', 'pieces'],
    },
    {
      id: 'plumbing',
      name: 'Plumbing Supplies',
      keywords: ['pipes', 'fittings', 'taps', 'valves', 'PPR', 'CPVC'],
      units: ['pieces', 'meters', 'rolls'],
    },
    {
      id: 'electrical',
      name: 'Electrical Supplies',
      keywords: ['cables', 'switches', 'sockets', 'conduits', 'breakers'],
      units: ['meters', 'rolls', 'pieces'],
    },
    {
      id: 'paint',
      name: 'Paints & Finishes',
      keywords: ['paint', 'primer', 'varnish', 'crown', 'dulux'],
      units: ['liters', 'gallons', 'buckets'],
    },
  ],

  // Sample conversation starters
  conversationStarters: [
    "I need a quote for 50 bags of cement and 20 iron sheets",
    "Do you have 60x60 porcelain tiles in stock?",
    "What's the price of Y12 steel bars?",
    "Can you deliver to Kiambu tomorrow?",
    "I'm building a 3-bedroom house, what materials do I need?",
  ],

  // AI personality for hardware stores
  aiPersonality: {
    tone: 'professional',
    expertise: 'construction materials expert',
    greeting: "Welcome to [STORE_NAME]! I'm your construction materials assistant. I can help with quotes, check stock availability, and arrange delivery. What materials are you looking for today?",
    
    // Common responses
    responses: {
      priceInquiry: "Let me check the current price for [PRODUCT]. How many [UNITS] do you need?",
      multiItemQuote: "I'll prepare a detailed quote for all your items. Please give me a moment to calculate the total.",
      stockCheck: "Let me verify if we have [PRODUCT] in stock. What quantity do you need?",
      delivery: "We offer delivery services. Where is your construction site located?",
      photoSearch: "I see the image you sent. Let me find similar products in our inventory.",
    },
  },

  // Integration with construction-specific services
  integrations: {
    // Price comparison with other stores
    priceWatch: {
      enabled: true,
      competitors: ['store_a', 'store_b', 'store_c'],
      alertThreshold: 5, // Alert if competitor is 5% cheaper
    },
    
    // Delivery partners
    delivery: {
      partners: ['internal_fleet', 'third_party_trucks'],
      zones: {
        'nairobi': { baseFee: 1000, perKm: 50 },
        'kiambu': { baseFee: 1500, perKm: 60 },
        'machakos': { baseFee: 2000, perKm: 70 },
      },
    },
  },

  // Templates for common scenarios
  templates: {
    quotation: {
      header: "QUOTATION - [STORE_NAME]",
      items: "Item | Quantity | Unit Price | Total",
      footer: "Valid for 7 days. Prices subject to availability.",
    },
    
    bulkDiscount: {
      tiers: [
        { min: 50000, discount: 3 },
        { min: 100000, discount: 5 },
        { min: 250000, discount: 8 },
      ],
      message: "Bulk discount of [DISCOUNT]% applied for orders above Ksh [AMOUNT]",
    },
  },

  // Analytics to track
  analytics: {
    topProducts: true,
    peakHours: true,
    conversionRate: true,
    averageOrderValue: true,
    deliveryRequests: true,
    photoSearchUsage: true,
  },
}

// Helper function to generate quotes
export function generateHardwareQuote(items: Array<{
  product: string
  quantity: number
  unitPrice: number
  unit: string
}>) {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const discount = calculateBulkDiscount(subtotal)
  const total = subtotal - discount
  
  return {
    items,
    subtotal,
    discount,
    total,
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  }
}

function calculateBulkDiscount(amount: number): number {
  const { bulkDiscount } = hardwareStoreConfig.templates
  const applicableTier = bulkDiscount.tiers
    .reverse()
    .find(tier => amount >= tier.min)
  
  return applicableTier 
    ? amount * (applicableTier.discount / 100)
    : 0
}