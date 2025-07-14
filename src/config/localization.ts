/**
 * Localization configuration for Kenyan market
 */

export const KenyanLocalization = {
  currency: {
    code: 'KES',
    symbol: 'Ksh',
    format: (amount: number) => `Ksh ${amount.toLocaleString('en-KE')}`,
  },
  
  phoneNumber: {
    countryCode: '+254',
    format: (phone: string) => {
      // Convert 0722123456 to +254 722 123 456
      const cleaned = phone.replace(/\D/g, '')
      if (cleaned.startsWith('0')) {
        return `+254 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
      }
      return phone
    },
    validate: (phone: string) => {
      const cleaned = phone.replace(/\D/g, '')
      return cleaned.length === 10 && (cleaned.startsWith('07') || cleaned.startsWith('01'))
    }
  },

  businessHours: {
    timezone: 'Africa/Nairobi',
    workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    workHours: { start: '08:00', end: '17:00' },
    publicHolidays: [
      'New Year\'s Day',
      'Good Friday',
      'Easter Monday',
      'Labour Day (May 1)',
      'Madaraka Day (June 1)',
      'Mashujaa Day (October 20)',
      'Jamhuri Day (December 12)',
      'Christmas Day',
      'Boxing Day'
    ]
  },

  paymentMethods: [
    { id: 'mpesa', name: 'M-Pesa', icon: '📱' },
    { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦' },
    { id: 'cash', name: 'Cash', icon: '💵' },
    { id: 'cheque', name: 'Cheque', icon: '📄' }
  ],

  languages: [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' }
  ],

  commonGreetings: {
    en: {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening',
      welcome: 'Welcome',
      goodbye: 'Goodbye',
      thanks: 'Thank you'
    },
    sw: {
      morning: 'Habari ya asubuhi',
      afternoon: 'Habari ya mchana',
      evening: 'Habari ya jioni',
      welcome: 'Karibu',
      goodbye: 'Kwaheri',
      thanks: 'Asante'
    }
  },

  businessTerms: {
    en: {
      customer: 'Customer',
      invoice: 'Invoice',
      receipt: 'Receipt',
      quotation: 'Quotation',
      delivery: 'Delivery',
      payment: 'Payment'
    },
    sw: {
      customer: 'Mteja',
      invoice: 'Ankara',
      receipt: 'Risiti',
      quotation: 'Kadirio',
      delivery: 'Uwasilishaji',
      payment: 'Malipo'
    }
  },

  regions: [
    'Nairobi',
    'Mombasa',
    'Kisumu',
    'Nakuru',
    'Eldoret',
    'Thika',
    'Kiambu',
    'Machakos',
    'Nyeri',
    'Meru'
  ],

  popularBusinessAreas: {
    Nairobi: [
      'CBD',
      'Westlands',
      'Industrial Area',
      'Karen',
      'Kilimani',
      'Upper Hill',
      'Eastleigh',
      'South B/C',
      'Lavington',
      'Parklands'
    ]
  }
}