"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Download, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { IOrder, IOrderFull, IOrderStatus } from "@/lib/types/order.interface"
import { useFetchResource } from "@/hooks/useFetchResource"
// import type { IOrder, IOrderStatus } from "@/lib/types/intrerface"

export default function OrdersPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  // Fetch Order
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

  // const orders = JSON.parse(JSON.stringify(rawOrders)) as IOrderFull[]

  const [statusFilter, setStatusFilter] = useState<string>("all")

  const getStatusColor = (status: IOrderStatus) => {
    const colors = {
      pending: "secondary",
      processing: "default",
      shipped: "default",
      delivered: "default",
      cancelled: "destructive",
      refunded: "destructive",
      confirmed: "default",
      returned: "destructive",
    }
    return colors[status] || "secondary"
  }


  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order?.user_id?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleExport = () => {
    const csvContent = [
      ["Order Number", "Date", "Customer", "Total", "Payment", "Status"].join(","),
      ...filteredOrders.map((order) =>
        [
          order.order_number,
          new Date(order.created_at).toLocaleDateString(),
          `Customer #${order.user_id}`,
          Number(order.total).toFixed(2),
          order.payment_status,
          order.status,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Orders exported",
      description: "Your orders have been exported to CSV.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage and track customer orders</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export Orders
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>View and manage customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
            </div>
          ) : (
            <>          <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-45">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total (BDT)</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.order_number}</TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{order.customer_name}<br /> {order.customer_phone}</TableCell>
                        <TableCell>{Number(order.total).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                            {order.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(order.status) as any}>{order.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/orders/${order.id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View details</span>
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No orders found</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
