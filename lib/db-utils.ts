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
  category?: string | string[] // slug(s)
  search?: string
  featured?: boolean
  minPrice?: number
  maxPrice?: number
  rating?: number
  sort?: "newest" | "price-low" | "price-high" | "rating"
  limit?: number
  offset?: number
}): Promise<IProduct[]> {

  const limit = filters?.limit ?? 20
  const offset = filters?.offset ?? 0

  // FULLTEXT search
  if (filters?.search && filters.search.length >= 2) {
    return await productQueries.search(filters.search, limit)
  }

  let query = `
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = 1
  `
  const params: any[] = []

  /* ================= CATEGORY FILTER ================= */
  if (filters?.category) {
    if (Array.isArray(filters.category)) {
      const placeholders = filters.category.map(() => "?").join(", ")
      query += ` AND c.slug IN (${placeholders})`
      params.push(...filters.category)
    } else {
      query += ` AND c.slug = ?`
      params.push(filters.category)
    }
  }

  /* ================= FEATURED ================= */
  if (filters?.featured) {
    query += ` AND p.is_featured = 1`
  }

  /* ================= PRICE RANGE ================= */
  if (filters?.minPrice !== undefined) {
    query += ` AND p.price >= ?`
    params.push(filters.minPrice)
  }
  if (filters?.maxPrice !== undefined) {
    query += ` AND p.price <= ?`
    params.push(filters.maxPrice)
  }

  /* ================= RATING ================= */
  if (filters?.rating) {
    query += ` AND p.rating >= ?`
    params.push(filters.rating)
  }

  /* ================= SORT ================= */
  switch (filters?.sort) {
    case "price-low":
      query += ` ORDER BY p.price ASC`
      break
    case "price-high":
      query += ` ORDER BY p.price DESC`
      break
    case "rating":
      query += ` ORDER BY p.rating DESC`
      break
    case "newest":
    default:
      query += ` ORDER BY p.created_at DESC`
  }

  query += ` LIMIT ? OFFSET ?`
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
