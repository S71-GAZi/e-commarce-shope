"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft, Upload, X } from "lucide-react"
import Link from "next/link"
import { useFetchResource } from "@/hooks/useFetchResource"
import { ICategory, IProduct } from "@/lib/types/intrerface"

interface ProductFormProps {
  /** Pass existing product to enable edit mode */
  product?: IProduct
}

export default function ProductForm({ product }: ProductFormProps) {
  const isEditMode = !!product
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)

  // New images to upload (File objects)
  const [newImages, setNewImages] = useState<File[]>([])

  // Existing image URLs from the product (edit mode)
  const extractImageUrls = (images: unknown): string[] => {
    let parsed = images
    if (typeof parsed === "string") {
      try { parsed = JSON.parse(parsed) } catch { return [] }
    }
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((img) => (typeof img === "string" ? img : (img as { url: string })?.url ?? ""))
      .filter(Boolean)
  }

  const [existingImages, setExistingImages] = useState<string[]>(
    extractImageUrls(product?.images)
  )

  // IDs of existing images the user wants to remove (edit mode)
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([])

  const [active, setActive] = useState(product?.is_active ?? true)
  const [featured, setFeatured] = useState(product?.is_featured ?? false)
  const [category, setCategory] = useState(product?.category_id ? String(product.category_id) : "")

  // Keep switches in sync if product loads asynchronously
  useEffect(() => {
    if (product) {
      setActive(product.is_active ?? true)
      setFeatured(product.is_featured ?? false)
      setCategory(product.category_id ? String(product.category_id) : "")
      setExistingImages(extractImageUrls(product.images))
    }
  }, [product])

  // ─── Image helpers ────────────────────────────────────────────────────────

  const totalImageCount = existingImages.length + newImages.length

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return
      const incoming = Array.from(files)

      if (totalImageCount + incoming.length > 4) {
        toast({
          title: "Too many images",
          description: "You can only have up to 4 images in total.",
          variant: "destructive",
        })
        return
      }

      for (const file of incoming) {
        if (file.size > 600 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds 600 KB.`,
            variant: "destructive",
          })
          return
        }
      }

      setNewImages((prev) => [...prev, ...incoming])
    },
    [totalImageCount, toast]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault()

  const removeNewImage = (index: number) =>
    setNewImages((prev) => prev.filter((_, i) => i !== index))

  const removeExistingImage = (urlOrId: string, index: number) => {
    // Track removed ID for the API
    setRemovedImageIds((prev) => [...prev, urlOrId])
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  // ─── Categories ───────────────────────────────────────────────────────────

  const { data: categories, fetchData: fetchCategories } = useFetchResource<ICategory>({
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

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)

      const name = (formData.get("name") as string) || ""
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")

      formData.append("slug", slug)
      formData.set("short_description", (formData.get("shortDescription") as string) || "")
      formData.set("seo_title", (formData.get("seoTitle") as string) || "")
      formData.set("seo_description", (formData.get("seoDescription") as string) || "")
      formData.set("unit", "cm")
      formData.set("compare_at_price", formData.get("comparePrice")?.toString() || "0")
      formData.set("cost_price", formData.get("costPrice")?.toString() || "0")

      if (!category) {
        toast({
          title: "Category required",
          description: "Please select a category.",
          variant: "destructive",
        })
        return
      }

      formData.append("category_id", category)
      formData.append("is_active", active ? "1" : "0")
      formData.append("is_featured", featured ? "1" : "0")

      // New image files
      newImages.forEach((image) => formData.append("images", image))
      if (isEditMode) {
        formData.append("existingImages", JSON.stringify(existingImages))
      }
      // IDs/URLs of removed existing images (edit mode)
      if (isEditMode && removedImageIds.length > 0) {
        removedImageIds.forEach((id) => formData.append("removed_image_ids", id))
      }

      const url = isEditMode ? `/api/products/${product!.id}` : "/api/products"
      const method = isEditMode ? "PATCH" : "POST"

      const response = await fetch(url, { method, body: formData })
      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || `Failed to ${isEditMode ? "update" : "create"} product`,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: `Product ${isEditMode ? "updated" : "created"} successfully`,
      })

      router.push("/admin/products")
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // ─── UI ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode
              ? "Update the details of this product"
              : "Create a new product in your catalog"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* ── Main Content ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Product Information */}
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
                <CardDescription>Basic details about the product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter product name"
                    defaultValue={product?.name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter product description"
                    rows={5}
                    defaultValue={product?.description}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Textarea
                    id="shortDescription"
                    name="shortDescription"
                    placeholder="Brief product summary"
                    rows={2}
                    defaultValue={product?.short_description}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>Upload up to 4 images (max 600 KB each)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Drop zone — hide when limit reached */}
                {totalImageCount < 4 && (
                  <div
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => document.getElementById("product-images")?.click()}
                  >
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop images here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {4 - totalImageCount} slot{4 - totalImageCount !== 1 ? "s" : ""} remaining · each ≤ 600 KB
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      id="product-images"
                      className="hidden"
                      onChange={handleInputChange}
                    />
                  </div>
                )}

                {/* Image previews */}
                {totalImageCount > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Existing images (edit mode) */}
                    {existingImages.map((url, index) => (
                      <div
                        key={`existing-${index}`}
                        className="relative w-full h-32 rounded-md overflow-hidden border"
                      >
                        <button
                          type="button"
                          onClick={() => removeExistingImage(url, index)}
                          className="absolute top-1 right-1 z-10 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                          aria-label="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <img
                          src={url}
                          alt={`existing-${index}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}

                    {/* New image previews */}
                    {newImages.map((file, index) => (
                      <div
                        key={`new-${index}`}
                        className="relative w-full h-32 rounded-md overflow-hidden border"
                      >
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-1 right-1 z-10 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                          aria-label="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`new-${index}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
                <CardDescription>Set product pricing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      defaultValue={product?.price}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comparePrice">Compare at Price</Label>
                    <Input
                      id="comparePrice"
                      name="comparePrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      defaultValue={product?.compare_at_price}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="costPrice">Cost per Item</Label>
                  <Input
                    id="costPrice"
                    name="costPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    defaultValue={product?.cost_price}
                  />
                  <p className="text-xs text-muted-foreground">Customers won't see this</p>
                </div>
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
                <CardDescription>Manage product inventory</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      name="sku"
                      placeholder="PROD-001"
                      defaultValue={product?.sku}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode">Barcode</Label>
                    <Input
                      id="barcode"
                      name="barcode"
                      placeholder="123456789"
                      defaultValue={product?.barcode}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Track Inventory</Label>
                    <p className="text-sm text-muted-foreground">Monitor stock levels</p>
                  </div>
                  <Switch defaultChecked={product?.track_inventory ?? true} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      name="stock_quantity"
                      type="number"
                      defaultValue={product?.stock_quantity ?? 0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lowStock">Low Stock Threshold</Label>
                    <Input
                      id="lowStock"
                      name="low_stock_threshold"
                      type="number"
                      defaultValue={product?.low_stock_threshold ?? 10}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping</CardTitle>
                <CardDescription>Product dimensions and weight</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    defaultValue={product?.weight}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="length">Length (cm)</Label>
                    <Input
                      id="length"
                      name="length"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      defaultValue={product?.length}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="width">Width (cm)</Label>
                    <Input
                      id="width"
                      name="width"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      defaultValue={product?.width}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      defaultValue={product?.height}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch checked={active} onCheckedChange={setActive} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Featured</Label>
                  <Switch checked={featured} onCheckedChange={setFeatured} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
                <CardDescription>Search engine optimization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    name="seoTitle"
                    placeholder="Product title for search engines"
                    defaultValue={product?.seo_title}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <Textarea
                    id="seoDescription"
                    name="seoDescription"
                    placeholder="Product description for search engines"
                    rows={3}
                    defaultValue={product?.seo_description}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Save Changes" : "Create Product"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/products">Cancel</Link>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
