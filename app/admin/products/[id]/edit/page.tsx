// "use client"

// import type React from "react"
// import { useState, useEffect, useCallback } from "react"
// import { useRouter, useParams } from "next/navigation"
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Switch } from "@/components/ui/switch"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import { useToast } from "@/hooks/use-toast"
// import { Loader2, ArrowLeft, Upload } from "lucide-react"
// import Link from "next/link"
// import { useFetchById } from "@/hooks/useFetchById"
// import { useFetchResource } from "@/hooks/useFetchResource"
// import type { IProduct, ICategory } from "@/lib/types/database"

// export default function EditProductPage() {
//   const router = useRouter()
//   const params = useParams()
//   const { toast } = useToast()

//   const productId = params.id as string
//   const { data: product } = useFetchById<IProduct>({
//     url: `/api/products/${productId}`,
//     extractData: (res) => res.data,
//   })

//   const [isLoading, setIsLoading] = useState(false)
//   const [images, setImages] = useState<File[]>([])
//   const [existingImages, setExistingImages] = useState<string[]>([])
//   const [active, setActive] = useState(true)
//   const [featured, setFeatured] = useState(false)
//   const [category, setCategory] = useState("")


//   const { data: categories } = useFetchResource<ICategory>({
//     url: "/api/admin/categories",
//     extractData: (res) =>
//       Array.isArray(res)
//         ? res
//         : Array.isArray(res?.data?.categories)
//           ? res.data.categories
//           : [],
//   })

//   // Load product data
//   useEffect(() => {
//     if (product) {
//       setActive(product.is_active)
//       setFeatured(product.is_featured)
//       setCategory(String(product.category_id || ""))
//       setExistingImages(product.images || [])
//     }
//   }, [product])

//   // Image handler
//   const handleFiles = useCallback(
//     (files: FileList | null) => {
//       if (!files) return
//       const newFiles = Array.from(files)

//       if (images.length + newFiles.length > 4) {
//         toast({
//           title: "Too many images",
//           description: "Max 4 images allowed",
//           variant: "destructive",
//         })
//         return
//       }

//       for (let file of newFiles) {
//         if (file.size > 600 * 1024) {
//           toast({
//             title: "File too large",
//             description: `${file.name} exceeds 600KB`,
//             variant: "destructive",
//           })
//           return
//         }
//       }

//       setImages((prev) => [...prev, ...newFiles])
//     },
//     [images, toast]
//   )

//   const removeImage = (index: number) => {
//     setImages((prev) => prev.filter((_, i) => i !== index))
//   }

//   const removeExistingImage = (index: number) => {
//     setExistingImages((prev) => prev.filter((_, i) => i !== index))
//   }

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault()
//     setIsLoading(true)

//     try {
//       const formData = new FormData(e.currentTarget)

//       const name = (formData.get("name") as string) || ""

//       const slug = name
//         .toLowerCase()
//         .trim()
//         .replace(/[^a-z0-9\s-]/g, "")
//         .replace(/\s+/g, "-")

//       formData.append("slug", slug)

//       formData.set("short_description", (formData.get("shortDescription") as string) || "")
//       formData.set("seo_title", (formData.get("seoTitle") as string) || "")
//       formData.set("seo_description", (formData.get("seoDescription") as string) || "")
//       formData.set("compare_at_price", formData.get("comparePrice")?.toString() || "0")
//       formData.set("cost_price", formData.get("costPrice")?.toString() || "0")

//       images.forEach((img) => formData.append("images", img))

//       formData.append("existingImages", JSON.stringify(existingImages))

//       formData.append("category_id", category)
//       formData.append("is_active", active ? "1" : "0")
//       formData.append("is_featured", featured ? "1" : "0")

//       const response = await fetch(`/api/products/${productId}`, {
//         method: "PATCH",
//         body: formData,
//       })

//       const data = await response.json()

//       if (!response.ok) {
//         throw new Error(data.error || "Update failed")
//       }

//       toast({
//         title: "Product updated",
//         description: "Product updated successfully",
//       })

//       router.push("/admin/products")
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message,
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   if (!product) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center gap-4">
//         <Button variant="ghost" size="icon" asChild>
//           <Link href="/admin/products">
//             <ArrowLeft className="h-4 w-4" />
//           </Link>
//         </Button>
//         <div>
//           <h1 className="text-3xl font-bold">Edit Product</h1>
//           <p className="text-muted-foreground">
//             Update product information
//           </p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit}>
//         <div className="grid gap-6 lg:grid-cols-3">
//           <div className="lg:col-span-2 space-y-6">

//             {/* Product Info */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Product Information</CardTitle>
//                 <CardDescription>Basic details</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <Input name="name" defaultValue={product.name} required />
//                 <Textarea
//                   name="description"
//                   defaultValue={product.description || ""}
//                 />
//                 <Textarea
//                   name="shortDescription"
//                   defaultValue={product.short_description || ""}
//                 />
//               </CardContent>
//             </Card>

//             {/* Images */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Product Images</CardTitle>
//               </CardHeader>
//               <CardContent>

//                 <div
//                   className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer"
//                   onClick={() =>
//                     document.getElementById("product-images")?.click()
//                   }
//                 >
//                   <Upload className="h-10 w-10 mx-auto mb-3" />
//                   <p>Click or drag images</p>

//                   <input
//                     type="file"
//                     id="product-images"
//                     multiple
//                     accept="image/*"
//                     className="hidden"
//                     onChange={(e) =>
//                       handleFiles(e.target.files)
//                     }
//                   />
//                 </div>

//                 {/* Existing */}
//                 {existingImages.length > 0 && (
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
//                     {existingImages.map((img, index) => (
//                       <div key={index} className="relative h-32 border rounded overflow-hidden">
//                         <button
//                           type="button"
//                           onClick={() => removeExistingImage(index)}
//                           className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
//                         >
//                           ✕
//                         </button>
//                         <img
//                           src={img}
//                           className="w-full h-full object-cover"
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {/* New */}
//                 {images.length > 0 && (
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
//                     {images.map((file, index) => (
//                       <div key={index} className="relative h-32 border rounded overflow-hidden">
//                         <button
//                           type="button"
//                           onClick={() => removeImage(index)}
//                           className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
//                         >
//                           ✕
//                         </button>
//                         <img
//                           src={URL.createObjectURL(file)}
//                           className="w-full h-full object-cover"
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 )}

//               </CardContent>
//             </Card>

//           </div>
//         </div>

//         <Button type="submit" disabled={isLoading}>
//           {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//           Update Product
//         </Button>
//       </form>
//     </div>
//   )
// }

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
