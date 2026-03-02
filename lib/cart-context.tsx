"use client"

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react"
import type { IAddToCartParams, IBuyBowCartItem, ICartItem, IProduct, IProductVariant } from "./types/intrerface"
import { useToast } from "@/hooks/use-toast"
import { useFetchResource } from "@/hooks/useFetchResource"
import { useAuth } from "./auth-context"



interface CartContextType {
  items: ICartItem[]
  buyNowItem: IBuyBowCartItem | null
  itemCount: number
  subtotal: number
  isLoading: boolean
  addItem: (params: IAddToCartParams) => void
  buyNow: (params: IAddToCartParams & {
    note?: string
    sampleImage?: File | null
  }) => Promise<void>
  clearBuyNow: () => void
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [localItems, setLocalItems] = useState<ICartItem[]>([])
  const [buyNowItems, setBuyNowItems] = useState<ICartItem | null>(null)


  /* ================= Local cart ================= */

  const LOCAL_CART_KEY = "guest_cart"

  function getLocalCart(): ICartItem[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(LOCAL_CART_KEY)
    return data ? JSON.parse(data) : []
  }

  function setLocalCart(items: ICartItem[]) {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items))
  }

  function clearLocalCart() {
    localStorage.removeItem(LOCAL_CART_KEY)
  }


  /* ================= BUY NOW CART ================= */

  const BUY_NOW_KEY = "direct_buy_item"

  function getBuyNow(): ICartItem | null {
    if (typeof window === "undefined") return null
    const data = localStorage.getItem(BUY_NOW_KEY)
    return data ? JSON.parse(data) : null
  }

  function setBuyNow(item: ICartItem) {
    localStorage.setItem(BUY_NOW_KEY, JSON.stringify(item))
    setBuyNowItems(item)
  }

  function clearBuyNow() {
    localStorage.removeItem(BUY_NOW_KEY)
    setBuyNowItems(null)
  }
  useEffect(() => {
    setBuyNowItems(getBuyNow())
  }, [])

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const buyNow = useCallback(
    async ({
      product,
      variant,
      quantity = 1,
      selectedSize,
      productCode,
      note,
      sampleImage,
    }: IAddToCartParams & {
      note?: string
      sampleImage?: File | null
    }) => {

      let base64Image: string | null = null

      if (sampleImage) {
        base64Image = await fileToBase64(sampleImage)
      }

      const item: IBuyBowCartItem = {
        id: crypto.randomUUID(),
        product_id: product.id,
        variant,
        quantity,
        price_snapshot: variant?.price || product.price,
        name: product.name,
        slug: product.slug,
        selected_size: selectedSize,
        product_code: productCode,
        note: note || "",
        sample_image: base64Image,
        images: product.images,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as IBuyBowCartItem

      setBuyNow(item)
    },
    []
  )
  /* ================= FETCH CART ================= */
  const {
    data: serverItems,
    isLoading,
    fetchData: fetchCart,
  } = useFetchResource<ICartItem>({
    url: "/api/cart",
    extractData: (result) =>
      Array.isArray(result)
        ? result
        : Array.isArray(result?.data?.items)
          ? result?.data.items
          : [],
    autoFetch: isAuthenticated,
  })

  const activeItems = isAuthenticated ? serverItems : localItems

  useEffect(() => {
    if (!isAuthenticated) {
      setLocalItems(getLocalCart())
    }
  }, [isAuthenticated])



  useEffect(() => {
    if (!isAuthenticated) return

    const guestCart = getLocalCart()
    if (guestCart.length === 0) return

    const mergeCart = async () => {
      for (const item of guestCart) {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: item.product_id,
            variant_id: item.variant?.id,
            quantity: item.quantity,
          }),
        })
      }

      clearLocalCart()
      fetchCart()
    }

    mergeCart()
  }, [isAuthenticated, fetchCart])

  /* ================= ADD ITEM ================= */
  const addItem = useCallback(
    async ({ product, variant, quantity = 1, selectedSize, productCode }: IAddToCartParams) => {
      if (!isAuthenticated) {
        const cart = getLocalCart()

        const existing = cart.find(
          (i) =>
            i.product_id === product.id &&
            i.variant?.id === variant?.id
        )

        if (existing) {
          existing.quantity += quantity
        } else {
          cart.push({
            id: crypto.randomUUID(),
            product_id: product.id,
            variant,
            quantity,
            price_snapshot: variant?.price || product.price,
            name: product.name,
            slug: product.slug,
            selected_size: selectedSize,
            product_code: productCode,
            images: product.images,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as ICartItem)
        }

        setLocalCart(cart)
        setLocalItems(cart)

        toast({ title: "Added to cart", description: `${product.name} added.` })
        return
      }
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
    [isAuthenticated, fetchCart, toast]
  )

  /* ================= REMOVE ITEM ================= */
  const removeItem = useCallback(
    async (productId: string, variantId?: string) => {

      /* ================= GUEST MODE ================= */
      if (!isAuthenticated) {
        const updatedCart = localItems.filter(
          (item) =>
            !(
              item.product_id === productId &&
              item.variant?.id === variantId
            )
        )

        setLocalCart(updatedCart)
        setLocalItems(updatedCart)

        toast({
          title: "Removed",
          description: "Item removed from cart.",
        })

        return
      }

      /* ================= AUTH MODE ================= */
      try {
        const item = activeItems.find(
          (i) =>
            i.product_id === productId &&
            i.variant?.id === variantId
        )

        if (!item) return

        const res = await fetch(`/api/cart/${item.id}`, {
          method: "DELETE",
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "Failed to remove item")

        fetchCart()
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Failed to remove item",
          variant: "destructive",
        })
      }
    },
    [isAuthenticated, activeItems, localItems, fetchCart, toast]
  )

  /* ================= UPDATE QUANTITY ================= */
  const updateQuantity = useCallback(
    async (productId: string, quantity: number, variantId?: string) => {

      if (quantity <= 0) return

      /* ================= GUEST MODE ================= */
      if (!isAuthenticated) {
        const updatedCart = localItems.map((item) => {
          if (
            item.product_id === productId &&
            item.variant?.id === variantId
          ) {
            return {
              ...item,
              quantity,
              updated_at: new Date().toISOString(),
            }
          }
          return item
        })

        setLocalCart(updatedCart)
        setLocalItems(updatedCart)

        return
      }

      /* ================= AUTH MODE ================= */
      try {
        const item = activeItems.find(
          (i) =>
            i.product_id === productId &&
            i.variant?.id === variantId
        )

        if (!item) return

        const res = await fetch(`/api/cart/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        })

        const data = await res.json()
        if (!res.ok)
          throw new Error(data.message || "Failed to update quantity")

        fetchCart()
      } catch (err: any) {
        toast({
          title: "Error",
          description:
            err.message || "Failed to update quantity",
          variant: "destructive",
        })
      }
    },
    [isAuthenticated, activeItems, localItems, fetchCart, toast]
  )

  /* ================= CLEAR CART ================= */
  const clearCart = useCallback(async () => {

    /* ================= GUEST MODE ================= */
    if (!isAuthenticated) {
      clearLocalCart()
      setLocalItems([])

      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      })

      return
    }

    /* ================= AUTH MODE ================= */
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
      })

      const data = await res.json()
      if (!res.ok)
        throw new Error(data.message || "Failed to clear cart")

      fetchCart()

      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to clear cart",
        variant: "destructive",
      })
    }
  }, [isAuthenticated, fetchCart, toast])

  const itemCount = activeItems.reduce(
    (total, item) => total + item.quantity,
    0
  )

  const subtotal = activeItems.reduce(
    (total, item) => total + item.price_snapshot * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items: activeItems,
        buyNowItem: buyNowItems,
        itemCount,
        subtotal,
        isLoading,
        addItem,
        buyNow,
        clearBuyNow,
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
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}