# Admin Panel Access Guide

## How to Access Admin Dashboard

### Using Demo Admin Account
The easiest way to access the admin panel is to use the pre-configured demo admin account:

**Email:** `admin@example.com`  
**Password:** `admin123`

### Steps to Access Admin Panel:

1. Go to `/auth/login`
2. Enter the admin email and password above
3. Click "Sign In"
4. In the top-right user dropdown menu, you'll see "Admin Dashboard" option
5. Click "Admin Dashboard" to access the admin panel

### Admin Features Available:

- **Dashboard**: View sales analytics, revenue, orders, and inventory overview
- **Products**: Create, edit, delete products with pricing, inventory, and SEO fields
- **Orders**: View all orders, update order status, track shipments, process refunds
- **Customers**: View customer profiles, order history, and communication logs
- **Categories**: Manage product categories and organize inventory
- **Coupons**: Create and manage discount codes and promotions
- **Banners**: Edit homepage banners and promotional content
- **Pages**: Manage static pages (About, Contact, Terms, etc.)
- **Analytics**: View detailed sales charts and performance metrics
- **Settings**: Configure store settings and preferences

### Creating New Admin Users:

If you need to create additional admin users, you'll need to:

1. Register a new customer account via the sign-up page
2. Contact your database administrator to manually update the user's role from 'customer' to 'admin'

**SQL Command to update user role:**
```sql
UPDATE users SET role = 'admin' WHERE email = 'new-admin@example.com';
```

### Database User Roles:

- **customer**: Regular customer account (default for new registrations)
- **manager**: Limited admin access
- **admin**: Full admin access with all features

### Troubleshooting:

**Admin Dashboard link not showing?**
- Ensure you're logged in with an admin/manager account
- The "Admin Dashboard" link appears in the user dropdown menu (top-right user icon)
- If it's still not showing, verify your user role in the database

**Cannot access /admin page?**
- You must be logged in with an admin or manager account
- Non-admin users will be redirected to the home page
- Check your user role in the database

**Password Not Working?**
- Demo admin password is: `admin123`
- Passwords are hashed using SHA256
- If you've manually updated the password, ensure it's properly hashed
