# E-Commerce Platform

A comprehensive, full-stack e-commerce platform built with Next.js, featuring both customer-facing storefront and admin management system.

## Features

### Customer Features
- User authentication (login, registration, password recovery)
- Product catalog with search, filtering, and sorting
- Product detail pages with reviews and ratings
- Shopping cart with quantity management
- Secure checkout process
- Order history and tracking
- Wishlist functionality
- User profile management
- Responsive design for all devices

### Admin Features
- Comprehensive dashboard with analytics
- Product management (CRUD operations)
- Order management and tracking
- Customer management
- Category management
- Coupon/discount code management
- Banner management for homepage
- Content page management (CMS)
- Inventory tracking and low-stock alerts
- Settings and configuration

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: React Context API
- **Authentication**: Mock auth (ready for Supabase integration)
- **Database**: Mock data (ready for Supabase/Neon integration)
- **Payments**: Ready for Stripe integration

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository or download the code

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Demo Credentials

### Customer Account
- Email: demo@example.com
- Password: demo123

### Admin Account
- Email: admin@example.com
- Password: admin123

## Project Structure

\`\`\`
├── app/                      # Next.js app directory
│   ├── admin/               # Admin dashboard pages
│   ├── auth/                # Authentication pages
│   ├── products/            # Product pages
│   ├── cart/                # Shopping cart
│   ├── checkout/            # Checkout process
│   └── account/             # User account pages
├── components/              # React components
│   ├── admin/              # Admin-specific components
│   ├── auth/               # Authentication components
│   ├── layout/             # Layout components (header, footer)
│   ├── products/           # Product components
│   └── ui/                 # shadcn/ui components
├── lib/                     # Utility functions and types
│   ├── types/              # TypeScript type definitions
│   ├── auth-context.tsx    # Authentication context
│   ├── cart-context.tsx    # Shopping cart context
│   ├── db-utils.ts         # Database utility functions
│   └── mock-data.ts        # Mock data for development
├── scripts/                 # Database scripts
│   └── 01-create-tables.sql # Database schema
└── public/                  # Static assets
\`\`\`

## Database Setup

When you're ready to connect a real database:

1. **Choose your database provider**:
   - Supabase (recommended)
   - Neon
   - PostgreSQL

2. **Run the database schema**:
   - Execute the SQL script in `scripts/01-create-tables.sql`

3. **Update environment variables**:
   - Add your database connection string
   - Update `lib/db-utils.ts` to use real database queries

4. **Update authentication**:
   - Replace mock auth in `lib/auth-context.tsx` with Supabase Auth
   - Follow the commented instructions in the code

## Payment Integration

To enable real payments with Stripe:

1. Sign up for a Stripe account
2. Add Stripe keys to environment variables:
   \`\`\`
   STRIPE_SECRET_KEY=your_secret_key
   STRIPE_PUBLISHABLE_KEY=your_publishable_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
   \`\`\`
3. Update checkout flow in `app/checkout/page.tsx`

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- AWS
- Google Cloud
- Azure
- Railway
- Render

## Environment Variables

Create a `.env.local` file with the following variables:

\`\`\`env
# Database (when connected)
DATABASE_URL=your_database_url

# Authentication (when using Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Payments (when using Stripe)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
\`\`\`

## Features Roadmap

- [ ] Real-time inventory updates
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Multi-currency support
- [ ] Product variants (size, color, etc.)
- [ ] Advanced search with filters
- [ ] Product recommendations
- [ ] Email notifications
- [ ] Social media integration
- [ ] Customer reviews and ratings
- [ ] Wishlist sharing
- [ ] Gift cards
- [ ] Subscription products

## Security Considerations

- All passwords should be hashed (implement with bcrypt)
- Use HTTPS in production
- Implement rate limiting for API routes
- Add CSRF protection
- Sanitize user inputs
- Implement proper error handling
- Use environment variables for sensitive data
- Enable Row Level Security (RLS) in database

## Performance Optimization

- Images are optimized with Next.js Image component
- Lazy loading for images and components
- Code splitting with dynamic imports
- Caching strategies for API responses
- Database query optimization with indexes

## Contributing

This is a template project. Feel free to customize and extend it for your needs.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please refer to the Next.js documentation or create an issue in your repository.
