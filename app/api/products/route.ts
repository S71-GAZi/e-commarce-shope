//export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server"
// import { getProducts } from "@/lib/db-utils"

import {
  getTokenFromRequest,
  isAdmin,
  errorResponse,
  successResponse,
  getPaginationParams,
} from "@/lib/api/middleware"
import { validateRequestBody, CreateProductSchema } from "@/lib/api/validation"
import { productQueries } from "@/lib/db/queries"
import { getUserFromToken } from "@/lib/jwt"
import path from "path"
import fs from "fs"

// GET /api/products - Get all products
export async function GET(request: NextRequest) {
  try {
    const { limit, offset } = getPaginationParams(request)
    const category = request.nextUrl.searchParams.get("category")
    const search = request.nextUrl.searchParams.get("search")
    const featured = request.nextUrl.searchParams.get("featured") === "true"

    const products = await productQueries.getAllProducts(limit, offset, {
      category_id: category || undefined,
      is_active: featured !== undefined ? true : undefined, // if "featured" means active products
    })
    return successResponse({
      products,
      pagination: {
        limit,
        offset,
        total: products.length,
      },
    })
  } catch (error) {
    return errorResponse("Failed to fetch products", 500)
  }
}


//export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  try {
    // ✅ Auth check
    const token = getTokenFromRequest(req);
    const user = token ? getUserFromToken(token) : null;
    if (!user || !isAdmin(user)) return errorResponse("Unauthorized", 401);

    // ✅ Parse FormData
    const formData = await req.formData();
    // Extract images
    const images: string[] = [];
    const uploadDir = path.join(process.cwd(), "public/uploads/products");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    for (const file of formData.getAll("images") as File[]) {
      if (!(file instanceof File)) continue;

      // Max size 600kb
      if (file.size > 600 * 1024)
        return errorResponse(`File "${file.name}" exceeds max size of 600KB`, 400);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const filePath = path.join(uploadDir, `${Date.now()}_${file.name}`);
      fs.writeFileSync(filePath, buffer);

      images.push(`/uploads/products/${path.basename(filePath)}`);
    }

    // Max 4 images
    if (images.length > 4) return errorResponse("Maximum 4 images allowed", 400);

    // Extract other fields
    const productData: any = {
      name: formData.get("name"),
      slug: formData.get("slug") || null,
      images,
      description: formData.get("description") || null,
      short_description: formData.get("short_description") || null,
      category_id: formData.get("category_id") || null,
      price: formData.get("price") ? parseFloat(formData.get("price") as string) : null,
      compare_at_price: formData.get("compare_at_price") ? parseFloat(formData.get("compare_at_price") as string) : null,
      cost_price: formData.get("cost_price") ? parseFloat(formData.get("costPrice") as string) : null,
      sku: formData.get("sku") || null,
      barcode: formData.get("barcode") || null,
      stock_quantity: formData.get("stock_quantity") ? parseInt(formData.get("stock") as string) : 0,
      low_stock_threshold: formData.get("low_stock_threshold") ? parseInt(formData.get("low_stock_threshold") as string) : 0,
      weight: formData.get("weight") ? parseFloat(formData.get("weight") as string) : null,
      length: formData.get("length") ? parseFloat(formData.get("length") as string) : null,
      width: formData.get("width") ? parseFloat(formData.get("width") as string) : null,
      height: formData.get("height") ? parseFloat(formData.get("height") as string) : null,
      unit: formData.get("unit") || null,
      seo_title: formData.get("seo_title") || null,
      seo_description: formData.get("seo_description") || null,
      is_active: true,
      is_featured: formData.get("is_active") ? true : false,
    };

    // ✅ Validate
    const validation = CreateProductSchema.safeParse(productData);
    if (!validation.success) {
      return errorResponse(validation.error.message, 400);
    }
    // ✅ Save to DB
    const newProduct = await productQueries.create(validation.data);

    return successResponse(newProduct, 201);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to create product", 500);
  }
}

