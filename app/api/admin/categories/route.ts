//export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server"
import { getTokenFromRequest, isAdmin, errorResponse, successResponse } from "@/lib/api/middleware"
import { validateRequestBody, CreateCategorySchema } from "@/lib/api/validation"
import { categoryQueries } from "@/lib/db/queries"
import { getUserFromToken, IUserPayload } from "@/lib/jwt"
import path from "path/win32"
import fs from "fs"

// GET /api/admin/categories
export async function GET(request: NextRequest) {
  try {

    const categories = await categoryQueries.listAll()

    return successResponse({ categories })
  } catch (error) {
    return errorResponse("Failed to fetch categories", 500)
  }
}

// POST /api/admin/categories
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    const user: IUserPayload | null = token ? getUserFromToken(token) : null
    if (!user || !isAdmin(user)) {
      return errorResponse("Unauthorized", 401)
    }

    //---
    
        // ✅ Parse FormData
        const formData = await request.formData();
        // Extract images
        const uploadDir = path.join(process.cwd(), "public/uploads/categories");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    
         const file = formData.get("image") as File;
          if (!(file instanceof File)) return errorResponse("Invalid image file", 400);
    
          // Max size 600kb
          if (file.size > 600 * 1024)
            return errorResponse(`File "${file.name}" exceeds max size of 600KB`, 400);
    
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
    
          const filePath = path.join(uploadDir, `${Date.now()}_${file.name}`);
          fs.writeFileSync(filePath, buffer);
    
         const image = `/uploads/categories/${path.basename(filePath)}`;
    
         const categoryData = {
          name: formData.get("categoryName") as string,
          slug: formData.get("categorySlug") as string, 
          description: formData.get("categoryDescription") as string,
          parent_id: formData.get("parent_id") as string || "",
          display_order: Number(formData.get("display_order") || 0),
          is_active: formData.get("is_active") === "true",
          image_url :image,
        }

        // ✅ Validate
        const validation = CreateCategorySchema.safeParse(categoryData);
        if (!validation.success) {
          return errorResponse(validation.error.message, 400);
        }
 
    const newCategory = await categoryQueries.create(validation.data)

    return successResponse(newCategory, 201)
  } catch (error) {
    console.error("Create category error:", error)
    return errorResponse("Failed to create category", 500)
  }
}
