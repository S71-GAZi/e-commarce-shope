"use client"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CategoryGrid } from "@/components/home/category-grid"
import { useFetchResource } from "@/hooks/useFetchResource";
import { useEffect } from "react";
import { ICategory } from "@/lib/types/intrerface";

export const dynamic = "force-dynamic";


export default async function CategoriesPage() {
  const {
    data: categories,
    isLoading,
    fetchData: fetchCategories,
  } = useFetchResource<ICategory>({
    url: "/api/admin/categories",
    extractData: (result) =>
      Array.isArray(result)
        ? result
        : Array.isArray(result?.data?.categories)
          ? result.data.categories
          : [],
  })

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

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
