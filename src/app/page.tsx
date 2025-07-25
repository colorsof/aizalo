import Link from 'next/link'
import { Hero } from '@/components/ui/animated-hero'
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid'
import IndustriesSection from '@/components/ui/industries-section'
import { Search, MessageSquare, Heart, TrendingUp, Users, Zap, Globe, ShoppingCart, BarChart3, Brain } from 'lucide-react'

export default function HomePage() {
  const bentoFeatures = [
    {
      Icon: ShoppingCart,
      name: "Gikomba-Style Bargaining AI",
      description: "Masters the art of bargaining like a pro! Your AI negotiates prices with the tenacity of Gikomba market vendors, creates urgency, offers flexible M-Pesa payment plans, and closes deals with Nyamakima-style ambition. Converts 25%+ of browsers into buyers.",
      href: "#features",
      cta: "Watch AI bargain live",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-transparent to-transparent opacity-50" />
      ),
      className: "lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-4",
    },
    {
      Icon: Search,
      name: "AI Customer Discovery",
      description: "Automatically finds customers through Google My Business, creates viral TikTok content, and dominates local SEO.",
      href: "#features",
      cta: "See how it finds customers",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-transparent to-transparent opacity-50" />
      ),
      className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2",
    },
    {
      Icon: Zap,
      name: "Lightning-Fast Response",
      description: "Responds in under 30 seconds on WhatsApp, Facebook, Instagram & TikTok. Instant quotes and conversations.",
      href: "#features",
      cta: "View response times",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 via-transparent to-transparent opacity-50" />
      ),
      className: "lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2",
    },
    {
      Icon: Brain,
      name: "Smart Lead Nurturing",
      description: "AI tracks abandoned carts, sends personalized follow-ups in 2 hours. Never lose a lead again!",
      href: "#features",
      cta: "See nurture sequences",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-transparent to-transparent opacity-50" />
      ),
      className: "lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-4",
    },
    {
      Icon: Globe,
      name: "Speaks Your Language",
      description: "Native support for English, Swahili, and Sheng. Understands local slang and communicates like a true local.",
      href: "#features",
      cta: "Try multilingual demo",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-transparent to-transparent opacity-50" />
      ),
      className: "lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-4",
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full bg-black/10 backdrop-blur-md z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">Aizalo</h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#how-it-works" className="text-white/80 hover:text-white transition">How it Works</a>
              <a href="#industries" className="text-white/80 hover:text-white transition">Industries</a>
              <a href="#features" className="text-white/80 hover:text-white transition">Features</a>
              <a href="#pricing" className="text-white/80 hover:text-white transition">Pricing</a>
              <Link href="/demo" className="text-white/80 hover:text-white transition">Demo</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="text-white/80 hover:text-white transition">Login</Link>
              <Link href="/onboarding" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {/* Hero Section with Animated Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-blue-900 to-indigo-900"></div>
        
        {/* Floating orbs animation */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 w-full">
          <Hero />
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 text-gray-900">
              The AI Customer <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Acquisition Machine</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We don't just answer questions - we FIND customers, NURTURE them, and CLOSE sales while you sleep
            </p>
          </div>

          <BentoGrid className="lg:grid-rows-3 max-w-7xl mx-auto">
            {bentoFeatures.map((feature) => (
              <BentoCard key={feature.name} {...feature} />
            ))}
          </BentoGrid>
        </div>
      </section>

      {/* Industries Section */}
      <IndustriesSection />

      {/* Success Stories */}
      <section className="py-20 bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Success Stories</h2>
            <p className="text-xl text-gray-300">Real results from real businesses</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-2xl mr-3">🔨</div>
                <div>
                  <h4 className="font-semibold">Mama Njeri Hardware</h4>
                  <p className="text-sm text-gray-300">Westlands, Nairobi</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4">"Our WhatsApp inquiries increased by 300% and we now handle quotes 24/7. Sales are up 45% in just 2 months!"</p>
              <div className="flex justify-between text-sm">
                <span className="text-green-400">+45% Revenue</span>
                <span className="text-blue-400">300% More Leads</span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-2xl mr-3">🏨</div>
                <div>
                  <h4 className="font-semibold">Serena Hotel</h4>
                  <p className="text-sm text-gray-300">CBD, Nairobi</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4">"The AI handles bookings perfectly. Our staff now focuses on guest experience instead of answering repetitive questions."</p>
              <div className="flex justify-between text-sm">
                <span className="text-green-400">80% Time Saved</span>
                <span className="text-blue-400">4.8★ Rating</span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-2xl mr-3">🏢</div>
                <div>
                  <h4 className="font-semibold">Kenya Homes</h4>
                  <p className="text-sm text-gray-300">Kilimani, Nairobi</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4">"Property viewings booked automatically, qualified leads only. Our agents close 2x more deals now."</p>
              <div className="flex justify-between text-sm">
                <span className="text-green-400">2x Conversions</span>
                <span className="text-blue-400">90% Qualified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
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

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Kenyan Businesses Choose Aizalo</h2>
            <p className="text-xl text-gray-600">Built specifically for the Kenyan market</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🇰🇪</span>
              </div>
              <h3 className="font-semibold mb-2">Local Understanding</h3>
              <p className="text-gray-600 text-sm">Handles Sheng, price haggling, and M-Pesa payments naturally</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="font-semibold mb-2">Instant Setup</h3>
              <p className="text-gray-600 text-sm">Go live in 15 minutes, no technical knowledge required</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="font-semibold mb-2">Affordable Pricing</h3>
              <p className="text-gray-600 text-sm">Starting at just KSH 2,500/month with no hidden fees</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="font-semibold mb-2">Local Support</h3>
              <p className="text-gray-600 text-sm">Kenyan team available on WhatsApp for instant help</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section with Gradient Background */}
      <section id="pricing" className="py-24 bg-gradient-to-b from-gray-900 to-black text-white relative overflow-hidden">
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

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2">Do I need technical skills to use Aizalo?</h3>
              <p className="text-gray-600">No! Our platform is designed for business owners, not techies. If you can use WhatsApp, you can use Aizalo.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2">Will the AI understand Kenyan customers?</h3>
              <p className="text-gray-600">Absolutely! Our AI is trained on Kenyan conversations, understands Sheng, handles price negotiations, and knows local context.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2">What happens if I need help?</h3>
              <p className="text-gray-600">Our Kenyan support team is available on WhatsApp. We'll help you set up, train your AI, and solve any issues - in Swahili or English!</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2">Can I try it before paying?</h3>
              <p className="text-gray-600">Yes! Start with our 14-day free trial. No credit card required. See real results before you commit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">
            Your Competitors Are Already Using AI
          </h2>
          <p className="text-xl mb-4">
            Don't let them steal your customers with faster responses
          </p>
          <p className="text-lg mb-8 opacity-90">
            🎯 Set up in 15 minutes • 🚀 See results in 24 hours • 💰 Money-back guarantee
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/onboarding" className="inline-block bg-white text-purple-600 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition transform hover:scale-105">
              Start Free 14-Day Trial
            </Link>
            <Link href="/demo" className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition">
              See Live Demo First
            </Link>
          </div>
          <p className="mt-6 text-sm opacity-75">
            No credit card required • Cancel anytime
          </p>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Aizalo</h3>
              <p className="text-gray-400">AI-powered customer engagement for Kenyan businesses</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-white">Demo</Link></li>
                <li><Link href="/integrations" className="hover:text-white">Integrations</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="https://wa.me/254712345678" className="hover:text-white">WhatsApp Support</a></li>
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Aizalo. Made with ❤️ in Nairobi, Kenya</p>
          </div>
        </div>
      </footer>
    </main>
  )
}