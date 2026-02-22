//export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server"
import { getTokenFromRequest, isAdmin, errorResponse, successResponse } from "@/lib/api/middleware"
import { validateRequestBody, UpdateProductSchema } from "@/lib/api/validation"
import { productQueries } from "@/lib/db/queries"
import { getUserFromToken } from "@/lib/jwt"
import path from "path"
import fs from "fs"
type RouteParams = { params: { id: string } }

// GET /api/products/[id] - Get product by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    console.log(id)
    const product = await productQueries.findById(id)

    if (!product) {
      return errorResponse("Product not found", 404)
    }

    return successResponse(product)
  } catch (error) {
    console.error("Get product error:", error)
    return errorResponse("Failed to fetch product", 500)
  }
}

// PATCH /api/products/[id] - Update product (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ✅ Auth check
    const token = getTokenFromRequest(req)
    const user = token ? getUserFromToken(token) : null
    if (!user || !isAdmin(user)) return errorResponse("Unauthorized", 401)

    const { id } = params
    const existingProduct = await productQueries.findById(id)
    if (!existingProduct) return errorResponse("Product not found", 404)

    // ✅ Parse FormData
    const formData = await req.formData()

    const uploadDir = path.join(process.cwd(), "public/uploads/products")
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

    // ✅ Existing images from client
    const existingImages: string[] = JSON.parse(
      (formData.get("existingImages") as string) || "[]"
    )

    // ✅ Normalize DB images
    let dbImages: string[] = []
    if (Array.isArray(existingProduct.images)) {
      dbImages = existingProduct.images
    } else if (typeof existingProduct.images === "string") {
      try {
        dbImages = JSON.parse(existingProduct.images)
      } catch {
        dbImages = []
      }
    }

    const newImages: string[] = []

    // ✅ Upload new images
    for (const file of formData.getAll("images") as File[]) {
      if (!(file instanceof File)) continue

      if (file.size > 600 * 1024)
        return errorResponse(`File "${file.name}" exceeds 600KB`, 400)

      const buffer = Buffer.from(await file.arrayBuffer())
      const filePath = path.join(uploadDir, `${Date.now()}_${file.name}`)
      fs.writeFileSync(filePath, buffer)

      newImages.push(`/uploads/products/${path.basename(filePath)}`)
    }

    // ✅ Merge images
    const finalImages = [...existingImages, ...newImages]
    console.log("DB Images:", finalImages)
    if (finalImages.length > 4)
      return errorResponse("Maximum 4 images allowed", 400)

    // ✅ Delete removed images from disk
    const removedImages = dbImages.filter((img) => !existingImages.includes(img))
    for (const img of removedImages) {
      const filePath = path.join(process.cwd(), "public", img)
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }

    // ✅ Build update payload
    const productData: any = {
      name: formData.get("name"),
      slug: formData.get("slug") || null,
      images: finalImages, // save as array, productQueries.update should handle JSON.stringify
      description: formData.get("description") || null,
      short_description: formData.get("short_description") || null,
      category_id: formData.get("category_id") || null,
      price: formData.get("price") ? parseFloat(formData.get("price") as string) : null,
      compare_at_price: formData.get("compare_at_price")
        ? parseFloat(formData.get("compare_at_price") as string)
        : null,
      cost_price: formData.get("cost_price")
        ? parseFloat(formData.get("cost_price") as string)
        : null,
      sku: formData.get("sku") || null,
      barcode: formData.get("barcode") || null,
      stock_quantity: formData.get("stock_quantity")
        ? parseInt(formData.get("stock_quantity") as string)
        : 0,
      low_stock_threshold: formData.get("low_stock_threshold")
        ? parseInt(formData.get("low_stock_threshold") as string)
        : 0,
      weight: formData.get("weight") ? parseFloat(formData.get("weight") as string) : null,
      length: formData.get("length") ? parseFloat(formData.get("length") as string) : null,
      width: formData.get("width") ? parseFloat(formData.get("width") as string) : null,
      height: formData.get("height") ? parseFloat(formData.get("height") as string) : null,
      unit: formData.get("unit") || null,
      seo_title: formData.get("seo_title") || null,
      seo_description: formData.get("seo_description") || null,
      is_active: formData.get("is_active") === "1",
      is_featured: formData.get("is_featured") === "1",
    }

    // ✅ Validate
    const validation = UpdateProductSchema.safeParse(productData)
    if (!validation.success) return errorResponse(validation.error.message, 400)

    // ✅ Update DB
    const updatedProduct = await productQueries.update(id, {
      ...validation.data,
      images: JSON.stringify(finalImages), // save JSON string in DB
    })

    return successResponse(updatedProduct)
  } catch (err) {
    console.error("Update product error:", err)
    return errorResponse(err instanceof Error ? err.message : "Failed to update product", 500)
  }
}

// DELETE /api/products/[id] - Delete product (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? getUserFromToken(token) : null

    if (!user || !isAdmin(user)) {
      return errorResponse("Unauthorized", 401)
    }

    const { id } = params

    const product = await productQueries.findById(id)
    if (!product) {
      return errorResponse("Product not found", 404)
    }

    await productQueries.delete(id)

    return successResponse({ id, message: "Product deleted successfully" })
  } catch (error) {
    console.error("Delete product error:", error)
    return errorResponse("Failed to delete product", 500)
  }
}
