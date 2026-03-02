"use client" // This makes the component a client component

import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { IAddToCartParams } from "@/lib/types/intrerface"


export function AddToCartButton(
    {
        product,
        selectedSize,
        quantity = 1,
        productCode,
    }: IAddToCartParams) {

    const { addItem } = useCart()

    const handleAddToCart = () => {
        addItem({ product, selectedSize, quantity, productCode })
    }

    return (
        <Button size="lg" className="flex-1 cursor-pointer" onClick={handleAddToCart} disabled={product.stock_quantity <= 0}>
            <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
        </Button>
    )
}