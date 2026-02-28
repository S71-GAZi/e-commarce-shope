import { z } from "zod"

// Auth schemas
export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
})

// Product schemas

export const CreateProductSchema = z.object({
  // 🔹 Basic info
  name: z.string().min(1, "Product name is required"),
  slug: z.string().optional(),
  images: z.array(z.string()).optional(),

  description: z.string().optional(),
  short_description: z.string().optional(),

  // 🔹 Category
  category_id: z.string().optional(),

  // 🔹 Pricing
  price: z.number().positive("Price must be greater than 0"),
  compare_at_price: z.number().positive().optional(),
  cost_price: z.number().positive().optional(),

  // 🔹 Inventory
  sku: z.string().optional(),
  barcode: z.string().optional(),


  stock_quantity: z
    .number()
    .int()
    .min(0, "Stock cannot be negative")
    .default(0),

  low_stock_threshold: z
    .number()
    .int()
    .min(0)
    .default(0),

  // 🔹 Shipping
  weight: z.number().positive().optional(),
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  unit: z.string().optional(),

  // 🔹 Status
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),

  // 🔹 SEO
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),

})

export const UpdateProductSchema = CreateProductSchema.partial()

// Cart schemas
export const AddToCartSchema = z.object({
  product_id: z.string(),
  variant_id: z.string().optional(),
  quantity: z.number().int().positive("Quantity must be at least 1"),
})

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().positive("Quantity must be at least 1"),
})

// Category schemas
export const CreateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Category slug is required"),
  description: z.string().optional(),
  parent_id: z.string().optional(),
  display_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
  image_url: z.string().min(1, "Image URL is required"),
})

// Coupon schemas
export const CreateCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.number().positive("Discount value must be positive"),
  min_purchase_amount: z.number().optional(),
  max_discount_amount: z.number().optional(),
  usage_limit: z.number().int().optional(),
  valid_from: z.string().datetime().optional(),
  valid_until: z.string().datetime().optional(),
  is_active: z.boolean().default(true),
})

// Helper function to validate request body
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>,
): Promise<{ valid: true; data: T } | { valid: false; error: string }> {
  const orderData = await request.json();
  try {
    const result = schema.safeParse(orderData)

    if (!result.success) {
      const errors = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")
      return { valid: false, error: errors }
    }

    return { valid: true, data: result.data }
  } catch (error) {
    return { valid: false, error: "Invalid JSON in request body" }
  }
}
