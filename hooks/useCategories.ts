"use client"

import { useCallback, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import type { ICategory } from "@/lib/types/database"

export function useCategories() {
    const { toast } = useToast()
    const [categories, setCategories] = useState<ICategory[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const fetchCategories = useCallback(async () => {
        try {
            setIsLoading(true)

            const res = await fetch("/api/admin/categories")
            const result = await res.json()

            if (!res.ok) {
                toast({
                    title: "Error",
                    description: result?.error || "Failed to load categories",
                    variant: "destructive",
                })
                return
            }

            const categoriesArray =
                Array.isArray(result)
                    ? result
                    : Array.isArray(result?.data?.categories)
                        ? result.data.categories
                        : []

            setCategories(categoriesArray)
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong while loading categories",
                variant: "destructive",
            })
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }, [toast])

    return {
        categories,
        isLoading,
        fetchCategories,
        setCategories, // optional (useful sometimes)
    }
}
