"use client"
export const dynamic = "force-dynamic"

import { useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

interface Props {
  images: string[]
  productName: string
  discount: number
}

export default function ProductImageGallery({
  images,
  productName,
  discount,
}: Props) {
  const [selectedImage, setSelectedImage] = useState(
    images.length > 0 ? images[0] : "/placeholder.svg"
  )

  return (
    <div className="space-y-4">
      {/* 🔵 Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        <Image
          src={selectedImage}
          alt={productName}
          fill
          className="object-cover"
          priority
        />

        {discount > 0 && (
          <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground text-lg">
            -{discount}%
          </Badge>
        )}
      </div>

      {/* 🟢 Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto">
          {images.map((img, index) => (
            <div
              key={index}
              onClick={() => setSelectedImage(img)}
              className={`relative w-20 h-20 rounded-md overflow-hidden cursor-pointer border-2 transition-all
                ${selectedImage === img ? "border-primary" : "border-transparent"}
              `}
            >
              <Image
                src={img}
                alt={`${productName}-${index}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}