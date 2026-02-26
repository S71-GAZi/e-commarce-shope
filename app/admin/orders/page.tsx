"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Download, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { IOrder, IOrderStatus } from "@/lib/types/intrerface"

export default function OrdersPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")

  // Mock orders data - replace with real data from database
  const [orders] = useState<IOrder[]>([
    {
      id: "1",
      order_number: "ORD-2024-001",
      user_id: "user-1",
      status: "processing",
      payment_status: "paid",
      payment_method: "Credit Card",
      subtotal: 299.99,
      discount_amount: 0,
      tax_amount: 30.0,
      shipping_amount: 9.99,
      total_amount: 339.98,
      currency: "USD",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      order_number: "ORD-2024-002",
      user_id: "user-2",
      status: "shipped",
      payment_status: "paid",
      payment_method: "PayPal",
      subtotal: 149.99,
      discount_amount: 15.0,
      tax_amount: 13.5,
      shipping_amount: 0,
      total_amount: 148.49,
      currency: "USD",
      tracking_number: "1Z999AA10123456784",
      created_at: "2024-01-14T15:20:00Z",
      updated_at: "2024-01-15T09:00:00Z",
    },
    {
      id: "3",
      order_number: "ORD-2024-003",
      user_id: "user-3",
      status: "delivered",
      payment_status: "paid",
      payment_method: "Credit Card",
      subtotal: 499.99,
      discount_amount: 0,
      tax_amount: 50.0,
      shipping_amount: 9.99,
      total_amount: 559.98,
      currency: "USD",
      tracking_number: "1Z999AA10123456785",
      delivered_at: "2024-01-13T14:30:00Z",
      created_at: "2024-01-10T11:00:00Z",
      updated_at: "2024-01-13T14:30:00Z",
    },
    {
      id: "4",
      order_number: "ORD-2024-004",
      user_id: "user-4",
      status: "pending",
      payment_status: "pending",
      payment_method: "Credit Card",
      subtotal: 89.99,
      discount_amount: 0,
      tax_amount: 9.0,
      shipping_amount: 9.99,
      total_amount: 108.98,
      currency: "USD",
      created_at: "2024-01-15T16:45:00Z",
      updated_at: "2024-01-15T16:45:00Z",
    },
  ])

  const [statusFilter, setStatusFilter] = useState<string>("all")

  const getStatusColor = (status: IOrderStatus) => {
    const colors = {
      pending: "secondary",
      processing: "default",
      shipped: "default",
      delivered: "default",
      cancelled: "destructive",
      refunded: "destructive",
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
          order.total_amount.toFixed(2),
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
          <div className="flex gap-4 mb-4">
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
              <SelectTrigger className="w-[180px]">
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
                  <TableHead>Total</TableHead>
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
                    <TableCell>Customer #{order.user_id}</TableCell>
                    <TableCell>${order.total_amount.toFixed(2)}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  )
}
