"use client"

import { useFetchResource } from "@/hooks/useFetchResource"
import { ICategory } from "@/lib/types/intrerface"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"

const ProductCatrgory = () => {
    const router = useRouter()
    const searchParams = useSearchParams()

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

    const [selected, setSelected] = useState<string[]>([])

    // fetch categories
    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    // update selected based on URL
    useEffect(() => {
        const params = searchParams.getAll("category") // returns array
        setSelected(params)
    }, [searchParams])

    // handle checkbox toggle
    const handleChange = (slug: string, checked: boolean) => {
        let newSelected: string[] = []

        if (checked) {
            // add
            newSelected = [...selected, slug]
        } else {
            // remove
            newSelected = selected.filter((s) => s !== slug)
        }

        setSelected(newSelected)

        // update URL params
        const params = new URLSearchParams(searchParams.toString())

        // remove all category params
        params.delete("category")

        // add updated categories
        newSelected.forEach((s) => params.append("category", s))

        // navigate to updated URL
        router.push(`/products?${params.toString()}`)
    }

    return (
        <div className="space-y-2">
            {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                        id={category.id}
                        checked={selected.includes(category.slug)}
                        onCheckedChange={(checked) =>
                            handleChange(category.slug, checked === true)
                        }
                    />
                    <Label htmlFor={category.id} className="text-sm cursor-pointer">
                        {category.name}
                    </Label>
                </div>
            ))}
        </div>
    )
}

export default ProductCatrgory