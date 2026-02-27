"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Label } from "../ui/label"

const priceOptions = [
    { id: "under-50", label: "Under $50", min: 0, max: 50 },
    { id: "50-100", label: "$50 - $100", min: 50, max: 100 },
    { id: "100-200", label: "$100 - $200", min: 100, max: 200 },
    { id: "over-200", label: "Over $200", min: 200, max: undefined },
]

export default function ProductPrice() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [selectedId, setSelectedId] = useState<string | null>(null)

    // Update selected based on URL
    useEffect(() => {
        const minPrice = searchParams.get("minPrice")
        const maxPrice = searchParams.get("maxPrice")
        const matched = priceOptions.find((p) => {
            const minMatch = p.min === Number(minPrice)
            const maxMatch =
                (p.max === undefined && !maxPrice) || p.max === Number(maxPrice)
            return minMatch && maxMatch
        })
        setSelectedId(matched?.id ?? null)
    }, [searchParams])

    const handleChange = (optionId: string) => {
        const option = priceOptions.find((p) => p.id === optionId)
        if (!option) return

        const newSelected = selectedId === optionId ? null : optionId
        setSelectedId(newSelected)

        const params = new URLSearchParams(searchParams.toString())

        // Remove old price filters
        params.delete("minPrice")
        params.delete("maxPrice")

        if (newSelected) {
            params.set("minPrice", option.min.toString())
            if (option.max !== undefined) params.set("maxPrice", option.max.toString())
        }

        router.push(`/products?${params.toString()}`)
    }

    return (
        <div className="space-y-2">
            {priceOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                    <input
                        type="radio"
                        id={option.id}
                        name="price"
                        className="w-4 h-4 accent-primary cursor-pointer"
                        checked={selectedId === option.id}
                        onChange={() => handleChange(option.id)}
                    />
                    <Label htmlFor={option.id} className="text-sm cursor-pointer">
                        {option.label}
                    </Label>
                </div>
            ))}
        </div>
    )
}