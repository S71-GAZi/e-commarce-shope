// Database utility functions
// These will work with real database when connected, or use mock data for now

import { mockProducts, mockCategories, mockBanners } from "./mock-data"
import type { Product, Category, Banner } from "./types/database"

// Flag to determine if using mock data (set to false when database is connected)
const USE_MOCK_DATA = true

export async function getProducts(filters?: {
  category?: string
  search?: string
  featured?: boolean
  limit?: number
  offset?: number
}): Promise<Product[]> {
  if (USE_MOCK_DATA) {
    let products = [...mockProducts]

    if (filters?.category) {
      products = products.filter((p) => p.category_id === filters.category)
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase()
      products = products.filter(
        (p) => p.name.toLowerCase().includes(search) || p.description?.toLowerCase().includes(search),
      )
    }

    if (filters?.featured) {
      products = products.filter((p) => p.is_featured)
    }

    if (filters?.limit) {
      products = products.slice(filters.offset || 0, (filters.offset || 0) + filters.limit)
    }

    return products
  }

  // TODO: Replace with actual database query when connected
  // Example with Supabase:
  // const { data } = await supabase
  //   .from('products')
  //   .select('*, category(*), images(*)')
  //   .eq('is_active', true)

  return []
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (USE_MOCK_DATA) {
    return mockProducts.find((p) => p.slug === slug) || null
  }

  // TODO: Replace with actual database query
  return null
}

export async function getCategories(): Promise<Category[]> {
  if (USE_MOCK_DATA) {
    return mockCategories
  }

  // TODO: Replace with actual database query
  return []
}

export async function getBanners(): Promise<Banner[]> {
  if (USE_MOCK_DATA) {
    return mockBanners.filter((b) => b.is_active)
  }

  // TODO: Replace with actual database query
  return []
}

export async function searchProducts(query: string): Promise<Product[]> {
  return getProducts({ search: query })
}
