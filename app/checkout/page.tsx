"use client"

export const dynamic = "force-dynamic";

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  Loader2,
  CreditCard,
  Truck,
  ShieldCheck,
  ArrowLeft,
  Tag,
  Banknote,
  Smartphone,
  Copy,
  CheckCircle2,
  Info,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ─── Mobile Banking providers config ────────────────────────────────────────
const MOBILE_BANKING_PROVIDERS = [
  {
    id: "bkash",
    name: "bKash",
    logo: "https://freelogopng.com/images/all_img/1656227518bkash-logo-png.png",
    activeBg: "bg-pink-50",
    accountNo: "01700-000000",
    type: "Personal",
  },
  {
    id: "nagad",
    name: "Nagad",
    logo: "https://nagad.com.bd/_nuxt/img/new-logo.14fe8a5.png",
    activeBg: "bg-orange-50",
    accountNo: "01700-111111",
    type: "Personal",
  },
  {
    id: "rocket",
    name: "Rocket",
    logo: "https://www.dutchbanglabank.com/img/mlogo.png",
    activeBg: "bg-purple-50",
    accountNo: "01700-222222",
    type: "Personal",
  },
  {
    id: "upay",
    name: "Upay",
    logo: "https://www.upaybd.com/images/Upay-logo-revised-new.png",
    activeBg: "bg-blue-50",
    accountNo: "01700-333333",
    type: "Personal",
  },
]

type PaymentMethod = "cod" | "mobile_banking"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart, isLoading: isCartLoading } = useCart()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { toast } = useToast()

  const [mounted, setMounted] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod")
  const [isProcessing, setIsProcessing] = useState(false)

  // Mobile banking specific state
  const [selectedProvider, setSelectedProvider] = useState<string>("")
  const [accountNo, setAccountNo] = useState("")
  const [transactionNo, setTransactionNo] = useState("")
  const [copiedAccount, setCopiedAccount] = useState(false)

  const [divisions, setDivisions] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [upazilas, setUpazilas] = useState<any[]>([])

  const [selectedDivision, setSelectedDivision] = useState("")
  const [selectedDistrict, setSelectedDistrict] = useState("")
  const [selectedUpazila, setSelectedUpazila] = useState("")

  // Fetch divisions on mount
  useEffect(() => {
    fetch("https://sohojapi.vercel.app/api/divisions")
      .then(res => res.json())
      .then((res) => setDivisions(res || [])) // always an array
      .catch(err => console.error(err))
  })
  // Fetch districts when division changes
  useEffect(() => {
    if (!selectedDivision) return
    fetch(`https://sohojapi.vercel.app/api/districts/${selectedDivision}`)
      .then(res => res.json())
      .then(data => setDistricts(data))
      .catch(err => console.error(err))
  }, [selectedDivision])

  // Fetch upazilas when district changes
  useEffect(() => {
    if (!selectedDistrict) return
    fetch(`https://sohojapi.vercel.app/api/upzilas/${selectedDistrict}`)
      .then(res => res.json())
      .then(data => setUpazilas(data))
      .catch(err => console.error(err))
  }, [selectedDistrict])

  // Computed order values
  const shipping = subtotal >= 75 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const activeProvider = MOBILE_BANKING_PROVIDERS.find((p) => p.id === selectedProvider)

  useEffect(() => { setMounted(true) }, [])


  useEffect(() => {
    if (!mounted) return
    if (!isLoading && !isCartLoading) {
      if (!isAuthenticated) {
        router.push("/auth/login?redirect=/checkout")
        return
      }
      // if (!isCartLoading && (!items || items.length === 0)) {
      //   router.push("/cart")
      //   console.log(items)
      //   return
      // }
    }
  }, [mounted, isLoading, isAuthenticated, items, router, isCartLoading])

  useEffect(() => {
    if (paymentMethod !== "mobile_banking") {
      setSelectedProvider("")
      setAccountNo("")
      setTransactionNo("")
    }
  }, [paymentMethod])

  const handleCopyAccount = (number: string) => {
    navigator.clipboard.writeText(number)
    setCopiedAccount(true)
    setTimeout(() => setCopiedAccount(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()


    const form = e.currentTarget
    const formData = new FormData(form)

    const orderData = {
      shipping_info: {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        division: selectedDivision,
        district: selectedDistrict,
        upazila: selectedUpazila,
        address: formData.get("address"),

      },
      payment: {
        payment_method: paymentMethod,
        ...(paymentMethod === "mobile_banking" && {
          provider: selectedProvider,
          senderAccount: accountNo,
          transactionId: transactionNo,
        }),
      },
      items,
      subtotal,
      shipping,
      tax,
      total,
    }
    console.log(orderData)

    // validate mobile banking fields
    if (paymentMethod === "mobile_banking") {
      if (!selectedProvider || !accountNo.trim() || !transactionNo.trim()) {
        toast({ title: "Please fill all required payment fields", variant: "destructive" });
        return;
      }
    }

    // validate shipping fields
    if (!orderData.shipping_info.name || !orderData.shipping_info.email || !orderData.shipping_info.phone || !selectedDivision || !selectedDistrict || !selectedUpazila || !orderData.shipping_info.address) {
      toast({ title: "Please fill all required shipping fields", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      console.log("Submitting order data:", orderData)
      // Replace with your actual API call:
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })
      console.log(res)
      // await new Promise((resolve) => setTimeout(resolve, 2000))
      if (res.ok) {

        clearCart()
        toast({
          title: "Order placed successfully! 🎉",
          description:
            paymentMethod === "cod"
              ? "Pay when your order arrives."
              : "We'll verify your payment and confirm your order shortly.",
        })
        // router.push("/orders/confirmation")
      }
    } catch (error) {
      console.error("Order failed:", error)
      toast({ title: "Order failed", description: "Something went wrong. Please try again.", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  if (!mounted) return null
  if (items.length === 0) return null
  if (!isAuthenticated) return null

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to cart
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
          <p className="text-muted-foreground mt-1">Complete your purchase securely</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8">
          {["Shipping", "Payment", "Review"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold ${i <= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
              >
                {i + 1}
              </div>
              <span className={`text-sm font-medium ${i <= 1 ? "text-foreground" : "text-muted-foreground"}`}>
                {step}
              </span>
              {i < 2 && <div className="h-px w-8 bg-muted-foreground/30 mx-1" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── LEFT: Forms ──────────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Shipping Information */}
              <Card className="shadow-sm border-0 ring-1 ring-border">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <Truck className="h-4 w-4 text-primary" />
                    </div>
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input id="name" name="name" required defaultValue={user?.full_name} className="h-10" placeholder="John" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input id="email" name="email" type="email" required defaultValue={user?.email} className="h-10" placeholder="john@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Phone <span className="text-red-500">*</span>
                      </Label>
                      <Input id="phone" name="phone" type="tel" required defaultValue={user?.phone} className="h-10" placeholder="+880 1XXX-XXXXXX" />
                    </div>
                  </div>

                  <div className="space-y-4">

                    {/* Division Dropdown */}
                    <div className="space-y-2">
                      <Label htmlFor="division">Division <span className="text-red-500">*</span></Label>
                      <Select value={selectedDivision} onValueChange={(v) => {
                        setSelectedDivision(v)
                        setSelectedDistrict("")
                        setSelectedUpazila("")
                      }}>
                        <SelectTrigger id="division" className="w-full h-10">
                          <SelectValue placeholder="Select Division" />
                        </SelectTrigger>
                        <SelectContent>
                          {divisions?.map((d: any) => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* District Dropdown */}
                    <div className="space-y-2">
                      <Label htmlFor="district">District <span className="text-red-500">*</span></Label>
                      <Select value={selectedDistrict} onValueChange={(v) => {
                        setSelectedDistrict(v)
                        setSelectedUpazila("")
                      }}>
                        <SelectTrigger id="district" className="w-full h-10">
                          <SelectValue placeholder="Select District" />
                        </SelectTrigger>
                        <SelectContent>
                          {districts.map((d: any) => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Upazila Dropdown */}
                    <div className="space-y-2">
                      <Label htmlFor="upazila">Thana / Upazila <span className="text-red-500">*</span></Label>
                      <Select value={selectedUpazila} onValueChange={setSelectedUpazila}>
                        <SelectTrigger id="upazila" className="w-full h-10">
                          <SelectValue placeholder="Select Upazila / Thana" />
                        </SelectTrigger>
                        <SelectContent>
                          {upazilas.map((u: any) => (
                            <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Street Address */}
                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address <span className="text-red-500">*</span></Label>
                      <Input id="address" name="address" required className="h-10" placeholder="House #, Road #, Area" />
                    </div>
                  </div>


                  {shipping === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">
                      <Truck className="h-4 w-4" />
                      <span className="font-medium">You qualify for FREE shipping!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                      <Tag className="h-4 w-4" />
                      <span>Spend <strong>${(75 - subtotal).toFixed(2)}</strong> more for free shipping</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ── Payment Method ────────────────────────────────────────── */}
              <Card className="shadow-sm border-0 ring-1 ring-border">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">

                  {/* Method selector cards */}
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    {/* COD option */}
                    <label
                      htmlFor="cod"
                      className={`flex items-center gap-3 border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === "cod"
                        ? "border-green-500 bg-green-50"
                        : "border-border hover:border-green-300"
                        }`}
                    >
                      <RadioGroupItem value="cod" id="cod" />
                      <div className="flex items-center gap-2 flex-1">
                        <div className={`p-2 rounded-lg ${paymentMethod === "cod" ? "bg-green-100" : "bg-muted"}`}>
                          <Banknote className={`h-4 w-4 ${paymentMethod === "cod" ? "text-green-600" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Cash on Delivery</p>
                          <p className="text-xs text-muted-foreground">Pay when order arrives</p>
                        </div>
                      </div>
                      {paymentMethod === "cod" && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
                    </label>

                    {/* Mobile Banking option */}
                    <label
                      htmlFor="mobile_banking"
                      className={`flex items-center gap-3 border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === "mobile_banking"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                        }`}
                    >
                      <RadioGroupItem value="mobile_banking" id="mobile_banking" />
                      <div className="flex items-center gap-2 flex-1">
                        <div className={`p-2 rounded-lg ${paymentMethod === "mobile_banking" ? "bg-primary/10" : "bg-muted"}`}>
                          <Smartphone className={`h-4 w-4 ${paymentMethod === "mobile_banking" ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Mobile Banking</p>
                          <p className="text-xs text-muted-foreground">bKash · Nagad · Rocket · Upay</p>
                        </div>
                      </div>
                      {paymentMethod === "mobile_banking" && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                    </label>
                  </RadioGroup>

                  {/* ── COD Info ─────────────────────────────────────── */}
                  {paymentMethod === "cod" && (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4 text-green-600" />
                        <p className="text-sm font-semibold text-green-700">Cash on Delivery Instructions</p>
                      </div>
                      <ul className="text-sm text-green-700 space-y-1.5 ml-6 list-disc">
                        <li>Pay in cash when your order is delivered to your door</li>
                        <li>Please keep the exact amount ready: <strong>${total.toFixed(2)}</strong></li>
                        <li>Our delivery agent will collect payment on arrival</li>
                      </ul>
                    </div>
                  )}

                  {/* ── Mobile Banking Flow ──────────────────────────── */}
                  {paymentMethod === "mobile_banking" && (
                    <div className="space-y-6 pt-1 border-t">

                      {/* STEP 1 – Choose provider */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">1</span>
                          <p className="text-sm font-semibold">Select your Mobile Banking provider</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {MOBILE_BANKING_PROVIDERS.map((provider) => (
                            <button
                              key={provider.id}
                              type="button"
                              onClick={() => setSelectedProvider(provider.id)}
                              className={`relative flex flex-col items-center gap-1.5 border-2 rounded-xl p-3 transition-all text-center ${selectedProvider === provider.id
                                ? `border-primary ${provider.activeBg}`
                                : "border-border hover:border-primary/40 bg-white"
                                }`}
                            >
                              {/* Logo */}
                              <div className="w-12 h-12 relative">
                                <Image
                                  src={provider.logo}
                                  alt={provider.name}
                                  fill
                                  className="object-contain"
                                />
                              </div>

                              {/* Name */}
                              <span className="text-xs font-semibold">{provider.name}</span>

                              {/* Selected check */}
                              {selectedProvider === provider.id && (
                                <CheckCircle2 className="h-3.5 w-3.5 text-primary absolute top-1.5 right-1.5" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* STEP 2 – Send money instruction (shown after provider selected) */}
                      {activeProvider && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">2</span>
                            <p className="text-sm font-semibold">
                              Send <span className="text-primary font-bold">${total.toFixed(2)}</span> to our {activeProvider.name} number
                            </p>
                          </div>

                          <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-3">
                            {/* Account number display */}
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">
                                  {activeProvider.name} {activeProvider.type} Number
                                </p>
                                <p className="text-xl font-bold font-mono tracking-widest">
                                  {activeProvider.accountNo}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-1.5 h-9 shrink-0"
                                onClick={() => handleCopyAccount(activeProvider.accountNo)}
                              >
                                {copiedAccount ? (
                                  <>
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                    <span className="text-xs text-green-600">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3.5 w-3.5" />
                                    <span className="text-xs">Copy</span>
                                  </>
                                )}
                              </Button>
                            </div>

                            {/* Warning note */}
                            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                              <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                              <p className="text-xs text-amber-700 leading-relaxed">
                                Use <strong>Send Money</strong> option (not Payment). Send exactly{" "}
                                <strong>${total.toFixed(2)}</strong> and note down your <strong>Transaction ID</strong> from the confirmation SMS.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STEP 3 – Enter sender account & transaction ID */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">3</span>
                          <p className="text-sm font-semibold">Enter your payment confirmation details</p>
                        </div>

                        <div className="space-y-4 bg-muted/20 rounded-xl p-4 border border-border">
                          {/* Sender account number */}
                          <div className="space-y-2">
                            <Label htmlFor="accountNo" className="text-sm font-medium">
                              Your {activeProvider?.name ?? "Mobile Banking"} Account Number{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="accountNo"
                              value={accountNo}
                              onChange={(e) => setAccountNo(e.target.value)}
                              className="h-10 font-mono bg-white"
                              placeholder="e.g. 01700-123456"
                            />
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Info className="h-3 w-3" />
                              The number you used to send money <strong>from</strong>
                            </p>
                          </div>

                          {/* Transaction ID */}
                          <div className="space-y-2">
                            <Label htmlFor="transactionNo" className="text-sm font-medium">
                              Transaction ID / TrxID{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="transactionNo"
                              value={transactionNo}
                              onChange={(e) => setTransactionNo(e.target.value.toUpperCase())}
                              className="h-10 font-mono bg-white tracking-wider"
                              placeholder="e.g. ABC1234XYZ"
                            />
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Info className="h-3 w-3" />
                              Found in your {activeProvider?.name ?? "mobile banking"} app or confirmation SMS
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Security note */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                    <ShieldCheck className="h-4 w-4 text-green-500 shrink-0" />
                    {paymentMethod === "mobile_banking"
                      ? "Our team manually verifies all mobile banking payments within 1–2 hours."
                      : "Your order details are encrypted and transmitted securely."}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── RIGHT: Order Summary ─────────────────────────────────────── */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4 shadow-sm border-0 ring-1 ring-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items list */}
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {items.map((item) => {
                      const price = item.price
                      const images: string[] = Array.isArray(item.images)
                        ? item.images
                        : typeof item.images === "string"
                          ? JSON.parse(item.images)
                          : []
                      const imageUrl = images.length > 0 ? images[0] : "/placeholder.svg?height=64&width=64"

                      return (
                        <div key={`${item.product_id}-${item.variant?.id || "default"}`} className="flex gap-3 items-start">
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
                            <p className="text-sm font-semibold mt-1">${(item.price_snapshot * item.quantity).toFixed(2)}</p>
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
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                        {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (8%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span className="text-lg">${total.toFixed(2)}</span>
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
                            {activeProvider ? activeProvider.name : "Mobile Banking"}
                          </strong>
                        </span>
                      </>
                    )}
                  </div>

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
                        Place Order · ${total.toFixed(2)}
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
            </div>

          </div>
        </form>
      </main>

      <Footer />
    </div>
  )
}