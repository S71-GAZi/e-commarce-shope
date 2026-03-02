"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Loader2 } from "lucide-react"
import { useFetchById } from "@/hooks/useFetchById"
import { IOrderFull } from "@/lib/types/order.interface"
import { useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function OrderConfirmationPage() {
    const { isAuthenticated } = useAuth()

    const params = useParams()
    const orderId = params.id as string

    const { data: order, isLoading } = useFetchById<IOrderFull>({
        url: `/api/orders/${orderId}`,
        extractData: (res) => res.data,
    })

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-60">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!order) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-semibold">Order not found</h2>
            </div>
        )
    }

    const shipping = order.shipping_info

    return (
        <div className="container max-w-5xl mx-auto py-12 space-y-8">

            {/* Success Section */}
            <div className="text-center space-y-4">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <h1 className="text-3xl font-bold">Order Placed 🎉</h1>
                <p className="text-muted-foreground">
                    Thank you for your purchase. Your order has been successfully placed.
                </p>

                <div className="flex justify-center gap-3 flex-wrap">
                    <Badge className="px-4 py-1">
                        #{order.order_number}
                    </Badge>

                    <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                        Payment: {order.payment_status}
                    </Badge>

                    <Badge variant="outline">
                        Status: {order.status}
                    </Badge>
                </div>
            </div>

            {/* Order + Shipping Info */}
            <div className="grid md:grid-cols-2 gap-6">

                <Card>
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><strong>Name:</strong> {order.customer_name}</p>
                        <p><strong>Phone:</strong> {order.customer_phone}</p>
                        <p><strong>Order Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
                        <p><strong>Payment Method:</strong> {order.payment_method?.toUpperCase()}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Shipping Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><strong>Name:</strong> {shipping?.name}</p>
                        <p><strong>Phone:</strong> {shipping?.phone}</p>
                        <p><strong>Address:</strong> {shipping?.address}</p>
                        <p><strong>Upazila:</strong> {shipping?.upazila}</p>
                        <p><strong>Shipping Method:</strong> {shipping?.shipping_method}</p>
                        <p>
                            <strong>Shipping Status:</strong>{" "}
                            <Badge variant="outline">{shipping?.shipping_status}</Badge>
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Items */}
            <Card>
                <CardHeader>
                    <CardTitle>Ordered Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">

                    {order.order_items.map((item) => {
                        const price = Number(item.price_snapshot)
                        const total = price * item.quantity

                        return (
                            <div
                                key={item.id}
                                className="flex justify-between items-center border-b pb-3"
                            >
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-muted-foreground text-sm">
                                        Qty: {item.quantity}
                                    </p>
                                </div>

                                <p className="font-semibold">
                                    ৳ {total.toFixed(2)}
                                </p>
                            </div>
                        )
                    })}

                    {/* Totals */}
                    <div className="pt-6 space-y-2 text-sm border-t">
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

                        {Number(order.discount) > 0 && (
                            <div className="flex justify-between text-red-500">
                                <span>Discount</span>
                                <span>- ৳ {Number(order.discount).toFixed(2)}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-lg font-bold pt-3">
                            <span>Total</span>
                            <span>৳ {Number(order.total).toFixed(2)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pt-4">
                <Button asChild>
                    <Link href="/">Continue Shopping</Link>
                </Button>

                {
                    isAuthenticated &&
                    <Button variant="outline" asChild>
                        <Link href="/account/orders">
                            View Orders
                        </Link>
                    </Button>
                }
            </div>
        </div>
    )
}