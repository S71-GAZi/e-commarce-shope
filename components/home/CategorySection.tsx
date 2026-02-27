"use client"
import { useFetchResource } from "@/hooks/useFetchResource"
import { ICategory } from "@/lib/types/intrerface"
import { useEffect, useRef, useState } from "react"
import Slider from "react-slick"
import { Card, CardContent } from "../ui/card"
import Image from "next/image"
import Link from "next/link"

function CategoriesSection() {
    const { data: categories, isLoading, fetchData: fetchCategories } =
        useFetchResource<ICategory>({
            url: "/api/admin/categories",
            extractData: (result) =>
                Array.isArray(result)
                    ? result
                    : Array.isArray(result?.data?.categories)
                        ? result.data.categories
                        : [],
        })

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    const [dragging, setDragging] = useState(false)
    const sliderRef = useRef<any>(null)

    const settings = {
        infinite: true,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        arrows: true,
        swipeToSlide: true,
        touchThreshold: 10,
        beforeChange: () => setDragging(true),
        afterChange: () => setDragging(false),
        responsive: [
            { breakpoint: 1440, settings: { slidesToShow: 4 } },
            { breakpoint: 1024, settings: { slidesToShow: 3 } },
            { breakpoint: 600, settings: { slidesToShow: 2 } },
            { breakpoint: 480, settings: { slidesToShow: 1 } },
        ],
    }

    if (isLoading) return <p>Loading categories...</p>
    if (!categories || categories.length === 0) return <p>No categories found.</p>

    return (
        <div className="container mx-auto px-4 py-12" style={{ touchAction: "pan-y" }}>
            <h2 className="text-2xl font-semibold mb-6">Categories</h2>
            <Slider ref={sliderRef} {...settings}>
                {categories.map((category) => (
                    <div key={category.id} className="px-2">
                        <Link
                            href={`/products?category=${category.slug}`}
                            onClick={(e) => {
                                if (dragging) {
                                    e.preventDefault() // prevent navigation if dragging
                                }
                            }}
                        >
                            <Card className="group overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                                <CardContent className="p-0">
                                    <div className="relative aspect-square overflow-hidden bg-muted">
                                        <Image
                                            src={category.image_url || "/placeholder.svg?height=300&width=300"}
                                            alt={category.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="p-4 text-center">
                                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                                            {category.name}
                                        </h3>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                ))}
            </Slider>
        </div>
    )
}

export default CategoriesSection