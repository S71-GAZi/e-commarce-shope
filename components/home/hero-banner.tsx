"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { IBanner } from "@/lib/types/database"

interface HeroBannerProps {
  banners: IBanner[]
}

export function HeroBanner({ banners }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (banners.length <= 1) return

    const interval = setInterval(() => {
      console.log("Auto-advancing banner running..." );
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [banners.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  if (banners.length === 0) return null

  const currentBanner = banners[currentIndex]

  return (
    <div className="relative w-full aspect-[21/9] md:aspect-[21/6] overflow-hidden rounded-lg bg-muted">
      <Image
        src={currentBanner.image_url || "/placeholder.svg"}
        alt={currentBanner.title}
        fill
        className="object-cover"
        priority
      />

      <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent">
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="max-w-xl space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-balance">{currentBanner.title}</h1>
            {currentBanner.description && (
              <p className="text-lg md:text-xl text-muted-foreground">{currentBanner.description}</p>
            )}
            {currentBanner.link_url && (
              <Button asChild size="lg">
                <Link href={currentBanner.link_url}>Shop Now</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Previous banner</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Next banner</span>
          </Button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all ${index === currentIndex ? "w-8 bg-primary" : "w-2 bg-background/50"
                  }`}
                onClick={() => setCurrentIndex(index)}
              >
                <span className="sr-only">Go to banner {index + 1}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
