# E-Commerce API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format
All API responses follow this structure:
```json
{
  "success": boolean,
  "data": object | null,
  "error": string | null
}
```

## Endpoints

### Authentication

#### POST /auth/login
Login user and get authentication token.

**Request:**
```json
{
  "email": "demo@example.com",
  "password": "demo123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { /* User object */ },
    "token": "mock-token-customer",
    "expiresIn": 86400
  }
}
```

**Test Credentials:**
- Customer: demo@example.com / demo123
- Admin: admin@example.com / admin123

---

#### POST /auth/register
Register new user account.

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "full_name": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": { /* User object */ },
    "token": "mock-token-xxx",
    "expiresIn": 86400
  }
}
```

---

#### POST /auth/logout
Logout user and invalidate token.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

### Products

#### GET /products
Get all products with pagination and filters.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `category` (optional): Filter by category ID
- `search` (optional): Search query
- `featured` (optional): Get only featured products (true/false)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [ /* Product objects */ ],
    "pagination": {
      "limit": 20,
      "offset": 0,
      "total": 50
    }
  }
}
```

---

#### GET /products/search?q=keyword
Search products by keyword.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "query": "keyword",
    "results": [ /* Product objects */ ],
    "count": 5
  }
}
```

---

#### GET /products/[id]
Get product details by ID.

**Response (200):**
```json
{
  "success": true,
  "data": { /* Product object */ }
}
```

---

#### POST /products (Admin Only)
Create new product.

**Request:**
```json
{
  "name": "Product Name",
  "slug": "product-name",
  "description": "Product description",
  "category_id": "category-1",
  "price": 99.99,
  "stock_quantity": 100,
  "is_featured": false,
  "is_active": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { /* Created Product object */ }
}
```

---

#### PATCH /products/[id] (Admin Only)
Update product.

**Request:** (Same as POST, but all fields optional)

**Response (200):**
```json
{
  "success": true,
  "data": { /* Updated Product object */ }
}
```

---

#### DELETE /products/[id] (Admin Only)
Delete product.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "product-1",
    "message": "Product deleted successfully"
  }
}
```

---

### Orders

#### GET /orders
Get user's orders.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orders": [ /* Order objects */ ],
    "pagination": { /* Pagination info */ }
  }
}
```

---

#### POST /orders
Create new order.

**Request:**
```json
{
  "shipping_address_id": "address-1",
  "billing_address_id": "address-1",
  "coupon_code": "SAVE10",
  "notes": "Please handle with care"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { /* Order object */ }
}
```

---

#### GET /orders/[id]
Get order details.

**Response (200):**
```json
{
  "success": true,
  "data": { /* Order object with items */ }
}
```

---

#### PATCH /orders/[id] (Admin Only)
Update order status.

**Request:**
```json
{
  "status": "shipped",
  "tracking_number": "TRACK123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* Updated Order object */ }
}
```

---

### Cart

#### GET /cart
Get user's shopping cart.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [ /* Cart items */ ],
    "itemCount": 3,
    "subtotal": 299.99,
    "total": 299.99
  }
}
```

---

#### POST /cart
Add item to cart.

**Request:**
```json
{
  "product_id": "product-1",
  "variant_id": "variant-1",
  "quantity": 2
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { /* Cart item */ }
}
```

---

#### PATCH /cart/[id]
Update cart item quantity.

**Request:**
```json
{
  "quantity": 5
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* Updated cart item */ }
}
```

---

#### DELETE /cart/[id]
Remove item from cart.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "cart-1",
    "message": "Item removed from cart"
  }
}
```

---

#### DELETE /cart
Clear entire cart.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Cart cleared successfully"
  }
}
```

---

### Payments

#### POST /payments/checkout
Create payment intent for checkout.

**Request:**
```json
{
  "orderId": "order-1",
  "amount": 99.99
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "pi_123456",
    "client_secret": "pi_123456_secret_xxx",
    "amount": 9999,
    "currency": "usd",
    "status": "requires_payment_method"
  }
}
```

---

#### POST /payments/validate-coupon
Validate and apply coupon code.

**Request:**
```json
{
  "couponCode": "SAVE10",
  "cartTotal": 100.00
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "coupon": {
      "code": "SAVE10",
      "discount_type": "percentage",
      "discount_value": 10
    },
    "discount": 10.00,
    "subtotal": 100.00,
    "total": 90.00
  }
}
```

---

### Admin - Categories

#### GET /admin/categories (Admin Only)
Get all categories.

#### POST /admin/categories (Admin Only)
Create category.

**Request:**
```json
{
  "name": "Electronics",
  "slug": "electronics",
  "display_order": 1,
  "is_active": true
}
```

#### PATCH /admin/categories/[id] (Admin Only)
Update category.

#### DELETE /admin/categories/[id] (Admin Only)
Delete category.

---

### Admin - Coupons

#### GET /admin/coupons (Admin Only)
Get all coupons.

#### POST /admin/coupons (Admin Only)
Create coupon.

**Request:**
```json
{
  "code": "SAVE10",
  "discount_type": "percentage",
  "discount_value": 10,
  "is_active": true
}
```

---

### Admin - Customers

#### GET /admin/customers (Admin Only)
Get all customers with pagination.

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error details"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Testing with cURL

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "demo123"
  }'
```

### Get Products
```bash
curl http://localhost:3000/api/products?page=1&limit=10
```

### Create Product (Admin)
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock-token-admin" \
  -d '{
    "name": "New Product",
    "slug": "new-product",
    "price": 99.99,
    "stock_quantity": 100
  }'
```

---

## Rate Limiting

Currently not implemented. Production deployment should include:
- 100 requests per minute per IP
- 50 requests per minute per authenticated user
- 10 requests per minute for auth endpoints
