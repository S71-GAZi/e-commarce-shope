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
  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const itemsHTML = order.order_items
      .map(
        (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>
            <strong>${item.name}</strong><br/>
            <span class="muted"># ${item.product_code}</span>
          </td>
          <td>${item.selected_size}</td>
          <td>${item.quantity}</td>
          <td>৳ ${Number(item.price_snapshot).toFixed(2)}</td>
          <td>৳ ${(Number(item.price_snapshot) * item.quantity).toFixed(2)}</td>
        </tr>
      `
      )
      .join("")

    const discountRow =
      order.discount && Number(order.discount) > 0
        ? `<tr class="discount"><td colspan="5">Discount</td><td>− ৳ ${Number(order.discount).toFixed(2)}</td></tr>`
        : ""

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order ${order.order_number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; font-size: 13px; color: #1a1a1a; padding: 40px; }
        
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #1e293b; }
        .header h1 { font-size: 22px; font-weight: 700; color: #1e293b; }
        .header .meta { font-size: 12px; color: #64748b; margin-top: 4px; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .badge-pending { background: #f1f5f9; color: #64748b; }
        .badge-processing { background: #fef9c3; color: #92400e; }
        .badge-shipped { background: #dbeafe; color: #1d4ed8; }
        .badge-delivered { background: #dcfce7; color: #166534; }
        .badge-cancelled { background: #fee2e2; color: #991b1b; }

        .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 28px; }
        .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
        .info-card h3 { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-bottom: 8px; }
        .info-card p { font-size: 12.5px; color: #334155; line-height: 1.6; }
        .info-card strong { color: #0f172a; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
        thead tr { background: #1e293b; color: white; }
        thead th { padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
        tbody tr { border-bottom: 1px solid #f1f5f9; }
        tbody tr:hover { background: #f8fafc; }
        tbody td { padding: 11px 12px; font-size: 12.5px; color: #334155; vertical-align: top; }
        tbody td .muted { color: #94a3b8; font-family: monospace; font-size: 11px; }

        .totals { margin-top: 0; border-top: 2px solid #e2e8f0; background: #f8fafc; }
        .totals td { padding: 8px 12px; font-size: 13px; }
        .totals .label { color: #64748b; }
        .totals .total-row td { font-size: 15px; font-weight: 700; color: #0f172a; border-top: 2px solid #cbd5e1; padding-top: 12px; }
        .discount td { color: #16a34a; font-weight: 600; }

        .table-wrap { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 28px; }

        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; }

        @media print {
          body { padding: 20px; }
          @page { margin: 15mm; }
        }
      </style>
    </head>
    <body>

      <div class="header">
        <div>
          <h1>${order.order_number}</h1>
          <div class="meta">Placed on ${new Date(order.created_at).toLocaleDateString()} at ${new Date(order.created_at).toLocaleTimeString()}</div>
        </div>
        <div style="text-align:right">
          <span class="badge badge-${order.status}">${order.status}</span><br/>
          <span style="font-size:11px; color:#94a3b8; margin-top:6px; display:block">Payment: ${order.payment_status} · ${order.payment_method}</span>
        </div>
      </div>

      <div class="grid">
        <div class="info-card">
          <h3>Customer</h3>
          <p><strong>${order.customer_name}</strong><br/>${order.shipping_info.email}<br/>${order.customer_phone}</p>
        </div>
        <div class="info-card">
          <h3>Shipping Address</h3>
          <p>${order.shipping_info.address},<br/>${order.shipping_info.upazila}, ${order.shipping_info.district}<br/>${order.shipping_info.division}</p>
        </div>
        <div class="info-card">
          <h3>Delivery</h3>
          <p><strong>${order.shipping_info.shipping_method}</strong><br/>
          Tracking: ${order.shipping_info.tracking_code || "N/A"}<br/>
          <span class="badge badge-${order.shipping_info.shipping_status}" style="margin-top:4px">${order.shipping_info.shipping_status}</span></p>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Size</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
          <tfoot class="totals">
            <tr><td colspan="5" class="label">Subtotal</td><td>৳ ${Number(order.subtotal).toFixed(2)}</td></tr>
            <tr><td colspan="5" class="label">Shipping</td><td>৳ ${Number(order.shipping).toFixed(2)}</td></tr>
            <tr><td colspan="5" class="label">Tax</td><td>৳ ${Number(order.tax).toFixed(2)}</td></tr>
            ${discountRow}
            <tr class="total-row"><td colspan="5">Total</td><td>৳ ${Number(order.total).toFixed(2)}</td></tr>
          </tfoot>
        </table>
      </div>

      ${order.note ? `<div class="info-card" style="margin-bottom:20px"><h3>Order Note</h3><p>${order.note}</p></div>` : ""}

      <div class="footer">
        <span>Printed on ${new Date().toLocaleString()}</span>
        <span>Order ID: ${order.id ?? order.order_number}</span>
      </div>

      <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }</script>
    </body>
    </html>
  `)

    printWindow.document.close()
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
          {/* <Button variant="outline" onClick={handleSendEmail}>
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </Button> */}
          <Button variant="outline" onClick={handlePrint}>
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
            <Card className="overflow-hidden border-0 shadow-lg bg-white">
              <CardHeader className="bg-linear-to-r from-slate-900 to-slate-700 text-white px-6 py-4">
                <CardTitle className="flex items-center gap-2.5 text-base font-semibold tracking-wide">
                  <div className="p-1.5 bg-white/15 rounded-md">
                    <Package className="h-4 w-4" />
                  </div>
                  Order Items
                  <span className="ml-auto text-xs font-normal bg-white/20 px-2.5 py-1 rounded-full">
                    {order.order_items.length} item{order.order_items.length !== 1 ? "s" : ""}
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0">
                {/* Items List */}
                <div className="divide-y divide-slate-100">
                  {order.order_items.map((item, index) => (
                    <div key={index} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/70 transition-colors">
                      {/* Index badge */}
                      <div className="shrink-0 w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-semibold mt-0.5">
                        {index + 1}
                      </div>

                      {/* Item details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded">
                            Product Code: {item.product_code}
                          </span>
                          <span className="text-xs text-slate-500">Size: <span className="font-medium text-slate-700">{item.selected_size}</span></span>
                          <span className="text-xs text-slate-500">Qty: <span className="font-medium text-slate-700">{item.quantity}</span></span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="shrink-0 text-right">
                        <p className="font-semibold text-slate-900">৳ {(Number(item.price_snapshot) * item.quantity).toFixed(2)}</p>
                        <p className="text-xs text-slate-400 mt-0.5">৳ {Number(item.price_snapshot).toFixed(2)} × {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 space-y-2.5">
                  {[
                    { label: "Subtotal", value: order.subtotal },
                    { label: "Shipping", value: order.shipping },
                    { label: "Tax", value: order.tax },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">{label}</span>
                      <span className="text-slate-700 font-medium">৳ {Number(value).toFixed(2)}</span>
                    </div>
                  ))}

                  {order.discount && Number(order.discount) > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-1.5 text-emerald-600">
                        <span className="text-xs bg-emerald-100 px-1.5 py-0.5 rounded font-medium">DISCOUNT</span>
                      </span>
                      <span className="text-emerald-600 font-semibold">− ৳ {Number(order.discount).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                    <span className="font-bold text-slate-900 text-base">Total</span>
                    <span className="font-bold text-slate-900 text-xl tracking-tight">৳ {Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
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

          {(order?.note || order?.sample_image) && (
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">

                {/* Note */}
                {order?.note && (
                  <div>
                    <p className="text-sm font-medium mb-1">Note:</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {order.note}
                    </p>
                  </div>
                )}

                {/* Sample Image */}
                {order?.sample_image && (
                  <div>
                    <p className="text-sm font-medium mb-2">Sample Image:</p>
                    <img
                      src={order.sample_image}
                      alt="Sample"
                      className="max-w-xs rounded-lg border"
                    />
                  </div>
                )}

              </CardContent>
            </Card>
          )}

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