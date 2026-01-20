# MySQL Database Setup Guide

## Database Credentials

Your e-commerce platform is configured to use the following MySQL database:

- **Host**: sql.freedb.tech
- **Port**: 3306
- **User**: freedb_dbroot1
- **Password**: k5CEfrR?Mns6BuU
- **Database**: freedb_eCom_Db

These credentials are already configured in `lib/db/mysql.ts`.

## Setup Instructions

### 1. Create Database Schema

Execute the MySQL migration script to create all required tables:

```sql
-- Run the script from: scripts/02-create-tables-mysql.sql
```

You can do this via:
- **MySQL Workbench**: File → Open SQL Script → Select `scripts/02-create-tables-mysql.sql`
- **Command Line**:
  ```bash
  mysql -h sql.freedb.tech -u freedb_dbroot1 -p"k5CEfrR?Mns6BuU" freedb_eCom_Db < scripts/02-create-tables-mysql.sql
  ```
- **phpMyAdmin**: Copy/paste the SQL script into the SQL tab

### 2. Verify Connection

The application uses `mysql2/promise` for async database operations. The connection pool is automatically initialized when the first query runs.

### 3. Tables Created

The following tables are created:

- `users` - User accounts and authentication
- `categories` - Product categories
- `products` - Product catalog
- `cart` - Shopping cart items
- `orders` - Order management
- `order_items` - Items in each order
- `wishlist` - Saved products
- `reviews` - Product reviews
- `coupons` - Discount codes
- `inventory` - Stock tracking
- `banners` - Homepage banners
- `pages` - CMS content pages

### 4. Features

- Full-text search on products (name, description)
- Parameterized queries to prevent SQL injection
- Connection pooling for optimal performance
- Automatic timestamp management (created_at, updated_at)
- Proper indexes for query performance

### 5. API Integration

All API routes in `/app/api/` automatically connect to this MySQL database through the query functions in `lib/db/queries.ts`.

Example query usage:

```typescript
import { userQueries, productQueries } from "@/lib/db"

// Find user by email
const user = await userQueries.findByEmail("user@example.com")

// Get all products
const products = await productQueries.listAll(20, 0)

// Search products
const results = await productQueries.search("laptop", 10)
```

### 6. Environment Variables

The credentials are hardcoded in `lib/db/mysql.ts` for this setup. In production, you may want to move them to environment variables:

```env
MYSQL_HOST=sql.freedb.tech
MYSQL_PORT=3306
MYSQL_USER=freedb_dbroot1
MYSQL_PASSWORD=k5CEfrR?Mns6BuU
MYSQL_DATABASE=freedb_eCom_Db
```

Then update `lib/db/mysql.ts` to read from environment:

```typescript
const config = {
  host: process.env.MYSQL_HOST,
  port: Number.parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  // ... rest of config
}
```

### 7. Troubleshooting

**Connection Refused**:
- Verify credentials are correct
- Check firewall/network access to sql.freedb.tech
- Ensure port 3306 is not blocked

**Table Already Exists**:
- Drop existing tables first or modify the script to use `CREATE TABLE IF NOT EXISTS`

**Query Errors**:
- Check that all required tables are created
- Verify column names match the schema in `scripts/02-create-tables-mysql.sql`
- Use MySQL Workbench to inspect table structure

## Testing Connection

Create a test API route to verify the connection:

```typescript
// app/api/test-db/route.ts
import { executeQuery } from "@/lib/db"

export async function GET() {
  try {
    const result = await executeQuery("SELECT COUNT(*) as count FROM users")
    return Response.json({ status: "connected", result })
  } catch (error) {
    return Response.json({ status: "error", error: error.message }, { status: 500 })
  }
}
```

Visit `/api/test-db` to verify the connection works.
