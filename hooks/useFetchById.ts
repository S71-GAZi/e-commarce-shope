"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface FetchByIdOptions<T> {
    url: string
    extractData?: (response: any) => T
    autoFetch?: boolean
}

export function useFetchById<T>({
    url,
    extractData,
    autoFetch = true,
}: FetchByIdOptions<T>) {
    const { toast } = useToast()
    const [data, setData] = useState<T | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // store extractData in ref (same pattern)
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
                : result?.data || result

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
    }, [url, toast])

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