// Database type definitions

export type UserRole = "customer" | "admin" | "manager" | "support"

export interface User {
  id: string
  email: string
  full_name?: string
  phone?: string
  role: UserRole
  email_verified: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parent_id?: string
  image_url?: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  short_description?: string
  category_id?: string
  price: number
  compare_at_price?: number
  cost_price?: number
  sku?: string
  barcode?: string
  track_inventory: boolean
  stock_quantity: number
  low_stock_threshold: number
  weight?: number
  dimensions?: {
    length?: number
    width?: number
    height?: number
    unit?: string
  }
  is_featured: boolean
  is_active: boolean
  seo_title?: string
  seo_description?: string
  created_at: string
  updated_at: string
  category?: Category
  images?: ProductImage[]
  variants?: ProductVariant[]
  reviews?: Review[]
  average_rating?: number
  review_count?: number
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  alt_text?: string
  display_order: number
  is_primary: boolean
  created_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  sku?: string
  price?: number
  stock_quantity: number
  attributes?: Record<string, string>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  title?: string
  comment?: string
  is_verified_purchase: boolean
  is_approved: boolean
  created_at: string
  updated_at: string
  user?: User
}

export interface Address {
  id: string
  user_id: string
  full_name: string
  phone?: string
  address_line1: string
  address_line2?: string
  city: string
  state?: string
  postal_code: string
  country: string
  is_default: boolean
  address_type: "shipping" | "billing" | "both"
  created_at: string
  updated_at: string
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"

export interface Order {
  id: string
  order_number: string
  user_id?: string
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method?: string
  payment_intent_id?: string
  subtotal: number
  discount_amount: number
  tax_amount: number
  shipping_amount: number
  total_amount: number
  currency: string
  shipping_address_id?: string
  billing_address_id?: string
  coupon_code?: string
  notes?: string
  tracking_number?: string
  shipped_at?: string
  delivered_at?: string
  created_at: string
  updated_at: string
  user?: User
  items?: OrderItem[]
  shipping_address?: Address
  billing_address?: Address
}

export interface OrderItem {
  id: string
  order_id: string
  product_id?: string
  variant_id?: string
  product_name: string
  variant_name?: string
  sku?: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  product?: Product
}

export interface CartItem {
  id: string
  user_id?: string
  session_id?: string
  product_id: string
  variant_id?: string
  quantity: number
  created_at: string
  updated_at: string
  product?: Product
  variant?: ProductVariant
}

export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product?: Product
}

export interface Coupon {
  id: string
  code: string
  description?: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  min_purchase_amount?: number
  max_discount_amount?: number
  usage_limit?: number
  usage_count: number
  valid_from?: string
  valid_until?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface InventoryLog {
  id: string
  product_id: string
  variant_id?: string
  change_type: "restock" | "sale" | "adjustment" | "return"
  quantity_change: number
  quantity_after: number
  reference_id?: string
  notes?: string
  created_by?: string
  created_at: string
}

export interface ContentPage {
  id: string
  title: string
  slug: string
  content?: string
  meta_title?: string
  meta_description?: string
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Banner {
  id: string
  title: string
  image_url: string
  link_url?: string
  description?: string
  display_order: number
  is_active: boolean
  valid_from?: string
  valid_until?: string
  created_at: string
  updated_at: string
}
