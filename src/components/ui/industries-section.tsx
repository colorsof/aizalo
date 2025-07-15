"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  Building2,
  Home,
  Car,
  Scissors,
  Stethoscope,
  Laptop,
  Scale,
  Hammer,
  Award,
  Users,
  TrendingUp,
  Globe,
  Sparkles,
  Star,
  ArrowRight,
  Zap,
  CheckCircle,
} from "lucide-react"
import { motion, useScroll, useTransform, useInView, useSpring } from "framer-motion"

export default function IndustriesSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 })
  const isStatsInView = useInView(statsRef, { once: false, amount: 0.3 })

  // Parallax effect for decorative elements
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 50])
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 20])
  const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -20])

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  }

  const industries = [
    {
      icon: <Building2 className="w-6 h-6" />,
      secondaryIcon: <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-purple-500" />,
      title: "Hotels & Restaurants",
      description:
        "AI that handles bookings 24/7, recommends dishes based on preferences, manages table reservations, and responds to reviews. Your digital concierge that never sleeps.",
      features: ["Instant room/table booking", "Dynamic pricing & deals", "Review management"],
      position: "left",
    },
    {
      icon: <Home className="w-6 h-6" />,
      secondaryIcon: <CheckCircle className="w-4 h-4 absolute -top-1 -right-1 text-purple-500" />,
      title: "Real Estate",
      description:
        "Property matching AI that understands buyer preferences, schedules viewings automatically, and qualifies leads. Close more deals with less effort.",
      features: ["Property matching AI", "Virtual tours & viewings", "Lead scoring & tracking"],
      position: "left",
    },
    {
      icon: <Car className="w-6 h-6" />,
      secondaryIcon: <Star className="w-4 h-4 absolute -top-1 -right-1 text-purple-500" />,
      title: "Car Dealerships",
      description:
        "Showcase inventory with 360° views, calculate financing instantly, and book test drives. Your AI salesperson knows every car's features by heart.",
      features: ["360° vehicle showcases", "Finance calculator", "Test drive booking"],
      position: "left",
    },
    {
      icon: <Scissors className="w-6 h-6" />,
      secondaryIcon: <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-purple-500" />,
      title: "Beauty & Spa",
      description:
        "Let clients book their favorite stylist, showcase portfolios, and manage loyalty programs. AI that understands beauty trends and client preferences.",
      features: ["Stylist portfolios", "Appointment optimization", "Loyalty programs"],
      position: "right",
    },
    {
      icon: <Stethoscope className="w-6 h-6" />,
      secondaryIcon: <CheckCircle className="w-4 h-4 absolute -top-1 -right-1 text-purple-500" />,
      title: "Medical & Dental",
      description:
        "Smart appointment scheduling, automated reminders, and insurance verification. HIPAA-compliant AI that respects patient privacy.",
      features: ["Smart reminders", "Slot optimization", "Insurance verification"],
      position: "right",
    },
    {
      icon: <Hammer className="w-6 h-6" />,
      secondaryIcon: <Star className="w-4 h-4 absolute -top-1 -right-1 text-orange-500" />,
      title: "Hardware Stores",
      description:
        "Gikomba-style bargaining meets AI! Handles multi-item quotations, tracks inventory, and negotiates bulk discounts. Built for the hustle.",
      features: ["Multi-item quotations", "Stock & price updates", "Bulk order discounts"],
      position: "right",
      isHot: true,
    },
  ]

  const stats = [
    { icon: <Award />, value: 500, label: "Businesses Automated", suffix: "+" },
    { icon: <Users />, value: 1000000, label: "Conversations Handled", suffix: "+" },
    { icon: <TrendingUp />, value: 98, label: "Customer Satisfaction", suffix: "%" },
    { icon: <Globe />, value: 47, label: "Counties Covered", suffix: "" },
  ]

  return (
    <section
      id="industries-section"
      ref={sectionRef}
      className="w-full py-24 px-4 bg-gradient-to-b from-gray-50 to-white text-gray-900 overflow-hidden relative"
    >
      {/* Decorative background elements */}
      <motion.div
        className="absolute top-20 left-10 w-64 h-64 rounded-full bg-purple-500/5 blur-3xl"
        style={{ y: y1, rotate: rotate1 }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-orange-500/5 blur-3xl"
        style={{ y: y2, rotate: rotate2 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/4 w-4 h-4 rounded-full bg-purple-500/30"
        animate={{
          y: [0, -15, 0],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-6 h-6 rounded-full bg-orange-500/30"
        animate={{
          y: [0, 20, 0],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <motion.div
        className="container mx-auto max-w-6xl relative z-10"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <motion.div className="flex flex-col items-center mb-6" variants={itemVariants}>
          <motion.span
            className="text-purple-600 font-medium mb-2 flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Zap className="w-4 h-4" />
            SPECIALIZED AI SOLUTIONS
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">Built for Your Industry</h2>
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-purple-600 to-pink-600"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 1, delay: 0.5 }}
          ></motion.div>
        </motion.div>

        <motion.p className="text-center max-w-2xl mx-auto mb-16 text-gray-600" variants={itemVariants}>
          From Westlands boardrooms to River Road shops, our AI understands your business. 
          Specialized solutions that speak your industry's language and know your customers' needs.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Left Column */}
          <div className="space-y-16">
            {industries
              .filter((industry) => industry.position === "left")
              .map((industry, index) => (
                <IndustryItem
                  key={`left-${index}`}
                  icon={industry.icon}
                  secondaryIcon={industry.secondaryIcon}
                  title={industry.title}
                  description={industry.description}
                  features={industry.features}
                  variants={itemVariants}
                  delay={index * 0.2}
                  direction="left"
                />
              ))}
          </div>

          {/* Center Image */}
          <div className="flex justify-center items-center order-first md:order-none mb-8 md:mb-0">
            <motion.div className="relative w-full max-w-xs" variants={itemVariants}>
              <motion.div
                className="rounded-xl overflow-hidden shadow-xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
              >
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-8 h-[500px] flex flex-col items-center justify-center text-white">
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  >
                    <Globe className="w-24 h-24 mb-6" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-4 text-center">AI That Understands Local Business</h3>
                  <p className="text-center text-white/90">From CBD to Industrial Area, we've got you covered</p>
                </div>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                >
                  <motion.button
                    className="bg-white text-gray-900 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    See All Industries <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              </motion.div>
              <motion.div
                className="absolute inset-0 border-4 border-purple-200 rounded-xl -m-3 z-[-1]"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              ></motion.div>

              {/* Floating accent elements */}
              <motion.div
                className="absolute -top-4 -right-8 w-16 h-16 rounded-full bg-purple-500/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.9 }}
                style={{ y: y1 }}
              ></motion.div>
              <motion.div
                className="absolute -bottom-6 -left-10 w-20 h-20 rounded-full bg-orange-500/15"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.1 }}
                style={{ y: y2 }}
              ></motion.div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-16">
            {industries
              .filter((industry) => industry.position === "right")
              .map((industry, index) => (
                <IndustryItem
                  key={`right-${index}`}
                  icon={industry.icon}
                  secondaryIcon={industry.secondaryIcon}
                  title={industry.title}
                  description={industry.description}
                  features={industry.features}
                  variants={itemVariants}
                  delay={index * 0.2}
                  direction="right"
                  isHot={industry.isHot}
                />
              ))}
          </div>
        </div>

        {/* Stats Section */}
        <motion.div
          ref={statsRef}
          className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          animate={isStatsInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {stats.map((stat, index) => (
            <StatCounter
              key={index}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              suffix={stat.suffix}
              delay={index * 0.1}
            />
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="mt-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={isStatsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex-1">
            <h3 className="text-2xl font-medium mb-2">Ready to transform your business?</h3>
            <p className="text-white/90">Join 500+ businesses already using AI to grow faster.</p>
          </div>
          <motion.button
            className="bg-white text-purple-600 px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors hover:bg-gray-100"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  )
}

interface IndustryItemProps {
  icon: React.ReactNode
  secondaryIcon?: React.ReactNode
  title: string
  description: string
  features: string[]
  variants: any
  delay: number
  direction: "left" | "right"
  isHot?: boolean
}

function IndustryItem({ icon, secondaryIcon, title, description, features, variants, delay, direction, isHot }: IndustryItemProps) {
  return (
    <motion.div
      className="flex flex-col group relative"
      variants={variants}
      transition={{ delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      {isHot && (
        <motion.div
          className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          🔥 Hot Market
        </motion.div>
      )}
      <motion.div
        className="flex items-center gap-3 mb-3"
        initial={{ x: direction === "left" ? -20 : 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: delay + 0.2 }}
      >
        <motion.div
          className={`text-purple-600 bg-purple-100 p-3 rounded-lg transition-colors duration-300 group-hover:bg-purple-200 relative ${
            isHot ? 'ring-2 ring-orange-500' : ''
          }`}
          whileHover={{ rotate: [0, -10, 10, -5, 0], transition: { duration: 0.5 } }}
        >
          {icon}
          {secondaryIcon}
        </motion.div>
        <h3 className="text-xl font-medium text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
          {title}
        </h3>
      </motion.div>
      <motion.p
        className="text-sm text-gray-600 leading-relaxed pl-12 mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: delay + 0.4 }}
      >
        {description}
      </motion.p>
      <motion.ul
        className="pl-12 space-y-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: delay + 0.5 }}
      >
        {features.map((feature, index) => (
          <li key={index} className="text-xs text-gray-500 flex items-center gap-2">
            <span className="text-purple-600">•</span>
            {feature}
          </li>
        ))}
      </motion.ul>
      <motion.div
        className="mt-3 pl-12 flex items-center text-purple-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
      >
        <span className="flex items-center gap-1">
          Learn more <ArrowRight className="w-3 h-3" />
        </span>
      </motion.div>
    </motion.div>
  )
}

interface StatCounterProps {
  icon: React.ReactNode
  value: number
  label: string
  suffix: string
  delay: number
}

function StatCounter({ icon, value, label, suffix, delay }: StatCounterProps) {
  const countRef = useRef(null)
  const isInView = useInView(countRef, { once: false })
  const [hasAnimated, setHasAnimated] = useState(false)

  const springValue = useSpring(0, {
    stiffness: 50,
    damping: 10,
  })

  useEffect(() => {
    if (isInView && !hasAnimated) {
      springValue.set(value)
      setHasAnimated(true)
    } else if (!isInView && hasAnimated) {
      springValue.set(0)
      setHasAnimated(false)
    }
  }, [isInView, value, springValue, hasAnimated])

  const displayValue = useTransform(springValue, (latest) => Math.floor(latest))

  return (
    <motion.div
      className="bg-white/50 backdrop-blur-sm p-6 rounded-xl flex flex-col items-center text-center group hover:bg-white transition-colors duration-300 border border-gray-100"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, delay },
        },
      }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <motion.div
        className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-4 text-purple-600 group-hover:bg-purple-200 transition-colors duration-300"
        whileHover={{ rotate: 360, transition: { duration: 0.8 } }}
      >
        {icon}
      </motion.div>
      <motion.div ref={countRef} className="text-3xl font-bold text-gray-900 flex items-center">
        <motion.span>{displayValue}</motion.span>
        <span>{suffix}</span>
      </motion.div>
      <p className="text-gray-600 text-sm mt-1">{label}</p>
      <motion.div className="w-10 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 mt-3 group-hover:w-16 transition-all duration-300" />
    </motion.div>
  )
}