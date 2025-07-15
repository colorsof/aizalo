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
              🚀 Built for Kenyan SMEs <MoveRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-3xl tracking-tighter text-center font-regular">
              <span className="text-white">AI That </span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
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
              <br />
              <span className="text-white">Your Business</span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-gray-200 max-w-3xl text-center">
              Unleash unlimited potential with AI assistants that understand your customers, 
              speak their language, and work tirelessly to grow your business.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <Link href="/demo">
              <Button size="lg" className="gap-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white">
                Try Live Demo <PhoneCall className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/onboarding">
              <Button size="lg" className="gap-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white border-0">
                Get Started Free <MoveRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };