"use client"

import { useState } from "react"
import Image from "next/image"
import mobileBankingProvider from "../json/mobileBankingProvider.json"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    CreditCard,
    Banknote,
    Smartphone,
    CheckCircle2,
    Copy,
    Info,
    ShieldCheck,
} from "lucide-react"

type PaymentMethod = "cod" | "mobile_banking"

interface Props {
    total: number
    onChange: (data: any) => void
}

export default function PaymentForm({ total, onChange }: Props) {
    const [method, setMethod] = useState<PaymentMethod>("cod")
    const [provider, setProvider] = useState("")
    const [account, setAccount] = useState("")
    const [trx, setTrx] = useState("")
    const [copiedAccount, setCopiedAccount] = useState(false)

    const activeProvider = mobileBankingProvider.find((p) => p.id === provider)

    const notify = (extra: any = {}) => {
        onChange({
            payment_method: method,
            provider,
            senderAccount: account,
            transactionId: trx,
            ...extra,
        })
    }

    const handleCopy = (number: string) => {
        navigator.clipboard.writeText(number)
        setCopiedAccount(true)
        setTimeout(() => setCopiedAccount(false), 2000)
    }

    return (
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

                {/* ── Method selector cards ─────────────────────────────── */}
                <RadioGroup
                    value={method}
                    onValueChange={(v) => {
                        const m = v as PaymentMethod
                        setMethod(m)
                        if (m !== "mobile_banking") {
                            setProvider("")
                            setAccount("")
                            setTrx("")
                        }
                        notify({ payment_method: m })
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                    {/* COD */}
                    <label
                        htmlFor="cod"
                        className={`flex items-center gap-3 border-2 rounded-xl p-4 cursor-pointer transition-all ${method === "cod"
                            ? "border-green-500 bg-green-50"
                            : "border-border hover:border-green-300"
                            }`}
                    >
                        <RadioGroupItem value="cod" id="cod" />
                        <div className="flex items-center gap-2 flex-1">
                            <div className={`p-2 rounded-lg ${method === "cod" ? "bg-green-100" : "bg-muted"}`}>
                                <Banknote className={`h-4 w-4 ${method === "cod" ? "text-green-600" : "text-muted-foreground"}`} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Cash on Delivery</p>
                                <p className="text-xs text-muted-foreground">Pay when order arrives</p>
                            </div>
                        </div>
                        {method === "cod" && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
                    </label>

                    {/* Mobile Banking */}
                    <label
                        htmlFor="mobile_banking"
                        className={`flex items-center gap-3 border-2 rounded-xl p-4 cursor-pointer transition-all ${method === "mobile_banking"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                            }`}
                    >
                        <RadioGroupItem value="mobile_banking" id="mobile_banking" />
                        <div className="flex items-center gap-2 flex-1">
                            <div className={`p-2 rounded-lg ${method === "mobile_banking" ? "bg-primary/10" : "bg-muted"}`}>
                                <Smartphone className={`h-4 w-4 ${method === "mobile_banking" ? "text-primary" : "text-muted-foreground"}`} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Mobile Banking</p>
                                <p className="text-xs text-muted-foreground">bKash · Nagad · Rocket · Upay</p>
                            </div>
                        </div>
                        {method === "mobile_banking" && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                    </label>
                </RadioGroup>

                {/* ── COD Info ─────────────────────────────────────────── */}
                {method === "cod" && (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2">
                            <Banknote className="h-4 w-4 text-green-600" />
                            <p className="text-sm font-semibold text-green-700">Cash on Delivery Instructions</p>
                        </div>
                        <ul className="text-sm text-green-700 space-y-1.5 ml-6 list-disc">
                            <li>Pay in cash when your order is delivered to your door</li>
                            <li>Please keep the exact amount ready: <strong>BDT {total.toFixed(2)}</strong></li>
                            <li>Our delivery agent will collect payment on arrival</li>
                        </ul>
                    </div>
                )}

                {/* ── Mobile Banking Flow ───────────────────────────────── */}
                {method === "mobile_banking" && (
                    <div className="space-y-6 pt-1 border-t">

                        {/* STEP 1 – Choose provider */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">1</span>
                                <p className="text-sm font-semibold">Select your Mobile Banking provider</p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {mobileBankingProvider
                                    .filter((provider) => provider.active).map((p) => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => {
                                                setProvider(p.id)
                                                notify({ provider: p.id })
                                            }}
                                            className={`relative flex flex-col items-center gap-1.5 border-2 rounded-xl p-3 transition-all text-center ${provider === p.id
                                                ? `border-primary ${p.activeBg ?? "bg-primary/5"}`
                                                : "border-border hover:border-primary/40 bg-white"
                                                }`}
                                        >
                                            <div className="w-12 h-12 relative">
                                                <Image
                                                    src={p.logo}
                                                    alt={p.name}
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                            <span className="text-xs font-semibold">{p.name}</span>
                                            {provider === p.id && (
                                                <CheckCircle2 className="h-3.5 w-3.5 text-primary absolute top-1.5 right-1.5" />
                                            )}
                                        </button>
                                    ))}
                            </div>
                        </div>

                        {/* STEP 2 – Send money instruction */}
                        {activeProvider && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">2</span>
                                    <p className="text-sm font-semibold">
                                        Send <span className="text-primary font-bold">BDT {total.toFixed(2)}</span> to our {activeProvider.name} number
                                    </p>
                                </div>

                                <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-3">
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
                                            onClick={() => handleCopy(activeProvider.accountNo)}
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

                                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                                        <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-amber-700 leading-relaxed">
                                            Use <strong>Send Money</strong> option (not Payment). Send exactly{" "}
                                            <strong>BDT {total.toFixed(2)}</strong> and note down your <strong>Transaction ID</strong> from the confirmation SMS.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3 – Confirmation details */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">3</span>
                                <p className="text-sm font-semibold">Enter your payment confirmation details</p>
                            </div>

                            <div className="space-y-4 bg-muted/20 rounded-xl p-4 border border-border">
                                {/* Sender account */}
                                <div className="space-y-2">
                                    <Label htmlFor="accountNo" className="text-sm font-medium">
                                        Your {activeProvider?.name ?? "Mobile Banking"} Account Number{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="accountNo"
                                        value={account}
                                        onChange={(e) => {
                                            setAccount(e.target.value)
                                            notify({ senderAccount: e.target.value })
                                        }}
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
                                        Transaction ID / TrxID <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="transactionNo"
                                        value={trx}
                                        onChange={(e) => {
                                            const val = e.target.value.toUpperCase()
                                            setTrx(val)
                                            notify({ transactionId: val })
                                        }}
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
                    {method === "mobile_banking"
                        ? "Our team manually verifies all mobile banking payments within 1–2 hours."
                        : "Your order details are encrypted and transmitted securely."}
                </div>

            </CardContent>
        </Card>
    )
}