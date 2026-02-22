"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart()

  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.1
  const total = subtotal + shipping + tax

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center space-y-6">
            <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground" />
            <h1 className="text-3xl font-bold">Your cart is empty</h1>
            <p className="text-muted-foreground">Add some products to get started!</p>
            <Button asChild size="lg">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const price = item.variant?.price || item.product.price
              const itemTotal = price * item.quantity

              return (
                <Card key={`${item.product.id}-${item.variant?.id || "default"}`}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={item.product.images?.[0]?.image_url || "/placeholder.svg?height=96&width=96"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.product.slug}`} className="hover:text-primary">
                          <h3 className="font-semibold mb-1 line-clamp-2">{item.product.name}</h3>
                        </Link>
                        {item.variant && <p className="text-sm text-muted-foreground mb-2">{item.variant.name}</p>}
                        <p className="font-bold text-lg">${price.toFixed(2)}</p>
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.product.id, item.variant?.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove item</span>
                        </Button>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)}
                          >
                            <Minus className="h-3 w-3" />
                            <span className="sr-only">Decrease quantity</span>
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.product.id, Number.parseInt(e.target.value) || 1, item.variant?.id)
                            }
                            className="w-16 h-8 text-center"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)}
                          >
                            <Plus className="h-3 w-3" />
                            <span className="sr-only">Increase quantity</span>
                          </Button>
                        </div>

                        <p className="font-semibold">${itemTotal.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" onClick={clearCart}>
                Clear Cart
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-bold">Order Summary</h2>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                {subtotal < 50 && (
                  <p className="text-sm text-muted-foreground">
                    Add ${(50 - subtotal).toFixed(2)} more to get free shipping!
                  </p>
                )}

                <Button asChild size="lg" className="w-full">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>

                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
