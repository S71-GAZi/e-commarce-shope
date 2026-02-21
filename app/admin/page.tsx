"use client"

import { StatsCard } from "@/components/admin/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, AlertCircle } from "lucide-react"

export default function AdminDashboardPage() {
  // Mock data - replace with real data from database
  const stats = {
    revenue: {
      value: "$45,231.89",
      trend: { value: 20.1, isPositive: true },
    },
    orders: {
      value: "234",
      trend: { value: 12.5, isPositive: true },
    },
    products: {
      value: "1,234",
      trend: { value: 5.2, isPositive: true },
    },
    customers: {
      value: "892",
      trend: { value: 8.3, isPositive: true },
    },
  }

  const recentOrders = [
    {
      id: "1",
      orderNumber: "ORD-2024-001",
      customer: "John Doe",
      total: 299.99,
      status: "processing",
      date: "2024-01-15",
    },
    {
      id: "2",
      orderNumber: "ORD-2024-002",
      customer: "Jane Smith",
      total: 149.99,
      status: "shipped",
      date: "2024-01-15",
    },
    {
      id: "3",
      orderNumber: "ORD-2024-003",
      customer: "Bob Johnson",
      total: 499.99,
      status: "delivered",
      date: "2024-01-14",
    },
  ]

  const lowStockProducts = [
    { id: "1", name: "Wireless Headphones", stock: 5, threshold: 10 },
    { id: "2", name: "Smart Watch Pro", stock: 8, threshold: 10 },
    { id: "3", name: "Premium Leather Jacket", stock: 3, threshold: 10 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={stats.revenue.value}
          description="Total sales this month"
          icon={DollarSign}
          trend={stats.revenue.trend}
        />
        <StatsCard
          title="Orders"
          value={stats.orders.value}
          description="Orders this month"
          icon={ShoppingCart}
          trend={stats.orders.trend}
        />
        <StatsCard
          title="Products"
          value={stats.products.value}
          description="Total products in store"
          icon={Package}
          trend={stats.products.trend}
        />
        <StatsCard
          title="Customers"
          value={stats.customers.value}
          description="Total registered customers"
          icon={Users}
          trend={stats.customers.trend}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from your store</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="space-y-1">
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                    <p className="text-xs text-muted-foreground">{order.date}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-semibold">${order.total.toFixed(2)}</p>
                    <Badge
                      variant={
                        order.status === "delivered" ? "default" : order.status === "shipped" ? "secondary" : "outline"
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 bg-transparent">
              View All Orders
            </Button>
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
            <div className="space-y-4">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">Threshold: {product.threshold} units</p>
                  </div>
                  <Badge variant="destructive">{product.stock} left</Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 bg-transparent">
              Manage Inventory
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Sales Overview
          </CardTitle>
          <CardDescription>Monthly sales performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Sales chart will be displayed here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
