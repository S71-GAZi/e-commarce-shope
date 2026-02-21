import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CategoryGrid } from "@/components/home/category-grid"
import { getCategories } from "@/lib/db-utils"

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Categories - E-Commerce Store",
  description: "Browse products by category",
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Shop by Category</h1>
          <p className="text-muted-foreground">Explore our wide range of product categories</p>
        </div>

        <CategoryGrid categories={categories} />
      </main>

      <Footer />
    </div>
  )
}
