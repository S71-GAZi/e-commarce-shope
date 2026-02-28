"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Package,
  CreditCard,
  User,
  MapPin,
  Loader2,
  Mail,
  Printer,
  Clock,
} from "lucide-react"
import { IOrderFull, IOrderStatus } from "@/lib/types/order.interface"
import { useFetchById } from "@/hooks/useFetchById"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function OrderDetailPage() {
  const { id } = useParams() as { id: string }
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [orderStatus, setOrderStatus] = useState<IOrderStatus>("pending")
  const [trackingNumber, setTrackingNumber] = useState("")

  const { data: order, isLoading: fetchLoading } = useFetchById<IOrderFull>({
    url: `/api/orders/${id}`,
    extractData: (res) => res.data,
  })

  // Sync state after fetch
  useEffect(() => {
    if (order) {
      setOrderStatus(order.status)
      setTrackingNumber(order.shipping_info?.tracking_code || "")
    }
  }, [order])

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    )
  }

  if (!order) {
    return <div className="text-center py-20">Order not found</div>
  }

  const handleUpdateOrder = async () => {
    setIsLoading(true)
    try {
      // TODO: replace with real API call
      await new Promise((res) => setTimeout(res, 1000))
      toast({
        title: "Order updated",
        description: "Order status updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendEmail = () => {
    toast({
      title: "Email sent",
      description: "Order confirmation email sent.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{order.order_number}</h1>
            <p className="text-muted-foreground">
              Placed on{" "}
              {new Date(order.created_at).toLocaleDateString()} at{" "}
              {new Date(order.created_at).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSendEmail}>
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </Button>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between border-b pb-4 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Price: ৳ {Number(item.price_snapshot).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ৳ {(Number(item.price_snapshot) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>৳ {Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>৳ {Number(order.shipping).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>৳ {Number(order.tax).toFixed(2)}</span>
                </div>
                {order.discount && Number(order.discount) > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Discount</span>
                    <span>- ৳ {Number(order.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t pt-2 text-lg">
                  <span>Total</span>
                  <span>৳ {Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{order.customer_name}</p>
              <p>Email: {order.shipping_info.email}</p>
              <p>Phone: {order.customer_phone}</p>
            </CardContent>
          </Card>

          {/* Shipping Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{order.shipping_info.name}</p>
              <p>Phone: {order.shipping_info.phone}</p>
              <p>Email: {order.shipping_info.email}</p>
              <p>Address: {order.shipping_info.address}, {order.shipping_info.upazila}, {order.shipping_info.district}, Division: {order.shipping_info.division}</p>
              <p>Shipping Method: {order.shipping_info.shipping_method}</p>
              <p>Tracking Code: {order.shipping_info.tracking_code || "N/A"}</p>
              <Badge variant={order.shipping_info.shipping_status === "pending" ? "secondary" : "default"}>
                {order.shipping_info.shipping_status}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={orderStatus}
                  onValueChange={(value) => setOrderStatus(value as IOrderStatus)}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tracking Number */}
              <div className="space-y-2">
                <Label htmlFor="tracking">Tracking Number</Label>
                <Input
                  id="tracking"
                  placeholder="Enter tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>

              <Button
                onClick={handleUpdateOrder}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Order
              </Button>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Method</span>
                <span>{order.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                  {order.payment_status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Order Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea placeholder="Add notes..." rows={4} defaultValue={order.note || ""} />
              <Button variant="outline" className="w-full mt-2">
                Save Notes
              </Button>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>Order placed on: {new Date(order.created_at).toLocaleString()}</p>
              <p>Last updated: {new Date(order.updated_at).toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}