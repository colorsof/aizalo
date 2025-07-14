import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      {/* Hero Section with Animated Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-blue-900 to-indigo-900"></div>
        
        {/* Floating orbs animation */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 animate-fade-in-up">
            AI That <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Transforms</span>
            <br />Your Business
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
            Unleash unlimited potential with AI assistants that understand your customers, 
            speak their language, and work tirelessly to grow your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
            <Link href="/demo" className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full overflow-hidden shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-purple-500/25">
              <span className="relative z-10">Try Live Demo</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link href="#how-it-works" className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white border-2 border-white/20 rounded-full backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/40">
              See How It Works
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/20 to-black"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">
              How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Works</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Three simple steps to transform your business with AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:transform hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Connect Your Channels</h3>
                <p className="text-gray-400">
                  Link your WhatsApp, Facebook, and other communication channels in minutes. 
                  Our AI instantly starts learning your business.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:transform hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Train Your AI</h3>
                <p className="text-gray-400">
                  Customize responses, set business rules, and teach your AI about your products 
                  and services. It learns and improves continuously.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:transform hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Watch It Grow</h3>
                <p className="text-gray-400">
                  Your AI handles inquiries 24/7, qualifies leads, books appointments, 
                  and turns conversations into revenue automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section with Modern Cards */}
      <section className="py-24 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Built for Your Industry
            </h2>
            <p className="text-xl text-gray-600">
              Specialized AI solutions that understand your business
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Hardware Store Card - #1 Priority */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 ring-4 ring-orange-500 ring-opacity-50">
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                🔥 Hot Market
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🔨</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-orange-600 transition-colors">Hardware Stores</h3>
                <p className="text-sm text-gray-500 mb-4">Perfect for Nairobi's construction boom!</p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    Multi-item quotations (cement, steel, tiles)
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    Photo-based product search
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    Real-time price & stock updates
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    Delivery scheduling & tracking
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    Bulk order discounts
                  </li>
                </ul>
              </div>
            </div>

            {/* Hotel Card */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🏨</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-600 transition-colors">Hotels</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Instant room availability & pricing
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    24/7 booking assistance
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Guest service automation
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    WhatsApp concierge service
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Review management system
                  </li>
                </ul>
              </div>
            </div>

            {/* Hardware Store Card */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🔧</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-green-600 transition-colors">Hardware Stores</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Product search & availability
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Instant price quotes
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Bulk order processing
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Delivery scheduling
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Technical support chat
                  </li>
                </ul>
              </div>
            </div>

            {/* Law Firm Card */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">⚖️</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-purple-600 transition-colors">Law Firms</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    Consultation booking
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    Case status updates
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    Document collection
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    Client intake automation
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    Billing inquiries
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features That Drive Results
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="flex space-x-4">
              <div className="flex-shrink-0">
                <div className="bg-blue-100 rounded-lg p-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Multi-Channel Communication</h3>
                <p className="text-gray-600">WhatsApp Business API, Facebook Messenger, Web Chat, and Email - all in one platform</p>
              </div>
            </div>

            <div className="flex space-x-4">
              <div className="flex-shrink-0">
                <div className="bg-green-100 rounded-lg p-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Bilingual Support</h3>
                <p className="text-gray-600">Native Swahili and English language processing for authentic customer interactions</p>
              </div>
            </div>

            <div className="flex space-x-4">
              <div className="flex-shrink-0">
                <div className="bg-purple-100 rounded-lg p-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600">Track conversations, conversion rates, and customer satisfaction in real-time</p>
              </div>
            </div>

            <div className="flex space-x-4">
              <div className="flex-shrink-0">
                <div className="bg-yellow-100 rounded-lg p-3">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">24/7 Availability</h3>
                <p className="text-gray-600">Your AI assistant never sleeps, handling customer inquiries round the clock</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section with Gradient Background */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-black text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-pink-900/20"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">
              Pricing That <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Makes Sense</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Start small, grow big. Our AI pays for itself from day one.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Hardware Store Package - Special Launch Offer */}
            <div className="relative group">
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                🏗️ Launch Special
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gray-900 border-2 border-orange-500 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-2">Construction Pro</h3>
                <p className="text-gray-400 mb-4 text-sm">Hardware stores only</p>
                <p className="text-4xl font-bold mb-2">Ksh 3,500</p>
                <p className="text-gray-400 mb-6 text-sm">/month</p>
                <ul className="space-y-2 mb-6 text-sm text-gray-300">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    1,500 AI conversations
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Multi-item quotes
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Photo search
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Delivery tracking
                  </li>
                </ul>
                <button type="button" className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition text-sm">
                  Claim Offer
                </button>
              </div>
            </div>

            {/* Starter Plan */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-2">Starter</h3>
                <p className="text-gray-400 mb-4 text-sm">Perfect for small businesses</p>
                <p className="text-4xl font-bold mb-2">Ksh 2,500</p>
                <p className="text-gray-400 mb-6 text-sm">/month</p>
                <ul className="space-y-3 mb-8 text-gray-300">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    500 AI conversations
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    WhatsApp integration
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Basic AI templates
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Email support
                  </li>
                </ul>
                <button className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                  Start Free Trial
                </button>
              </div>
            </div>

            {/* Professional Plan */}
            <div className="relative group transform scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gray-900 border border-purple-500 rounded-2xl p-8">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-2 mt-4">Professional</h3>
                <p className="text-gray-400 mb-6">For growing businesses</p>
                <p className="text-5xl font-bold mb-2">Ksh 5,000</p>
                <p className="text-gray-400 mb-8">/month</p>
                <ul className="space-y-3 mb-8 text-gray-300">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    2,000 AI conversations
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    WhatsApp + Facebook
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Custom AI responses
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Analytics dashboard
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Priority support
                  </li>
                </ul>
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition">
                  Start Free Trial
                </button>
              </div>
            </div>

            {/* Business Plan */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-2">Business</h3>
                <p className="text-gray-400 mb-6">For established businesses</p>
                <p className="text-5xl font-bold mb-2">Ksh 9,500</p>
                <p className="text-gray-400 mb-8">/month</p>
                <ul className="space-y-3 mb-8 text-gray-300">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    5,000 AI conversations
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    All channels included
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Advanced workflows
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Custom AI training
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Dedicated support
                  </li>
                </ul>
                <button className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Customer Service?
          </h2>
          <p className="text-xl mb-8">
            Join businesses already using AI to handle customer inquiries 24/7
          </p>
          <Link href="/auth/signup" className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition">
            Start Your Free Trial Today
          </Link>
        </div>
      </section>
    </main>
  )
}