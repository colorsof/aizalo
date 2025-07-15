import WhatsAppTester from '@/components/whatsapp/WhatsAppTester'

export default function WhatsAppTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          WhatsApp Integration Test
        </h1>
        
        <WhatsAppTester />
        
        <div className="mt-12 text-center">
          <a 
            href="/docs/WHATSAPP_SETUP.md" 
            target="_blank"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            View Setup Documentation →
          </a>
        </div>
      </div>
    </div>
  )
}