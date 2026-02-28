//export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server"
import { getTokenFromRequest, isAdmin, errorResponse, successResponse } from "@/lib/api/middleware"
import { validateRequestBody, CreateCategorySchema } from "@/lib/api/validation"
import { categoryQueries } from "@/lib/db/queries"
import { getUserFromToken, IUserPayload } from "@/lib/jwt"
import path from "path/win32"
import fs from "fs"
type RouteParams = { params: { id: string } }

// PATCH /api/admin/categories/[id]
// export async function PATCH(request: NextRequest, { params }: RouteParams) {
//   try {
//     const token = getTokenFromRequest(request)
//     const user = token ? getUserFromToken(token) : null

//     if (!user || !isAdmin(user as any)) {
//       return errorResponse("Unauthorized", 401)
//     }

//     const { id } = params
//     const validation = await validateRequestBody(request, CreateCategorySchema.partial())

//     if (!validation.valid) {
//       return errorResponse(validation.error, 400)
//     }

//     const updatedCategory = await categoryQueries.update(id, validation.data)

//     return successResponse(updatedCategory)
//   } catch (error) {
//     return errorResponse("Failed to update category", 500)
//   }
// }

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ✅ Auth check
    const token = getTokenFromRequest(req);
    const user = token ? getUserFromToken(token) : null;

    if (!user || !isAdmin(user)) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = params;

    // ✅ Existing category
    const existingCategory = await categoryQueries.findById(id);
    if (!existingCategory) {
      return errorResponse("Category not found", 404);
    }

    // ✅ Parse FormData
    const formData = await req.formData();

    const uploadDir = path.join(process.cwd(), "public/uploads/categories");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // ✅ Existing image from DB
    const existingImage = existingCategory.image_url || null;

    let newImagePath: string | null = null;

    // ✅ Upload new image if provided
    const file = formData.get("image");

    if (file && typeof file === "object" && "arrayBuffer" in file) {

      const fileObj = file as File;

      if (fileObj.size > 600 * 1024) {
        return errorResponse(`File "${fileObj.name}" exceeds 600KB`, 400);
      }

      const buffer = Buffer.from(await fileObj.arrayBuffer());

      const newFileName = `${Date.now()}_${fileObj.name}`;
      const filePath = path.join(uploadDir, newFileName);

      fs.writeFileSync(filePath, buffer);

      newImagePath = `/uploads/categories/${newFileName}`;

      // ✅ Delete old image from disk
      if (existingImage) {
        const oldPath = path.join(process.cwd(), "public", existingImage);

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    // ✅ Build update payload
    const categoryData: any = {
      name: formData.get("categoryName"),
      slug: formData.get("categorySlug"),
      description: formData.get("categoryDescription"),
      parent_id: formData.get("parent_id") || "",
      display_order: formData.get("display_order")
        ? Number(formData.get("display_order"))
        : 0,
      is_active: formData.get("is_active") === "true",
      image_url: newImagePath || existingImage,
    };

    // ✅ Validate
    const validation = CreateCategorySchema.partial().safeParse(categoryData);

    if (!validation.success) {
      return errorResponse(validation.error.message, 400);
    }

    // ✅ Update DB
    const updatedCategory = await categoryQueries.update(id, validation.data);

    return successResponse(updatedCategory);

  } catch (err) {
    console.error("Category update error:", err);
    return errorResponse(
      err instanceof Error ? err.message : "Failed to update category",
      500
    );
  }
}

// DELETE /api/admin/categories/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const token = getTokenFromRequest(request)
    const user: IUserPayload | null = token ? getUserFromToken(token) : null

    if (!user || !isAdmin(user as any)) {
      return errorResponse("Unauthorized", 401)
    }

    const { id } = params

    await categoryQueries.delete(id)

    return successResponse({ id, message: "Category deleted successfully" })
  } catch (error) {
    return errorResponse("Failed to delete category", 500)
  }
}
