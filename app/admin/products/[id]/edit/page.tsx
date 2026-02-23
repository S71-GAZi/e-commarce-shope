"use client"
export const dynamic = "force-dynamic"

import { useParams } from "next/navigation"
import { useFetchById } from "@/hooks/useFetchById"
import { IProduct } from "@/lib/types/intrerface"
import { Loader2 } from "lucide-react"
import ProductForm from "@/components/products/ProductForm"

export default function EditProductPage() {
  const params = useParams()
  const productId = params.id as string

  const { data: product, isLoading } = useFetchById<IProduct>({
    url: `/api/products/${productId}`,
    extractData: (res) => res.data,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <ProductForm product={product ?? undefined} />
}
