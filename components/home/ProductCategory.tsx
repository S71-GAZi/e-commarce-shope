"use client"
import { useFetchResource } from "@/hooks/useFetchResource"
import { ICategory } from "@/lib/types/intrerface"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useEffect } from "react"

const ProductCatrgory = () => {
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
    )
}
export default ProductCatrgory