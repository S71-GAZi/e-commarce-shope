"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface FetchOptions<T> {
    url: string
    extractData?: (response: any) => T[]
    autoFetch?: boolean
}

export function useFetchResource<T>({
    url,
    extractData,
    autoFetch = true,
}: FetchOptions<T>) {
    const { toast } = useToast()
    const [data, setData] = useState<T[]>([])
    const [isLoading, setIsLoading] = useState(false)

    // 👇 store extractData in ref so it doesn't trigger re-render
    const extractRef = useRef(extractData)
    extractRef.current = extractData

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true)

            const res = await fetch(url)
            const result = await res.json()

            if (!res.ok) {
                throw new Error(result?.error || "Failed to load data")
            }

            const finalData = extractRef.current
                ? extractRef.current(result)
                : Array.isArray(result)
                    ? result
                    : result?.data || []

            setData(finalData)
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [url, toast]) // ❌ extractData removed

    useEffect(() => {
        if (autoFetch) {
            fetchData()
        }
    }, [autoFetch, fetchData])

    return {
        data,
        setData,
        isLoading,
        fetchData,
    }
}