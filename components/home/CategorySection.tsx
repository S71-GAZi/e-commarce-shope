"use client"
import { ArrowRight, Link } from "lucide-react";
import { Button } from "../ui/button";
import { CategoryGrid } from "./category-grid";
import { useFetchResource } from "@/hooks/useFetchResource";
import { ICategory } from "@/lib/types/intrerface";
import { useEffect } from "react";

const CategoriesSection = () => {
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
        <section className="container mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">Shop by Category</h2>
                <Button variant="ghost" asChild>
                    <Link href="/categories">
                        View All
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
            <CategoryGrid categories={categories} />
        </section>
    )
}
export default CategoriesSection