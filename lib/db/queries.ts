import { executeQuery, executeQuerySingle } from "./mysql"
import type { IUser, IProduct, IOrder, ICategory, ICoupon, ICartItem } from "@/lib/types/intrerface"

export const userQueries = {
  async findByEmail(email: string) {
    return executeQuerySingle<IUser>("SELECT * FROM users WHERE email = ? LIMIT 1", [email])
  },

  async findById(id: string) {
    return executeQuerySingle<IUser>("SELECT * FROM users WHERE id = ? LIMIT 1", [id])
  },

  async create(email: string, full_name: string, password_hash: string) {
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    await executeQuery(
      "INSERT INTO users (id, email, full_name, password_hash, role, email_verified) VALUES (?, ?, ?, ?, 'customer', 0)",
      [userId, email, full_name, password_hash],
    )
    return executeQuerySingle<IUser>("SELECT * FROM users WHERE id = ?", [userId])
  },

  async update(id: string, data: Partial<IUser>) {
    const fields: string[] = []
    const values: any[] = []

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== "id") {
        fields.push(`${key} = ?`)
        values.push(value)
      }
    })

    if (fields.length === 0) return undefined

    values.push(id)
    const query = `UPDATE users SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    await executeQuery(query, values)
    return executeQuerySingle<IUser>("SELECT * FROM users WHERE id = ?", [id])
  },

  async listAll(limit = 50, offset = 0) {
    return executeQuery<IUser>("SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?", [limit, offset])
  },
  async listAllCustomers(limit = 50, offset = 0) {
    return executeQuery<IUser>(
      `SELECT *
     FROM users
     WHERE role = ?
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
      ['customer', limit, offset]
    );
  }
}

export const productQueries = {
  async findById(id: string) {
    return executeQuerySingle<IProduct>(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ? LIMIT 1`,
      [id],
    )
  },

  async findBySlug(slug: string) {
    return executeQuerySingle<IProduct>(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ? LIMIT 1`,
      [slug],
    )
  },

  // Service / Repository method
  async getAllProducts(
    limit = 20,
    offset = 0,
    filters?: { category_id?: string; is_active?: boolean }
  ) {
    let query = "SELECT * FROM products WHERE 1=1"
    const params: any[] = []

    if (filters?.is_active !== undefined) {
      query += " AND is_active = ?"
      params.push(filters.is_active ? 1 : 0)
    }

    if (filters?.category_id) {
      query += " AND category_id = ?"
      params.push(filters.category_id)
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.push(limit, offset)

    return executeQuery<IProduct>(query, params)
  },

  async search(query: string, limit = 20) {
    return executeQuery<IProduct>(
      `SELECT * FROM products
       WHERE MATCH(name, description, short_description) AGAINST(? IN BOOLEAN MODE)
       AND is_active = true
       ORDER BY created_at DESC
       LIMIT ?`,
      [query, limit],
    )
  },

  async create(data: Partial<IProduct>) {
    const result = await executeQuery<IProduct>(
      `INSERT INTO products (
        name, slug, images, description, short_description, category_id, price, compare_at_price, cost_price, sku, barcode, stock_quantity, low_stock_threshold, weight, length, width, height, unit, seo_title, 	seo_description, is_featured, is_active
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.slug,
        JSON.stringify(data.images || []),
        data.description,
        data.short_description,
        data.category_id,
        data.price,
        data.compare_at_price,
        data.cost_price,
        data.sku,
        data.barcode,
        data.stock_quantity || 0,
        data.low_stock_threshold || 0,
        data.weight,
        data.length,
        data.width,
        data.height,
        data.unit,
        data.seo_title,
        data.seo_description,
        data.is_featured ? 1 : 0,
        data.is_active !== false ? 1 : 0,
      ],
    )
    return result[0]
  },

  async update(id: string, data: Partial<IProduct>) {
    const fields: string[] = []
    const values: any[] = []

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== "id") {
        fields.push(`${key} = ?`)
        values.push(value)
      }
    })

    if (fields.length === 0) return undefined

    values.push(id)
    const query = `UPDATE products SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    await executeQuery(query, values)
    return executeQuerySingle<IProduct>("SELECT * FROM products WHERE id = ?", [id])
  },

  async delete(id: string) {
    await executeQuery("DELETE FROM products WHERE id = ?", [id])
  },
}

export const orderQueries = {
  async findById(id: string) {
    return executeQuerySingle<IOrder>("SELECT * FROM orders WHERE id = ? LIMIT 1", [id])
  },

  async findByUserId(userId: string, limit = 20, offset = 0) {
    return executeQuery<IOrder>("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?", [
      userId,
      limit,
      offset,
    ])
  },

  async listAll(limit = 20, offset = 0) {
    return executeQuery<IOrder>("SELECT * FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?", [limit, offset])
  },

  async create(data: Partial<IOrder>) {
    const orderNumber = `ORD-${Date.now()}`
    const result = await executeQuery<IOrder>(
      `INSERT INTO orders (
        order_number, user_id, status, payment_status, subtotal,
        total_amount, currency, coupon_code
       ) VALUES (?, ?, 'pending', 'pending', ?, ?, ?, ?)`,
      [orderNumber, data.user_id, data.subtotal || 0, data.total_amount, data.currency || "USD", data.coupon_code],
    )
    return result[0]
  },

  async updateStatus(id: string, status: string, paymentStatus?: string) {
    if (paymentStatus) {
      await executeQuery(
        "UPDATE orders SET status = ?, payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [status, paymentStatus, id],
      )
    } else {
      await executeQuery("UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [status, id])
    }
    return executeQuerySingle<IOrder>("SELECT * FROM orders WHERE id = ?", [id])
  },
}

export const cartQueries = {
  async findByUserId(userId: string) {
    return executeQuery<ICartItem & { product_name: string; price: number; slug: string }>(
      `SELECT ci.*, p.name as product_name, p.price, p.slug
       FROM cart_items ci
       LEFT JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?`,
      [userId],
    )
  },

  async addItem(userId: string, productId: string, quantity: number, variantId?: string) {
    const result = await executeQuery<ICartItem>(
      `INSERT INTO cart_items (user_id, product_id, variant_id, quantity)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
      [userId, productId, variantId || null, quantity, quantity],
    )
    return result[0]
  },

  async updateQuantity(id: string, quantity: number) {
    await executeQuery("UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
      quantity,
      id,
    ])
    return executeQuerySingle<ICartItem>("SELECT * FROM cart_items WHERE id = ?", [id])
  },

  async removeItem(id: string) {
    await executeQuery("DELETE FROM cart_items WHERE id = ?", [id])
  },

  async clearCart(userId: string) {
    await executeQuery("DELETE FROM cart_items WHERE user_id = ?", [userId])
  },
}

export const categoryQueries = {
  async listAll(limit?: number, offset?: number) {
    const safeLimit = Number(limit ?? 100);
    const safeOffset = Number(offset ?? 0);

    // return executeQuery<ICategory>(
    //   "SELECT * FROM categories WHERE is_active = true ORDER BY display_order ASC LIMIT ? OFFSET ?",
    //   [safeLimit, safeOffset],
    // )

    return executeQuery<ICategory>(
      `SELECT * FROM categories WHERE is_active = true ORDER BY display_order ASC LIMIT ${safeLimit} OFFSET ${safeOffset}`
    )
  },

  async findById(id: string) {
    return executeQuerySingle<ICategory>("SELECT * FROM categories WHERE id = ? LIMIT 1", [id])
  },

  async create(data: Partial<ICategory>) {
    const result = await executeQuery<ICategory>(
      "INSERT INTO categories (name, slug, description, is_active) VALUES (?, ?, ?, ?)",
      [data.name, data.slug, data.description, data.is_active !== false ? 1 : 0],
    )
    return result[0]
  },

  async update(id: string, data: Partial<ICategory>) {
    const fields: string[] = []
    const values: any[] = []

    if (data.name !== undefined) {
      fields.push("name = ?")
      values.push(data.name)
    }
    if (data.slug !== undefined) {
      fields.push("slug = ?")
      values.push(data.slug)
    }
    if (data.description !== undefined) {
      fields.push("description = ?")
      values.push(data.description)
    }
    if (data.is_active !== undefined) {
      fields.push("is_active = ?")
      values.push(data.is_active ? 1 : 0)
    }

    if (fields.length === 0) return undefined

    values.push(id)
    const query = `UPDATE categories SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    await executeQuery(query, values)
    return executeQuerySingle<ICategory>("SELECT * FROM categories WHERE id = ?", [id])
  },

  async delete(id: string) {
    await executeQuery("DELETE FROM categories WHERE id = ?", [id])
  },
}

export const couponQueries = {
  async findByCode(code: string) {
    return executeQuerySingle<ICoupon>("SELECT * FROM coupons WHERE code = ? AND is_active = true LIMIT 1", [code])
  },

  async listAll(limit = 50, offset = 0) {
    return executeQuery<ICoupon>("SELECT * FROM coupons ORDER BY created_at DESC LIMIT ? OFFSET ?", [limit, offset])
  },

  async create(data: Partial<ICoupon>) {
    const result = await executeQuery<ICoupon>(
      "INSERT INTO coupons (code, discount_type, discount_value, is_active) VALUES (?, ?, ?, true)",
      [data.code, data.discount_type, data.discount_value],
    )
    return result[0]
  },

  async delete(id: string) {
    await executeQuery("DELETE FROM coupons WHERE id = ?", [id])
  },
}
