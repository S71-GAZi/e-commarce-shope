"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"

import ShippingForm from "./components/ShippingForm"
import PaymentForm from "./components/PaymentForm"
import OrderSummary, { ISpecialDiscount } from "./components/OrderSummary"
import { toast } from "@/hooks/use-toast"
import { useFetchResource } from "@/hooks/useFetchResource"

// Optional: define types
export interface ShippingData {
  name?: string
  email?: string
  phone?: string
  division?: string
  district?: string
  upazila?: string
  address?: string
  note?: string
  sample_image?: string
  imagePreview?: string
}

export interface PaymentData {
  payment_method?: "cod" | "mobile_banking"
  provider?: string
  senderAccount?: string
  transactionId?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal: itemSubtotal, clearCart, buyNowItem, clearBuyNow } = useCart()
  const { user } = useAuth()

  const [mounted, setMounted] = useState(false)
  const [shippingData, setShippingData] = useState<ShippingData | null>(null)
  const [paymentData, setPaymentData] = useState<PaymentData>({ payment_method: "cod" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    data: specialDiscount,
    fetchData: fetchSpecialDiscount,
  } = useFetchResource<ISpecialDiscount>({
    url: "/api/discount",
    extractData: (result) => result.data || [],
  })

  useEffect(() => {
    fetchSpecialDiscount()
  }, [fetchSpecialDiscount])


  const activeItems = buyNowItem ? [buyNowItem] : items


  let discount = 0



  if (specialDiscount) {
    activeItems.forEach((item) => {
      if (item.quantity >= specialDiscount.offer_quantity) {
        discount +=
          (item.price_snapshot * item.quantity * (Number(specialDiscount.discount_percentage))) /
          100
      }
    })
  }

  // Computed values
  const cleanedBuyNowItem = buyNowItem
    ? (({ sample_image, note, ...rest }) => rest)(buyNowItem)
    : null;
  const subtotal = buyNowItem ? buyNowItem.price_snapshot * buyNowItem.quantity : itemSubtotal

  const shipping = shippingData?.district === "Dhaka" ? 70 : 120
  // const tax = subtotal * 0.08
  const total = subtotal + shipping - discount
  useEffect(() => {
    setMounted(true)
  }, [])

  // ================for Authenticated================

  // useEffect(() => {
  //   if (!mounted) return
  //   if (!isLoading && !isCartLoading && !isAuthenticated) {
  //     router.push("/auth/login?redirect=/checkout")
  //   }
  // }, [mounted, isLoading, isAuthenticated, router, isCartLoading])

  const handlePlaceOrder = async () => {


    const orderData = {
      shipping_info: shippingData ? (({ sample_image, imagePreview, note, ...rest }) => rest)(shippingData) : null,
      payment: paymentData,
      items: buyNowItem ? [cleanedBuyNowItem] : items,
      subtotal,
      shipping,
      // tax,
      total,
      note: shippingData?.note || "",
      sample_image: shippingData?.imagePreview,
    }

    // validate mobile banking fields
    if (orderData.payment.payment_method === "mobile_banking") {
      if (!orderData.payment.provider || !orderData.payment?.senderAccount?.trim() || !orderData.payment?.transactionId?.trim()) {
        toast({ title: "Please fill all required payment fields", variant: "destructive" });
        return;
      }
    }

    // validate shipping fields
    if (!orderData.shipping_info?.name || !orderData.shipping_info.email || !orderData.shipping_info.phone || !orderData.shipping_info.division || !orderData.shipping_info.district || !orderData.shipping_info.upazila || !orderData.shipping_info.address) {
      toast({ title: "Please fill all required shipping fields", variant: "destructive" });
      return;
    }
    setIsSubmitting(true)


    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      if (!res.ok) throw new Error("Order failed")

      const data = await res.json()
      if (buyNowItem) { clearBuyNow() }
      else { clearCart() }
      router.push(`/orders/confirmation/${data.data.id}`)
    } catch (err) {
      console.error(err)
      alert(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to cart
          </Link>

          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground mt-1">Complete your purchase securely</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handlePlaceOrder(); }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ShippingForm user={user} onChange={setShippingData} />
            <PaymentForm total={total} onChange={setPaymentData} />
          </div>
          <div className="lg:col-span-1">
            <OrderSummary
              items={items}
              subtotal={subtotal}
              paymentMethod={paymentData?.payment_method}
              activeProviderName={paymentData?.provider}
              isProcessing={isSubmitting}
              shipping={shipping}
              discount={discount}
            // onPlaceOrder={() => { }} // No-op if form handles submit
            />
          </div>
        </form>
      </main>

      <Footer />
    </div>
  )
}