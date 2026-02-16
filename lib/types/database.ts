// Database type definitions

export type UserRole = "customer" | "admin" | "manager" | "support"

export interface IUser {
  id: string
  email: string
  full_name?: string
  phone?: string
  role: UserRole
  email_verified: boolean
  created_at: string
  updated_at: string
}

export interface ICategory {
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

export interface IProduct {
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
  category?: ICategory
  images?: IProductImage[]
  variants?: IProductVariant[]
  reviews?: IReview[]
  average_rating?: number
  review_count?: number
  meta_title?: string
  meta_description?: string
}

export interface IProductImage {
  id: string
  product_id: string
  image_url: string
  alt_text?: string
  display_order: number
  is_primary: boolean
  created_at: string
}

export interface IProductVariant {
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

export interface IReview {
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
  user?: IUser
}

export interface IAddress {
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

export type IOrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"
export type IPaymentStatus = "pending" | "paid" | "failed" | "refunded"

export interface IOrder {
  id: string
  order_number: string
  user_id?: string
  status: IOrderStatus
  payment_status: IPaymentStatus
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
  user?: IUser
  items?: IOrderItem[]
  shipping_address?: IAddress
  billing_address?: IAddress
}

export interface IOrderItem {
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
  product?: IProduct
}

export interface ICartItem {
  id: string
  user_id?: string
  session_id?: string
  product_id: string
  variant_id?: string
  quantity: number
  created_at: string
  updated_at: string
  product?: IProduct
  variant?: IProductVariant
}

export interface IWishlistItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product?: IProduct
}

export interface ICoupon {
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

export interface IInventoryLog {
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

export interface IContentPage {
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

export interface IBanner {
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
