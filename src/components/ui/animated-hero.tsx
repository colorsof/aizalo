'use client'

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => [
      "Biashara-fies",      // Business + -fies (makes business-like)
      "Pesa-plies",         // Money + multiplies
      "Duka-mates",         // Shop + automates
      "Mteja-nizes",        // Customer + organizes
      "Soko-lates",         // Market + accelerates
      "Uza-boosts",         // Sell + boosts
      "Chapa-grows",        // Work/hustle + grows
      "Faida-mizes",        // Profit + maximizes
      "Kibiashara-fies",    // Business-like + -fies
      "Ongeza-rates"        // Increase + accelerates
    ],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div>
            <Button variant="secondary" size="sm" className="gap-4 bg-white/10 hover:bg-white/20 border-white/20 text-white">
              🚀 Built for Koinange Street to Kibera <MoveRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-3xl tracking-tighter text-center font-regular">
              <span className="text-white">AI That </span>
              <span className="relative inline-flex justify-center overflow-hidden text-center">
                <span className="invisible">Kibiashara-fies</span>
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
              <span className="text-white"> Your Business</span>
            </h1>
            
            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-3xl text-center text-gray-300">
              Unleash unlimited potential with AI assistants that understand your customers, speak their language, and work tirelessly to grow your business.
            </p>
          </div>
          
          <div className="flex flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
                Try Live Demo <PhoneCall className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="gap-4 bg-white/10 hover:bg-white/20 border-white/20 text-white">
                See How It Works <MoveRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="flex flex-col items-center">
              <h3 className="text-3xl font-bold text-white mb-2">500+</h3>
              <p className="text-gray-300">Businesses Automated</p>
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-3xl font-bold text-white mb-2">1M+</h3>
              <p className="text-gray-300">Conversations Handled</p>
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-3xl font-bold text-white mb-2">98%</h3>
              <p className="text-gray-300">Customer Satisfaction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };