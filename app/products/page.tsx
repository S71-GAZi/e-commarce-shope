import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductCard } from "@/components/products/product-card"
import { Button } from "@/components/ui/button"
import { getProducts, getCategories } from "@/lib/db-utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; featured?: string }>
}) {
  const params = await searchParams
  const products = await getProducts({
    search: params.search,
    category: params.category,
    featured: params.featured === "true",
  })
  const categories = await getCategories()

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Products</h1>
          <p className="text-muted-foreground">
            {params.search ? `Search results for "${params.search}"` : "Browse our collection"}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox id={category.id} />
                    <Label htmlFor={category.id} className="text-sm cursor-pointer">
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Price Range</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="under-50" />
                  <Label htmlFor="under-50" className="text-sm cursor-pointer">
                    Under $50
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="50-100" />
                  <Label htmlFor="50-100" className="text-sm cursor-pointer">
                    $50 - $100
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="100-200" />
                  <Label htmlFor="100-200" className="text-sm cursor-pointer">
                    $100 - $200
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="over-200" />
                  <Label htmlFor="over-200" className="text-sm cursor-pointer">
                    Over $200
                  </Label>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Rating</h3>
              <div className="space-y-2">
                {[4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <Checkbox id={`rating-${rating}`} />
                    <Label htmlFor={`rating-${rating}`} className="text-sm cursor-pointer">
                      {rating}+ Stars
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {products.length} {products.length === 1 ? "product" : "products"} found
              </p>

              <Select defaultValue="newest">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No products found</p>
                <Button asChild>
                  <a href="/products">View All Products</a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
