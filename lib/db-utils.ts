// Database utility functions
// These will work with real database when connected, or use mock data for now

import { executeQuery } from "./db/mysql"
import { productQueries } from "./db/queries"
import { mockProducts, mockBanners } from "./mock-data"
import type { IProduct, IBanner } from "./types/intrerface"

// Flag to determine if using mock data (set to false when database is connected)
const USE_MOCK_DATA = true

// import { productQueries } from "@/lib/db/queries"

export async function getProducts(filters?: {
  category?: string
  search?: string
  featured?: boolean
  limit?: number
  offset?: number
}): Promise<IProduct[]> {

  const limit = filters?.limit ?? 20
  const offset = filters?.offset ?? 0

  // 🔎 If search exists → use FULLTEXT search
  if (filters?.search && filters.search.length >= 2) {
    return await productQueries.search(filters.search, limit)
  }

  // 🧠 Otherwise use normal filtered query
  let query = `
    SELECT *
    FROM products
    WHERE is_active = 1
  `
  const params: any[] = []

  if (filters?.category) {
    query += ` AND category_id = ?`
    params.push(filters.category)
  }

  if (filters?.featured) {
    query += ` AND is_featured = 1`
  }

  query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`
  params.push(limit, offset)

  return await executeQuery<IProduct>(query, params)
}

export async function getProductBySlug(slug: string): Promise<IProduct | null> {
  if (USE_MOCK_DATA) {
    return mockProducts.find((p) => p.slug === slug) || null
  }

  // TODO: Replace with actual database query
  return null
}

// export async function getCategories(): Promise<Category[]> {
//   if (USE_MOCK_DATA) {
//     return mockCategories
//   }

//   // TODO: Replace with actual database query
//   return []
// }




export async function getBanners(): Promise<IBanner[]> {
  if (USE_MOCK_DATA) {
    return mockBanners.filter((b) => b.is_active)
  }

  // TODO: Replace with actual database query
  return []
}

export async function searchProducts(query: string): Promise<IProduct[]> {
  return getProducts({ search: query })
}
