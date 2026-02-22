"use client"

import { useCallback, useState } from "react"
import { apiClient } from "./client"
import { useToast } from "@/hooks/use-toast"

// Auth hooks
export function useAuth() {
  const { toast } = useToast()

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response: any = await apiClient.post("/api/auth/login", { email, password })
        if (response.success) {
          apiClient.setToken(response.data.token)
          return { success: true, user: response.data.user }
        }
        toast({ title: "Error", description: response.error, variant: "destructive" })
        return { success: false, error: response.error }
      } catch (error: any) {
        const message = error.message || "Login failed"
        toast({ title: "Error", description: message, variant: "destructive" })
        return { success: false, error: message }
      }
    },
    [toast],
  )

  const register = useCallback(
    async (email: string, password: string, fullName: string) => {
      try {
        const response: any = await apiClient.post("/api/auth/register", { email, password, full_name: fullName })
        if (response.success) {
          apiClient.setToken(response.data.token)
          return { success: true, user: response.data.user }
        }
        toast({ title: "Error", description: response.error, variant: "destructive" })
        return { success: false, error: response.error }
      } catch (error: any) {
        const message = error.message || "Registration failed"
        toast({ title: "Error", description: message, variant: "destructive" })
        return { success: false, error: message }
      }
    },
    [toast],
  )

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/api/auth/logout", {})
      apiClient.setToken(null)
      return { success: true }
    } catch (error: any) {
      const message = error.message || "Logout failed"
      toast({ title: "Error", description: message, variant: "destructive" })
      return { success: false, error: message }
    }
  }, [toast])

  return { login, register, logout }
}

// Product hooks
export function useProducts() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const getProducts = useCallback(
    async (filters?: { category?: string; search?: string; page?: number; limit?: number }) => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (filters?.category) params.append("category", filters.category)
        if (filters?.search) params.append("search", filters.search)
        if (filters?.page) params.append("page", filters.page.toString())
        if (filters?.limit) params.append("limit", filters.limit.toString())

        const response: any = await apiClient.get(`/api/products?${params.toString()}`)
        setLoading(false)
        if (response.success) return { success: true, data: response.data }
        toast({ title: "Error", description: response.error, variant: "destructive" })
        return { success: false, error: response.error }
      } catch (error: any) {
        setLoading(false)
        const message = error.message || "Failed to fetch products"
        toast({ title: "Error", description: message, variant: "destructive" })
        return { success: false, error: message }
      }
    },
    [toast],
  )

  const getProduct = useCallback(
    async (id: string) => {
      try {
        const response: any = await apiClient.get(`/api/products/${id}`)
        if (response.success) return { success: true, data: response.data }
        toast({ title: "Error", description: response.error, variant: "destructive" })
        return { success: false, error: response.error }
      } catch (error: any) {
        const message = error.message || "Failed to fetch product"
        toast({ title: "Error", description: message, variant: "destructive" })
        return { success: false, error: message }
      }
    },
    [toast],
  )

  const createProduct = useCallback(
    async (productData: any) => {
      try {
        const response: any = await apiClient.post("/api/products", productData)
        if (response.success) {
          toast({ title: "Success", description: "Product created successfully" })
          return { success: true, data: response.data }
        }
        toast({ title: "Error", description: response.error, variant: "destructive" })
        return { success: false, error: response.error }
      } catch (error: any) {
        const message = error.message || "Failed to create product"
        toast({ title: "Error", description: message, variant: "destructive" })
        return { success: false, error: message }
      }
    },
    [toast],
  )

  const updateProduct = useCallback(
    async (id: string, productData: any) => {
      try {
        const response: any = await apiClient.patch(`/api/products/${id}`, productData)
        if (response.success) {
          toast({ title: "Success", description: "Product updated successfully" })
          return { success: true, data: response.data }
        }
        toast({ title: "Error", description: response.error, variant: "destructive" })
        return { success: false, error: response.error }
      } catch (error: any) {
        const message = error.message || "Failed to update product"
        toast({ title: "Error", description: message, variant: "destructive" })
        return { success: false, error: message }
      }
    },
    [toast],
  )

  const deleteProduct = useCallback(
    async (id: string) => {
      try {
        const response: any = await apiClient.delete(`/api/products/${id}`)
        if (response.success) {
          toast({ title: "Success", description: "Product deleted successfully" })
          return { success: true }
        }
        toast({ title: "Error", description: response.error, variant: "destructive" })
        return { success: false, error: response.error }
      } catch (error: any) {
        const message = error.message || "Failed to delete product"
        toast({ title: "Error", description: message, variant: "destructive" })
        return { success: false, error: message }
      }
    },
    [toast],
  )

  return { getProducts, getProduct, createProduct, updateProduct, deleteProduct, loading }
}

// Order hooks
export function useOrders() {
  const { toast } = useToast()

  const getOrders = useCallback(async () => {
    try {
      const response: any = await apiClient.get("/api/orders")
      if (response.success) return { success: true, data: response.data }
      toast({ title: "Error", description: response.error, variant: "destructive" })
      return { success: false, error: response.error }
    } catch (error: any) {
      const message = error.message || "Failed to fetch orders"
      toast({ title: "Error", description: message, variant: "destructive" })
      return { success: false, error: message }
    }
  }, [toast])

  const getOrder = useCallback(
    async (id: string) => {
      try {
        const response: any = await apiClient.get(`/api/orders/${id}`)
        if (response.success) return { success: true, data: response.data }
        toast({ title: "Error", description: response.error, variant: "destructive" })
        return { success: false, error: response.error }
      } catch (error: any) {
        const message = error.message || "Failed to fetch order"
        toast({ title: "Error", description: message, variant: "destructive" })
        return { success: false, error: message }
      }
    },
    [toast],
  )

  const createOrder = useCallback(
    async (orderData: any) => {
      try {
        const response: any = await apiClient.post("/api/orders", orderData)
        if (response.success) {
          toast({ title: "Success", description: "Order created successfully" })
          return { success: true, data: response.data }
        }
        toast({ title: "Error", description: response.error, variant: "destructive" })
        return { success: false, error: response.error }
      } catch (error: any) {
        const message = error.message || "Failed to create order"
        toast({ title: "Error", description: message, variant: "destructive" })
        return { success: false, error: message }
      }
    },
    [toast],
  )

  const updateOrderStatus = useCallback(
    async (id: string, status: string, trackingNumber?: string) => {
      try {
        const response: any = await apiClient.patch(`/api/orders/${id}`, { status, tracking_number: trackingNumber })
        if (response.success) {
          toast({ title: "Success", description: "Order updated successfully" })
          return { success: true, data: response.data }
        }
        toast({ title: "Error", description: response.error, variant: "destructive" })
        return { success: false, error: response.error }
      } catch (error: any) {
        const message = error.message || "Failed to update order"
        toast({ title: "Error", description: message, variant: "destructive" })
        return { success: false, error: message }
      }
    },
    [toast],
  )

  return { getOrders, getOrder, createOrder, updateOrderStatus }
}

// Cart hooks
export function useShoppingCart() {
  const { toast } = useToast()

  const getCart = useCallback(async () => {
    try {
      const response: any = await apiClient.get("/api/cart")
      if (response.success) return { success: true, data: response.data }
      return { success: false, error: response.error }
    } catch (error) {
      return { success: false, error: "Failed to fetch cart" }
    }
  }, [])

  const addToCart = useCallback(
    async (productId: string, quantity: number, variantId?: string) => {
      try {
        const response: any = await apiClient.post("/api/cart", { product_id: productId, quantity, variant_id: variantId })
        if (response.success) {
          toast({ title: "Success", description: "Item added to cart" })
          return { success: true, data: response.data }
        }
        toast({ title: "Error", description: response.error, variant: "destructive" })
        return { success: false, error: response.error }
      } catch (error: any) {
        const message = error.message || "Failed to add to cart"
        toast({ title: "Error", description: message, variant: "destructive" })
        return { success: false, error: message }
      }
    },
    [toast],
  )

  const removeFromCart = useCallback(
    async (itemId: string) => {
      try {
        const response: any = await apiClient.delete(`/api/cart/${itemId}`)
        if (response.success) {
          toast({ title: "Success", description: "Item removed from cart" })
          return { success: true }
        }
        toast({ title: "Error", description: response.error, variant: "destructive" })
        return { success: false, error: response.error }
      } catch (error: any) {
        const message = error.message || "Failed to remove item"
        toast({ title: "Error", description: message, variant: "destructive" })
        return { success: false, error: message }
      }
    },
    [toast],
  )

  const clearCart = useCallback(async () => {
    try {
      const response: any = await apiClient.delete("/api/cart")
      if (response.success) {
        toast({ title: "Success", description: "Cart cleared" })
        return { success: true }
      }
      toast({ title: "Error", description: response.error, variant: "destructive" })
      return { success: false, error: response.error }
    } catch (error: any) {
      const message = error.message || "Failed to clear cart"
      toast({ title: "Error", description: message, variant: "destructive" })
      return { success: false, error: message }
    }
  }, [toast])

  return { getCart, addToCart, removeFromCart, clearCart }
}
