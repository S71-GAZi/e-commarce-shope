"use client"

export const dynamic = "force-dynamic";

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Loader2, Upload, X } from "lucide-react"
import Image from "next/image"
import type { ICategory } from "@/lib/types/intrerface"
import { useFetchResource } from "@/hooks/useFetchResource"

export default function CategoriesPage() {
  const { toast } = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<ICategory | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  /* ================= FETCH CATEGORIES ================= */
  const {
    data: categories,
    isLoading,
    fetchData: fetchCategories,
  } = useFetchResource<ICategory>({
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


  //--------- Image Uploade 
  const [image, setImage] = useState<File | null>(null);

  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];

  //   if (!file) return;

  //   // Optional: Validate size (600KB max)
  //   if (file.size > 600 * 1024) {
  //     alert("Image must be 600 KB or less");
  //     return;
  //   }

  //   setImage(file);
  // };

  // const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
  //   e.preventDefault();
  //   const file = e.dataTransfer.files?.[0];

  //   if (!file) return;

  //   if (file.size > 600 * 1024) {
  //     alert("Image must be 600 KB or less");
  //     return;
  //   }

  //   setImage(file);
  // };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > 600 * 1024) {
      alert("Image must be 600 KB or less");
      return;
    }

    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // const removeImage = () => {
  //   setImage(null);
  // };

  const removeImage = () => {
    setImage(null);
    setPreviewUrl(null);
  };

  const handleEdit = (category: ICategory) => {
    setEditingCategory(category);
    setPreviewUrl(category.image_url || null); // 👈 SET OLD IMAGE
    setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 600 * 1024) {
      alert("Image must be 600 KB or less");
      return;
    }

    setImage(file);
    setPreviewUrl(URL.createObjectURL(file)); // 👈 SET PREVIEW
  };
  //--------- Image Uploade end

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const formData = new FormData(e.currentTarget)
      // const categoryData = {
      //   name: formData.get("categoryName"),
      //   slug: formData.get("categorySlug"),
      //   description: formData.get("categoryDescription") || null,
      // }

      const name = (formData.get("categoryName") as string) || ""
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")

      formData.append("categorySlug", slug)
      formData.append("image", image as any)
      const method = editingCategory ? "PATCH" : "POST"
      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : "/api/admin/categories"

      const response = await fetch(url, {
        method,
        // headers: { "Content-Type": "multipart/form-data" },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to save category",
          variant: "destructive",
        })
        return
      }

      toast({
        title: editingCategory ? "Category updated" : "Category created",
        description: `Your category has been ${editingCategory ? "updated" : "created"} successfully.`,
      })

      // ✅ REFETCH
      await fetchCategories()

      setIsOpen(false)
      setEditingCategory(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while saving the category",
        variant: "destructive",
      })
    }
  }

  // const handleEdit = (category: ICategory) => {
  //   setEditingCategory(category)
  //   setIsOpen(true)
  // }

  const handleDelete = (category: ICategory) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (categoryToDelete) {
      try {
        const response = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          toast({
            title: "Error",
            description: "Failed to delete category",
            variant: "destructive",
          })
          return
        }

        // ✅ REFETCH
        await fetchCategories()

        toast({
          title: "Category deleted",
          description: `${categoryToDelete.name} has been removed.`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "An error occurred while deleting the category",
          variant: "destructive",
        })
      } finally {
        setDeleteDialogOpen(false)
        setCategoryToDelete(null)
      }
    }
  }

  const handleDialogChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setEditingCategory(null)
    }
  }



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Organize your products into categories</p>
        </div>
        <Dialog open={isOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
                <DialogDescription>
                  {editingCategory ? "Update category information" : "Create a new product category"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    name="categoryName"
                    placeholder="Enter category name"
                    defaultValue={editingCategory?.name}
                    required
                  />
                </div>

                {/* <div className="space-y-2">
                  <Label htmlFor="categorySlug">Slug</Label>
                  <Input
                    id="categorySlug"
                    name="categorySlug"
                    placeholder="category-slug"
                    defaultValue={editingCategory?.slug}
                    required
                  />
                </div> */}

                <div className="space-y-2">
                  <Label htmlFor="categoryDescription">Description</Label>
                  <Input
                    id="categoryDescription"
                    name="categoryDescription"
                    placeholder="Category description"
                    defaultValue={editingCategory?.description || ""}
                  />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Product Image</CardTitle>
                    <CardDescription>Upload 1 image (max 600 KB)</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Upload Zone (Hide if image exists) */}
                    {!image && (
                      <div
                        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => document.getElementById("product-image")?.click()}
                      >
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Drag and drop image here, or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Only 1 image allowed · ≤ 600 KB
                        </p>

                        <input
                          type="file"
                          accept="image/*"
                          id="product-image"
                          className="hidden"
                          onChange={handleInputChange}
                        />
                      </div>
                    )}

                    {/* Image Preview */}
                    {previewUrl && (
                      <div className="relative w-40 h-40 rounded-md overflow-hidden border">
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-1 right-1 z-10 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>

                        <img
                          src={previewUrl}
                          alt="category-preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingCategory ? "Update Category" : "Create Category"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>Manage your product categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted">
                        <Image
                          src={category.image_url || "/placeholder.svg?height=64&width=64"}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell className="max-w-xs truncate">{category.description || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={category.is_active ? "default" : "secondary"}>
                        {category.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(category)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {categoryToDelete?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
