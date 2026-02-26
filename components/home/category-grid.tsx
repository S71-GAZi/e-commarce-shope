import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import type { ICategory } from "@/lib/types/intrerface"

interface ICategoryGridProps {
  categories: ICategory[]
}

export function CategoryGrid({ categories }: ICategoryGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categories?.map((category) => (
        <Link key={category.id} href={`/products?category=${category.slug}`}>
          <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
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
                <h3 className="font-semibold group-hover:text-primary transition-colors">{category.name}</h3>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
