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
import { Loader2, ArrowLeft, Upload } from "lucide-react"
import Link from "next/link"
import { useCategories } from "@/hooks/useCategories"
// import { mockCategories } from "@/lib/mock-data"

export default function NewProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])

  // ✅ Handle file selection or drop
  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return

      const newFiles = Array.from(files)

      // 🔹 Check max number of images
      if (images.length + newFiles.length > 4) {
        toast({
          title: "Too many images",
          description: "You can only upload up to 4 images.",
          variant: "destructive",
        })
        return
      }

      // 🔹 Check max size 600KB per image
      for (let file of newFiles) {
        if (file.size > 600 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds 600KB.`,
            variant: "destructive",
          })
          return
        }
      }

      // ✅ Add valid images
      setImages((prev) => [...prev, ...newFiles])
    },
    [images, toast]
  )

  // ✅ Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  // ✅ Handle drag & drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  // ✅ Remove single image
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }


  const {
    categories,
    fetchCategories
  } = useCategories()

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      images.forEach((image) => formData.append("images", image))


      formData.append("name", formData.get("name") as string)
      formData.append("slug", formData.get("slug") as string)
      formData.append("description", formData.get("description") as string)
      formData.append("short_description", formData.get("shortDescription") as string)
      formData.append("category_id", formData.get("category") as string)
      formData.append("price", String(formData.get("price")))
      formData.append("compare_price", String(formData.get("comparePrice") || ""))
      formData.append("cost_price", String(formData.get("costPrice") || ""))
      formData.append("sku", formData.get("sku") as string)
      formData.append("barcode", formData.get("barcode") as string)
      formData.append("stock_quantity", String(formData.get("stock")))
      formData.append("low_stock", String(formData.get("lowStock")))
      formData.append("weight", String(formData.get("weight") || ""))
      formData.append("length", String(formData.get("length") || ""))
      formData.append("width", String(formData.get("width") || ""))
      formData.append("height", String(formData.get("height") || ""))
      formData.append("unit", formData.get("unit") as string)
      formData.append("is_active", "true")
      formData.append("is_featured", formData.get("featured") ? "true" : "false")
      formData.append("seo_title", formData.get("seoTitle") as string)
      formData.append("seo_description", formData.get("seoDescription") as string)
      // ✅ Fetch request
      const response = await fetch("/api/products", {
        method: "POST",
        body: formData, // multipart/form-data automatically set by browser
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to create product",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Product created",
        description: "Your product has been created successfully.",
      })

      router.push("/admin/products")
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while creating the product",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }


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
          <h1 className="text-3xl font-bold">Add New Product</h1>
          <p className="text-muted-foreground">Create a new product in your catalog</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
                <CardDescription>Basic details about the product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" name="name" placeholder="Enter product name" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Enter product description" rows={5} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Textarea id="shortDescription" name="shortDescription" placeholder="Brief product summary" rows={2} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>Upload product images</CardDescription>
              </CardHeader>

              <CardContent>
                <div>
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
                      Max 4 images, each ≤ 600 KB
                    </p>

                    {/* Hidden input */}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      id="product-images"
                      className="hidden"
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* ✅ Preview */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      {images.map((file, index) => (
                        <div
                          key={index}
                          className="relative w-full h-32 rounded-md overflow-hidden border"
                        >
                          {/* ❌ Remove button */}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 z-10 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ❌
                          </button>

                          <img
                            src={URL.createObjectURL(file)}
                            alt={`preview-${index}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>


            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
                <CardDescription>Set product pricing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input id="price" name="price" type="number" step="0.01" placeholder="0.00" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comparePrice">Compare at Price</Label>
                    <Input id="comparePrice" name="comparePrice" type="number" step="0.01" placeholder="0.00" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costPrice">Cost per Item</Label>
                  <Input id="costPrice" name="costPrice" type="number" step="0.01" placeholder="0.00" />
                  <p className="text-xs text-muted-foreground">Customers won't see this</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
                <CardDescription>Manage product inventory</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" name="sku" placeholder="PROD-001" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode">Barcode</Label>
                    <Input id="barcode" name="barcode" placeholder="123456789" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Track Inventory</Label>
                    <p className="text-sm text-muted-foreground">Monitor stock levels</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input id="stock" name="stock" type="number" defaultValue="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lowStock">Low Stock Threshold</Label>
                    <Input id="lowStock" name="lowStock" type="number" defaultValue="10" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipping</CardTitle>
                <CardDescription>Product dimensions and weight</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input id="weight" name="weight" type="number" step="0.01" placeholder="0.00" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="length">Length (cm)</Label>
                    <Input id="length" name="length" type="number" step="0.01" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="width">Width (cm)</Label>
                    <Input id="width" name="width" type="number" step="0.01" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input id="height" name="height" type="number" step="0.01" placeholder="0" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="active">Active</Label>
                  <Switch id="active" name="active" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="featured">Featured</Label>
                  <Switch id="featured" name="featured" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger id="category" name="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
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
                  <Input id="seoTitle" name="seoTitle" placeholder="Product title for search engines" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <Textarea id="seoDescription" name="seoDescription" placeholder="Product description for search engines" rows={3} />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Product
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
