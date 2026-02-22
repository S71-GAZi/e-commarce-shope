export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";
import {
    getTokenFromRequest,
    isAdmin,
    errorResponse,
    successResponse,
} from "@/lib/api/middleware";
import { getUserFromToken } from "@/lib/jwt";
import { executeQuery } from "@/lib/db";


// PATCH /api/admin/customers/:id/status
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // ✅ Auth check
        const token = getTokenFromRequest(request);
        const user = token ? getUserFromToken(token) : null;
        console.log("Authenticated user for status update:", user, token);
        if (!user || !isAdmin(user)) {
            return errorResponse("Unauthorized", 401);
        }

        // ✅ Get body
        const { status } = await request.json();

        if (!["active", "inactive"].includes(status)) {
            return errorResponse("Invalid status", 400);
        }

        // ✅ Update DB
        await executeQuery(
            `UPDATE users SET status = ? WHERE id = ?`,
            [status, params.id]
        );

        return successResponse({ message: "Status updated successfully" });

    } catch (error) {
        console.error("Update customer status error:", error);
        return errorResponse("Failed to update status", 500);
    }
}