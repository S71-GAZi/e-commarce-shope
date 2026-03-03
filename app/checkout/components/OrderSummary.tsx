"use client"

import Image from "next/image"
import Link from "next/link"
import { Loader2, ShieldCheck, Banknote, Smartphone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ICartItem } from "@/lib/types/intrerface"
import { useCart } from "@/lib/cart-context"

// interface CartItem {
//     product_id: string | number
//     name: string
//     images: string[] | string
//     quantity: number
//     price: number
//     price_snapshot: number
//     variant?: { id: string | number; name: string }
// }

interface Props {
    items: ICartItem[]
    subtotal: number
    paymentMethod?: "cod" | "mobile_banking"
    activeProviderName?: string
    isProcessing?: boolean
    shipping: number
}

export default function OrderSummary({
    items,
    subtotal,
    paymentMethod,
    activeProviderName,
    isProcessing = false,
    shipping = 120
}: Props) {

    const { buyNowItem } = useCart()
    const activeItems = buyNowItem ? [buyNowItem] : items

    // const tax = subtotal * 0.08
    const total = subtotal + shipping

    return (
        <Card className="sticky top-4 shadow-sm border-0 ring-1 ring-border">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg">Order Summary</CardTitle>
                <p className="text-xs text-muted-foreground">
                    {activeItems.length} item{activeItems.length !== 1 ? "s" : ""}
                </p>
            </CardHeader>

            <CardContent className="space-y-4">

                {/* Items list */}
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {activeItems.map((item) => {
                        const images: string[] = Array.isArray(item.images)
                            ? item.images
                            : typeof item.images === "string"
                                ? (() => { try { return JSON.parse(item.images as string) } catch { return [] } })()
                                : []
                        const imageUrl = images.length > 0 ? images[0] : "/placeholder.svg?height=64&width=64"

                        return (
                            <div
                                key={`${item.product_id}-${item.variant?.id ?? "default"}`}
                                className="flex gap-3 items-start"
                            >
                                <div className="relative w-14 h-14 shrink-0 rounded-lg bg-muted overflow-hidden">
                                    <Image src={imageUrl} alt={item.name} fill className="object-cover" />
                                    <Badge className="absolute -top-1.5 -right-1.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] rounded-full">
                                        {item.quantity}
                                    </Badge>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium line-clamp-2 leading-tight">{item.name}</p>
                                    {item.variant && (
                                        <p className="text-xs text-muted-foreground mt-0.5">{item.variant.name}</p>
                                    )}
                                    <p className="text-sm font-semibold mt-1">
                                        BDT {(item.price_snapshot * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <Separator />

                {/* Price breakdown */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>BDT {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                            {shipping === 0 ? "FREE" : `BDT ${shipping.toFixed(2)}`}
                        </span>
                    </div>
                    {/* <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax (8%)</span>
                        <span>BDT {tax.toFixed(2)}</span>
                    </div> */}
                </div>

                <Separator />

                <div className="flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span className="text-lg">BDT {total.toFixed(2)}</span>
                </div>

                {/* Active payment method badge */}
                <div className="flex items-center gap-2 text-xs rounded-lg px-3 py-2 bg-muted/50">
                    {paymentMethod === "cod" ? (
                        <>
                            <Banknote className="h-3.5 w-3.5 text-green-600" />
                            <span className="text-muted-foreground">
                                Paying via <strong className="text-foreground">Cash on Delivery</strong>
                            </span>
                        </>
                    ) : (
                        <>
                            <Smartphone className="h-3.5 w-3.5 text-primary" />
                            <span className="text-muted-foreground">
                                Paying via{" "}
                                <strong className="text-foreground">
                                    {activeProviderName ?? "Mobile Banking"}
                                </strong>
                            </span>
                        </>
                    )}
                </div>

                {/* Submit button */}
                <Button
                    type="submit"
                    size="lg"
                    className={`w-full h-12 text-base font-semibold ${isProcessing ? "cursor-not-allowed" : "cursor-pointer"}`}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Place Order · BDT {total.toFixed(2)}
                        </>
                    )}
                </Button>

                <p className="text-xs text-center text-muted-foreground leading-relaxed">
                    By placing your order, you agree to our{" "}
                    <Link href="/terms" className="underline hover:text-foreground">Terms</Link>
                    {" "}and{" "}
                    <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
                </p>

            </CardContent>
        </Card>
    )
}