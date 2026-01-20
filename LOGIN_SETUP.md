# E-Commerce Login Setup Guide

## Database Connection

Your e-commerce platform is configured to use MySQL with the following credentials:
- **Host**: sql.freedb.tech:3306
- **User**: freedb_dbroot1
- **Password**: k5CEfrR?Mns6BuU
- **Database**: freedb_eCom_Db

## Step 1: Create Database Tables

Run the migration script to create all necessary tables and seed demo users:

```bash
# Option 1: Using MySQL CLI
mysql -h sql.freedb.tech -u freedb_dbroot1 -p freedb_eCom_Db < scripts/02-create-tables-mysql.sql
# When prompted for password, enter: k5CEfrR?Mns6BuU

# Option 2: Using PHPMyAdmin
# 1. Go to your PHPMyAdmin panel at sql.freedb.tech
# 2. Select the freedb_eCom_Db database
# 3. Click "Import" tab
# 4. Choose the file: scripts/02-create-tables-mysql.sql
# 5. Click "Go" to execute
```

## Step 2: Verify Demo Users Were Created

After running the migration, these demo accounts will be available:

### Customer Account:
- **Email**: demo@example.com
- **Password**: demo123
- **Role**: customer

### Admin Account:
- **Email**: admin@example.com
- **Password**: admin123
- **Role**: admin

## Step 3: Test Login

1. Start your development server:
```bash
npm run dev
```

2. Navigate to: http://localhost:3000/auth/login

3. Enter the demo credentials:
   - Email: demo@example.com
   - Password: demo123

4. Click "Sign In"

## How Login Works

The authentication flow:

1. **Login Form** (`components/auth/login-form.tsx`)
   - Submits credentials to `/api/auth/login` endpoint
   - Shows error if login fails

2. **API Route** (`app/api/auth/login/route.ts`)
   - Validates request body
   - Queries the MySQL database for the user
   - Verifies password hash
   - Generates authentication token
   - Returns user data and token

3. **Auth Context** (`lib/auth-context.tsx`)
   - Receives response from API
   - Stores user data in localStorage
   - Stores authentication token
   - Updates React context state

4. **Redirect**
   - On successful login, user is redirected to home page
   - Auth state is available throughout the app

## Troubleshooting

### "Invalid email or password" error

**Issue**: Login fails even with correct credentials
**Solution**: 
1. Verify the migration script was executed successfully
2. Check the database tables exist: `SHOW TABLES;`
3. Verify demo users were created: `SELECT * FROM users;`

### Database connection error

**Issue**: Can't connect to MySQL database
**Solution**:
1. Verify your internet connection
2. Check FreDB credentials are correct
3. Test connection with MySQL client:
```bash
mysql -h sql.freedb.tech -u freedb_dbroot1 -p
# Enter password: k5CEfrR?Mns6BuU
```

### User stuck on login page after click

**Issue**: Form doesn't submit or page freezes
**Solution**:
1. Check browser console (F12) for errors
2. Check network tab to see if API request is being made
3. Verify `/api/auth/login` route exists and responds

## Register New Users

Users can also create new accounts via the registration form at `/auth/register`:

1. Enter email, password, and full name
2. Account is created in the database
3. User is automatically logged in
4. Redirect to home page

## Next Steps

After successful login:

1. Browse products at `/products`
2. Add items to cart
3. Proceed to checkout
4. Access admin dashboard at `/admin` (admin account only)
5. Manage products, orders, and customers

## Important Notes

- Passwords are hashed using SHA256 before storing in database
- Authentication tokens are stored in localStorage
- Logout clears localStorage and redirects to login page
- All API routes check for valid authentication token
- Role-based access control prevents non-admin users from accessing `/admin` routes
