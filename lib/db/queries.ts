import { TOrderItemInput, TShippingInfoInput } from "../api/order.validation"
import { IOrderFull, IOrderItem, IOrderShipping, IOrderStatus, IPaymentMethod, IPaymentStatus } from "../types/order.interface"
import { executeQuery, executeQuerySingle, getMySQLPool } from "./mysql"
import type { IUser, IProduct, ICategory, ICoupon, ICartItem, } from "@/lib/types/intrerface"

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
export const dashboardQuery = {
  async getDashboardStats() {
    return executeQuery(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'customer') AS totalCustomer,
        (SELECT COUNT(*) FROM products) AS totalProduct,
        (SELECT COUNT(*) FROM orders 
          WHERE status NOT IN ('cancelled','returned')
          AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        ) AS totalOrder,
        (SELECT COALESCE(SUM(total), 0) FROM orders 
          WHERE status NOT IN ('cancelled','returned')
          AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        ) AS totalRevenue
    `)
  },
  async getRecentOrders() {
    return executeQuery(`
       SELECT 
        o.order_number AS order_id,
        u.full_name AS customer_name,
        o.created_at AS time,
        o.total,
        o.status
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 4
    `)
  },
  async getLowStockProducts() {
    // First: low stock products
    const lowStock = await executeQuery(`
    SELECT name, stock_quantity, low_stock_threshold
    FROM products
    WHERE is_active = true
      AND stock_quantity <= low_stock_threshold
    ORDER BY stock_quantity ASC
    LIMIT 5
  `)

    // If we found low stock products, exclude them from fallback
    if (lowStock.length > 0) {
      const excludeIds = lowStock.map(p => `'${p.name}'`).join(', ')
      const fallback = await executeQuery(`
      SELECT name, stock_quantity, low_stock_threshold
      FROM products
      WHERE is_active = true
        AND name NOT IN (${excludeIds})
      ORDER BY stock_quantity ASC
      LIMIT ${5 - lowStock.length}
    `)
      return [...lowStock, ...fallback]
    }

    // If no low stock products, return lowest stock products
    return executeQuery(`
    SELECT name, stock_quantity, low_stock_threshold
    FROM products
    WHERE is_active = true
    ORDER BY stock_quantity ASC
    LIMIT 5
  `)
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

// ✅ Use inferred types from Zod schema instead of redefining
export interface ICreateFullOrderParams {
  user_id: string; // ✅ number (not string)
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number; // ✅ required (default(0) in schema)
  coupon_code?: string | null;
  status: IOrderStatus;
  total: number;
  note?: string | null;
  sample_image?: string | null;
  payment_method: IPaymentMethod;
  payment_status: IPaymentStatus;
  payment_provider?: string | null;
  payment_sender_account?: string | null;
  payment_transaction_id?: string | null;
  items: TOrderItemInput[];
  shipping_info: TShippingInfoInput;
  ip_address: string | null, // You can capture real IP from request in route handler and pass it here
  create_at: Date,
  updated_at: Date,
}

function generateOrderNumber(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `ORD-${y}${m}${d}-${random}`;
}

export const orderQueries = {
  async findById(id: string): Promise<IOrderFull | null> {
    const order = await executeQuerySingle<IOrderFull>(
      `SELECT 
        o.*,  
        u.full_name AS customer_name,
        u.phone AS customer_phone
     FROM orders o
     LEFT JOIN users u ON o.user_id = u.id 
     WHERE o.id = ? 
     LIMIT 1`,
      [id]
    );

    if (!order) return null;

    const order_items = await executeQuery<IOrderItem>(
      `SELECT * FROM order_items WHERE order_id = ?`,
      [id]
    );

    const shipping_info = await executeQuerySingle<IOrderShipping>(
      `SELECT * FROM shipping_info WHERE order_id = ? LIMIT 1`,
      [id]
    );

    if (!shipping_info)
      throw new Error(`Shipping info not found for order ${id}`);

    return { ...order, order_items, shipping_info };
  },
  async findByUserId(userId: string, limit = 20, offset = 0) {
    return executeQuery<IOrderFull>("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?", [
      userId,
      limit,
      offset,
    ])
  },
  async listAll(limit = 20, offset = 0) {
    return executeQuery<IOrderFull>(
      `
    SELECT 
      o.*,

      -- Customer
      u.full_name AS customer_name,
      u.phone AS customer_phone,

      -- Shipping (single object)
           JSON_OBJECT(
        'name', s.name,
        'email', s.email,
        'phone', s.phone,
        'division', s.division,
        'district', s.district,
        'upazila', s.upazila,
        'address', s.address,
        'shipping_method', s.shipping_method,
        'courier_name', s.courier_name,
        'tracking_code', s.tracking_code,
        'shipping_status', s.shipping_status
      ) AS shipping_info,

      -- Order Items Array
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'product_id', oi.product_id,
            'variant_id', oi.variant_id,
            'name', oi.name,
            'slug', oi.slug,
            'price_snapshot', oi.price_snapshot,
            'quantity', oi.quantity,
            'images', oi.images
          )
        )
        FROM order_items oi
        WHERE oi.order_id = o.id
      ) AS order_items
    FROM orders o

    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN shipping_info s ON o.id = s.order_id

    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
    `,
      [limit, offset]
    )
  },

  async createFullOrder(data: ICreateFullOrderParams): Promise<IOrderFull> {
    const order_number = generateOrderNumber();

    // 1️⃣ Insert order
    const orderResult: any = await executeQuery<{ insertId: number }>(
      `INSERT INTO orders (
            order_number,
            user_id,
            subtotal,
            shipping,
            tax,
            discount,
            coupon_code,
            status,
            total,
            payment_method,
            payment_status,
            payment_provider,
            payment_sender_account,
            payment_transaction_id,
            note,
            sample_image,
            ip_address,
            created_at,
            updated_at
        ) VALUES (?, ?,?,?,?,?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order_number,
        data.user_id,
        data.subtotal,
        data.shipping,
        data.tax,
        data.discount,
        data.coupon_code ?? null,
        data.status,
        data.total,
        data.payment_method,
        data.payment_status,
        data.payment_provider ?? null,
        data.payment_sender_account ?? null,
        data.payment_transaction_id ?? null,
        data.note ?? null,
        data.sample_image ?? null,
        data.ip_address ?? null,
        data.create_at ?? new Date(),
        data.updated_at ?? new Date(),
      ]
    );
    const orderId = orderResult.insertId;


    await Promise.all(
      data.items.map((item) =>
        executeQuery(
          `INSERT INTO order_items (
                    order_id,
                    product_id,
                    variant_id,
                    name,
                    slug,
                    price_snapshot,
                    quantity,
                    images,
                    selected_size,
                    product_code
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?)`,
          [
            orderId,
            item.product_id,
            item.variant_id ?? null,
            item.name,
            item.slug ?? null,
            item.price_snapshot,
            item.quantity,
            item.images ? JSON.stringify(item.images) : null,
            item.selected_size,
            item.product_code
          ]
        )
      )
    );

    // 3️⃣ Insert shipping info
    const s = data.shipping_info;
    await executeQuery(
      `INSERT INTO shipping_info (
            order_id,
            name,
            email,
            phone,
            division,
            district,
            upazila,
            address,
            shipping_method,
            courier_name,
            tracking_code,
            shipping_status,
            created_at,
            updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
      [
        orderId,
        s.name,
        s.email ?? null,
        s.phone,
        s.division,
        s.district,
        s.upazila,
        s.address,
        s.shipping_method ?? "standard",
        s.courier_name ?? null,
        s.tracking_code ?? null,
      ]
    );

    // 4️⃣ Return full order
    const fullOrder = await this.findById(orderId);
    if (!fullOrder) throw new Error("Order not found after creation");
    return fullOrder;
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
    return executeQuerySingle<IOrderFull>("SELECT * FROM orders WHERE id = ?", [id])
  },


};


export const cartQueries = {
  async findByUserId(userId: string) {
    return executeQuery<ICartItem & { name: string; slug: string; images: [string] }>(
      `SELECT ci.*, p.name , p.slug , p.images 
     FROM cart_items ci
     LEFT JOIN products p ON ci.product_id = p.id
     WHERE ci.user_id = ?`,
      [userId],
    )
  },

  async addItem(userId: string, productId: string, quantity: number, variantId?: string) {

    const product = await executeQuerySingle<{ price: number }>(
      "SELECT price FROM products WHERE id = ?",
      [productId]
    )

    if (!product) {
      throw new Error("Product not found")
    }

    const existing = await executeQuerySingle(
      "SELECT * FROM cart_items WHERE user_id = ? AND product_id = ? AND variant_id IS NULL",
      [userId, productId]
    )
    if (existing) {
      await executeQuery(
        "UPDATE cart_items SET quantity = quantity + ? WHERE id = ?",
        [quantity, existing.id]
      )
    } else {
      await executeQuery(
        "INSERT INTO cart_items (user_id, product_id, variant_id, quantity, price_snapshot) VALUES (?, ?, ?, ?, ?)",
        [userId, productId, null, quantity, product.price]
      )
    }

    return executeQuerySingle<ICartItem>(
      `SELECT * FROM cart_items 
     WHERE user_id = ? 
     AND product_id = ? 
     AND variant_id <=> ?`,
      [userId, productId, variantId ?? null]
    )
  },

  async updateQuantity(id: string, userId: string, quantity: number) {

    if (quantity <= 0) {
      const result: any = await executeQuery(
        "DELETE FROM cart_items WHERE id = ? AND user_id = ?",
        [id, userId]
      )

      if (result.affectedRows === 0) {
        throw new Error("Cart item not found")
      }

      return null
    }

    const result: any = await executeQuery(
      "UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
      [quantity, id, userId]
    )

    if (result.affectedRows === 0) {
      throw new Error("Cart item not found")
    }

    return executeQuerySingle<ICartItem>(
      "SELECT * FROM cart_items WHERE id = ? AND user_id = ?",
      [id, userId]
    )
  },

  async removeItem(id: string, userId: string) {
    const result: any = await executeQuery(
      "DELETE FROM cart_items WHERE id = ? AND user_id = ?",
      [id, userId]
    )

    if (result.affectedRows === 0) {
      throw new Error("Cart item not found")
    }
  },

  async clearCart(userId: string) {
    const result: any = await executeQuery(
      "DELETE FROM cart_items WHERE user_id = ?",
      [userId]
    )

    return { deleted: result.affectedRows || 0 } // return affected rows
  },
}

export const categoryQueries = {
  async listAll(limit?: number, offset?: number) {
    const safeLimit = Number(limit ?? 100);
    const safeOffset = Number(offset ?? 0);

    return executeQuery<ICategory>(
      `SELECT * 
     FROM categories 
     WHERE is_active = true 
     ORDER BY display_order ASC 
     LIMIT ? OFFSET ?`,
      [safeLimit, safeOffset]
    );
  },

  async findById(id: string) {
    return executeQuerySingle<ICategory>("SELECT * FROM categories WHERE id = ? LIMIT 1", [id])
  },

  async create(data: Partial<ICategory>) {
    const result = await executeQuery<ICategory>(
      "INSERT INTO categories (name, slug, description,parent_id, image_url, display_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [data.name, data.slug, data.description, data.parent_id || "", data.image_url, data.display_order || 0, data.is_active === true ? 1 : 0],
    )
    return result[0]
  },

  // async update(id: string, data: Partial<ICategory>) {
  //   const fields: string[] = []
  //   const values: any[] = []

  //   if (data.name !== undefined) {
  //     fields.push("name = ?")
  //     values.push(data.name)
  //   }
  //   if (data.slug !== undefined) {
  //     fields.push("slug = ?")
  //     values.push(data.slug)
  //   }
  //   if (data.description !== undefined) {
  //     fields.push("description = ?")
  //     values.push(data.description)
  //   }
  //   if (data.is_active !== undefined) {
  //     fields.push("is_active = ?")
  //     values.push(data.is_active ? 1 : 0)
  //   }

  //   if (fields.length === 0) return undefined

  //   values.push(id)
  //   const query = `UPDATE categories SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  //   await executeQuery(query, values)
  //   return executeQuerySingle<ICategory>("SELECT * FROM categories WHERE id = ?", [id])
  // },
  async update(id: string, data: Partial<ICategory>) {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push("name = ?");
      values.push(data.name);
    }

    if (data.slug !== undefined) {
      fields.push("slug = ?");
      values.push(data.slug);
    }

    if (data.description !== undefined) {
      fields.push("description = ?");
      values.push(data.description);
    }

    if (data.parent_id !== undefined) {
      fields.push("parent_id = ?");
      values.push(data.parent_id);
    }

    if (data.display_order !== undefined) {
      fields.push("display_order = ?");
      values.push(data.display_order);
    }

    if (data.image_url !== undefined) {
      fields.push("image_url = ?");
      values.push(data.image_url);
    }

    if (data.is_active !== undefined) {
      fields.push("is_active = ?");
      values.push(data.is_active ? 1 : 1);
    }

    if (fields.length === 0) return undefined;

    values.push(id);

    const query = `
    UPDATE categories 
    SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `;

    await executeQuery(query, values);

    return executeQuerySingle<ICategory>(
      "SELECT * FROM categories WHERE id = ?",
      [id]
    );
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
