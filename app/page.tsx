"use client"

import { Suspense } from "react"
import { EtherealBeamsHero } from "@/components/ui/ethereal-beams-hero"
import HowItWorks from "@/components/ui/how-it-works"
import ProductFeatures from "@/components/ui/product-features"

export default function HomePage() {
  return (
    <main className="relative bg-black overflow-hidden">
      <Suspense fallback={null}>
        <EtherealBeamsHero />
      </Suspense>
      <HowItWorks />
      <ProductFeatures />
    </main>
  )
}
