"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Heart } from "lucide-react"
import type { IProduct } from "@/lib/types/database"
import { useCart } from "@/lib/cart-context"

interface IProductCardProps {
  product: IProduct
}

export function ProductCard({ product }: IProductCardProps) {
  const { addItem } = useCart()

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product)
  }

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.images?.[0]?.image_url || "/placeholder.svg?height=400&width=400"}
            alt={product.images?.[0]?.alt_text || product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {discount > 0 && (
            <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground">-{discount}%</Badge>
          )}
          {product.is_featured && <Badge className="absolute top-2 left-2 bg-primary">Featured</Badge>}
          {product.stock_quantity <= 0 && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="secondary" className="text-lg">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.short_description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.short_description}</p>
        )}

        <div className="flex items-center gap-1 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.floor(product.average_rating || 0)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-muted text-muted"
                  }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">({product.review_count || 0})</span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
          {product.compare_at_price && (
            <span className="text-sm text-muted-foreground line-through">${product.compare_at_price.toFixed(2)}</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button className="flex-1" disabled={product.stock_quantity <= 0} onClick={handleAddToCart}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
        <Button variant="outline" size="icon">
          <Heart className="h-4 w-4" />
          <span className="sr-only">Add to wishlist</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
