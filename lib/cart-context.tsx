"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { IProduct, IProductVariant } from "./types/database"
import { useToast } from "@/hooks/use-toast"

interface CartItem {
  product: IProduct
  variant?: IProductVariant
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  itemCount: number
  subtotal: number
  addItem: (product: IProduct, variant?: IProductVariant, quantity?: number) => void
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const { toast } = useToast()

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("shopping_cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Failed to load cart:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("shopping_cart", JSON.stringify(items))
  }, [items])

  const addItem = (product: IProduct, variant?: IProductVariant, quantity = 1) => {
    setItems((currentItems) => {
      const existingItemIndex = currentItems.findIndex(
        (item) => item.product.id === product.id && item.variant?.id === variant?.id,
      )

      if (existingItemIndex > -1) {
        const newItems = [...currentItems]
        newItems[existingItemIndex].quantity += quantity
        return newItems
      }

      return [...currentItems, { product, variant, quantity }]
    })

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const removeItem = (productId: string, variantId?: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => !(item.product.id === productId && item.variant?.id === variantId)),
    )

    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart.",
    })
  }

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeItem(productId, variantId)
      return
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId && item.variant?.id === variantId ? { ...item, quantity } : item,
      ),
    )
  }

  const clearCart = () => {
    setItems([])
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    })
  }

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const subtotal = items.reduce((total, item) => {
    const price = item.variant?.price || item.product.price
    return total + price * item.quantity
  }, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
