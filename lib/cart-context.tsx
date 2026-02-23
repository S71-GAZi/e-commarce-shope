"use client"

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react"
import type { ICartItem, IProduct, IProductVariant } from "./types/intrerface"
import { useToast } from "@/hooks/use-toast"
import { useFetchResource } from "@/hooks/useFetchResource"

interface CartContextType {
  items: ICartItem[]
  itemCount: number
  subtotal: number
  addItem: (product: IProduct, variant?: IProductVariant, quantity?: number) => void
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()

  /* ================= FETCH CART ================= */
  const {
    data: items,
    isLoading,
    fetchData: fetchCart,
  } = useFetchResource<ICartItem>({
    url: "/api/cart",
    extractData: (result) =>
      Array.isArray(result)
        ? result
        : Array.isArray(result?.data?.items)
          ? result?.data.items :
          [],
  })

  useEffect(() => {
    fetchCart()
  }, [fetchCart])
  /* ================= ADD ITEM ================= */
  const addItem = useCallback(
    async (product: IProduct, variant?: IProductVariant, quantity = 1) => {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: product.id, variant_id: variant?.id, quantity }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || "Failed to add item")

        fetchCart()

        toast({ title: "Added to cart", description: `${product.name} added.` })
      } catch (err: any) {
        toast({ title: "Error", description: err.message || "Failed to add item", variant: "destructive" })
      }
    },
    [items, toast]
  )

  /* ================= REMOVE ITEM ================= */
  const removeItem = useCallback(
    async (productId: string, variantId?: string) => {
      try {
        const item = items.find((i) => i.product_id === productId && i.variant?.id === variantId)
        if (!item) return

        const res = await fetch(`/api/cart/${item.id}`, { method: "DELETE" })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "Failed to remove item")

        fetchCart()
      } catch (err: any) {
        toast({ title: "Error", description: err.message || "Failed to remove item", variant: "destructive" })
      }
    },
    [items, toast]
  )

  /* ================= UPDATE QUANTITY ================= */
  const updateQuantity = useCallback(
    async (productId: string, quantity: number, variantId?: string) => {
      try {
        const item = items.find((i) => i.product_id === productId && i.variant?.id === variantId)
        if (!item) return

        const res = await fetch(`/api/cart/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "Failed to update quantity")

        fetchCart()
      } catch (err: any) {
        toast({ title: "Error", description: err.message || "Failed to update quantity", variant: "destructive" })
      }
    },
    [items, toast]
  )

  /* ================= CLEAR CART ================= */
  const clearCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart", { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to clear cart")

      fetchCart()
      toast({ title: "Cart cleared", description: "All items have been removed from your cart." })
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to clear cart", variant: "destructive" })
    }
  }, [toast])

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const subtotal = items.reduce((total, item) => total + item.price_snapshot * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, itemCount, subtotal, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}