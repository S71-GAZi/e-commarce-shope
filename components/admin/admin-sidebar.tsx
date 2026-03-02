"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  FileText,
  Settings,
  BarChart3,
  ImageIcon,
} from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: Tag,
  },
  // {
  //   title: "Coupons",
  //   href: "/admin/coupons",
  //   icon: Tag,
  // },
  // {
  //   title: "Banners",
  //   href: "/admin/banners",
  //   icon: ImageIcon,
  // },
  // {
  //   title: "Content Pages",
  //   href: "/admin/pages",
  //   icon: FileText,
  // },
  // {
  //   title: "Analytics",
  //   href: "/admin/analytics",
  //   icon: BarChart3,
  // },
  // {
  //   title: "Settings",
  //   href: "/admin/settings",
  //   icon: Settings,
  // },
]

interface AdminSidebarProps {
  closeSidebar?: () => void
}

export function AdminSidebar({ closeSidebar }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">

      {/* Header */}
      <div className="p-4 sm:p-6 border-b">
        <h2 className="text-lg font-semibold">Admin Panel</h2>
      </div>

      {/* Menu */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Button
                key={item.href}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start transition-all duration-200",
                  isActive && "bg-secondary font-medium border-l-4 border-primary"
                )}
                asChild
              >
                <Link
                  href={item.href}
                  onClick={closeSidebar} // 👈 closes sidebar on mobile
                >
                  <Icon className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Link>
              </Button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
