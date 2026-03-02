import { NextResponse } from "next/server"
import { dashboardQuery } from "@/lib/db"
import { getTokenFromRequest, isAdmin } from "@/lib/api/middleware"
import { getUserFromToken } from "@/lib/jwt"
import { NextRequest } from "next/server"
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request)
        const user = token ? getUserFromToken(token) : null

        if (!user || !isAdmin(user)) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            )
        }

        const dashboardInfo = await dashboardQuery.getDashboardStats()
        const recentOrders = await dashboardQuery.getRecentOrders()
        const lowStockProducts = await dashboardQuery.getLowStockProducts()


        return NextResponse.json(
            {
                success: true,
                data: {
                    ...dashboardInfo[0],
                    recentOrders,
                    lowStockProducts,
                },
            },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error fetching dashboard data:", error)
        return NextResponse.json(
            { success: false, message: error || "Failed to fetch dashboardData" },
            { status: 500 }
        )
    }
}