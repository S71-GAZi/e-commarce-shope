"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Eye } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { useFetchResource } from "@/hooks/useFetchResource"
import { IOrderFull } from "@/lib/types/order.interface"

export default function OrdersPage() {
  // Mock orders - implement with real data later
  const {
    data: orders,
    isLoading,
    fetchData: fetchOrders,
  } = useFetchResource<IOrderFull>({
    url: "/api/orders",
    extractData: (result) =>
      Array.isArray(result)
        ? result
        : Array.isArray(result?.data?.orders)
          ? result.data.orders
          : [],
  })

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8">My Orders</h1>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Package className="h-24 w-24 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
                <p className="text-muted-foreground mb-6">Start shopping to see your orders here!</p>
                <Button asChild>
                  <Link href="/products">Browse Products</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Order #{order.order_number}</CardTitle>
                      <Badge>{order.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Placed on {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        <p className="font-semibold mt-1">BDT{Number(order.total).toFixed(2)}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}
