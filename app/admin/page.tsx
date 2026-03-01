"use client"

import { StatsCard } from "@/components/admin/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, AlertCircle, LucideAlertCircle } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/dashboard")
        if (!res.ok) throw new Error("Failed to fetch dashboard data")
        const result = await res.json()
        setDashboardData(result.data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const StockBadge = ({ stock, threshold }: { stock: number; threshold: number }) => {
    let variant: "destructive" | "secondary" | "default" | "outline" = "secondary"
    let icon = null
    if (stock === 0) {
      variant = "destructive"
      icon = <LucideAlertCircle className="w-4 h-4 mr-1" />
    } else if (stock <= threshold) {
      variant = "destructive"
    } else {
      variant = "secondary"
    }

    return (
      <Badge
        variant={variant}
        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shadow-sm"
      >
        {icon}
        {stock === 0 ? "Out of Stock" : `${stock} left`}
      </Badge>
    )
  }

  const SkeletonCard = () => (
    <div className="animate-pulse space-y-2">
      <div className="h-6 w-3/4 bg-gray-300 rounded" />
      <div className="h-4 w-1/2 bg-gray-300 rounded" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your store.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading
          ? [1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent>
                <SkeletonCard />
              </CardContent>
            </Card>
          ))
          : [
            {
              title: "Total Revenue",
              value: dashboardData?.totalRevenue ?? 0,
              description: "Total sales this month",
              icon: DollarSign,
            },
            {
              title: "Orders",
              value: dashboardData?.totalOrder ?? 0,
              description: "Orders this month",
              icon: ShoppingCart,
            },
            {
              title: "Products",
              value: dashboardData?.totalProduct ?? 0,
              description: "Total products in store",
              icon: Package,
            },
            {
              title: "Customers",
              value: dashboardData?.totalCustomer ?? 0,
              description: "Total registered customers",
              icon: Users,
            },
          ].map((stat) => (
            <StatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
            />
          ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from your store</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between items-center animate-pulse space-x-4">
                    <div className="space-y-1 flex-1">
                      <div className="h-4 w-1/3 bg-gray-300 rounded" />
                      <div className="h-3 w-1/4 bg-gray-200 rounded" />
                      <div className="h-2 w-1/5 bg-gray-200 rounded" />
                    </div>
                    <div className="space-y-1 text-right flex-shrink-0">
                      <div className="h-4 w-12 bg-gray-300 rounded ml-auto" />
                      <div className="h-3 w-10 bg-gray-200 rounded ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData?.recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{order.order_id}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.time).toLocaleString("en-BD", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-semibold">BDT{Number(order.total).toFixed(2)}</p>
                      <Badge
                        variant={
                          order.status === "delivered"
                            ? "default"
                            : order.status === "shipped"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>Products running low on inventory</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center animate-pulse space-x-4"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="h-4 w-2/3 bg-gray-300 rounded" />
                      <div className="h-3 w-1/4 bg-gray-200 rounded" />
                    </div>
                    <div className="h-4 w-12 bg-gray-300 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData?.lowStockProducts.map((product: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Threshold: {product.low_stock_threshold} units
                      </p>
                    </div>
                    <StockBadge
                      stock={product.stock_quantity}
                      threshold={product.low_stock_threshold}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
