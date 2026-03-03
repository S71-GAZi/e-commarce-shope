"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AddToCartButton } from "@/components/home/AddToCartButton"
import { ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { toast } from "@/hooks/use-toast"

const sizes = ["S", "M", "L", "XL", "XXL", "XXXL"]

export default function ProductPurchaseOptions({
    product,
    buy_now,
}: {
    product: any
    buy_now: boolean
}) {
    const router = useRouter()

    const [selectedSize, setSelectedSize] = useState<string>()
    const [productCode, setProductCode] = useState("")
    const [quantity, setQuantity] = useState(1)
    const [note, setNote] = useState("")
    const [sampleImage, setSampleImage] = useState<File | null>(null)
    const { buyNow } = useCart()
    const handleBuyNow = async () => {
        if (!selectedSize) {
            toast({
                title: "Error",
                description: "Please select a size",
                variant: "destructive",
            })
            return
        }

        await buyNow({
            product,
            quantity,
            selectedSize,
            productCode,
            note,
            sampleImage,
        })

        router.push("/checkout?type=buy_now")
    }
    return (
        <div className="space-y-6">

            {/* Size Selection */}
            <div>
                <p className="font-medium mb-2">Select Size:</p>
                <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                        <Button
                            key={size}
                            type="button"
                            variant={selectedSize === size ? "default" : "outline"}
                            onClick={() => setSelectedSize(size)}
                            className="cursor-pointer"
                        >
                            {size}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Quantity */}
            <div>
                <p className="font-medium mb-2">Quantity:</p>
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    >
                        -
                    </Button>

                    <span className="text-lg font-medium w-8 text-center">
                        {quantity}
                    </span>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setQuantity((prev) => prev + 1)}
                    >
                        +
                    </Button>
                </div>
            </div>

            {/* Product Code */}
            <div>
                <p className="font-medium mb-2">Product Code:</p>
                <Input
                    placeholder="Enter product code"
                    value={productCode}
                    onChange={(e) => setProductCode(e.target.value)}
                />
            </div>

            {/* Note */}
            <div>
                <p className="font-medium mb-2">Note (Optional):</p>
                <textarea
                    className="w-full border rounded-md px-3 py-2"
                    rows={3}
                    placeholder="Write your custom note..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </div>

            {/* Sample Image Upload */}
            <div>
                <p className="font-medium mb-2">Upload Sample Image (Optional):</p>
                <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                        setSampleImage(e.target.files ? e.target.files[0] : null)
                    }
                />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
                {buy_now ? (
                    <Button
                        size="lg"
                        className="w-full cursor-pointer"
                        onClick={handleBuyNow}
                    >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Buy Now
                    </Button>
                ) : (
                    <AddToCartButton
                        product={product}
                        selectedSize={selectedSize}
                        quantity={quantity}
                        productCode={productCode}
                    />
                )}
            </div>
        </div>
    )
}