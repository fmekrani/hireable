"use client"

import { useState } from "react"
import VaporizeSplash from "@/components/intro/vaporize-splash"
import { EtherealBeamsHero } from "@/components/ui/ethereal-beams-hero"

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <main className="relative min-h-screen bg-black overflow-hidden">
      {showSplash && (
        <VaporizeSplash 
          onComplete={() => setShowSplash(false)}
          duration={6}
        />
      )}
      <EtherealBeamsHero />
    </main>
  )
}
