"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Plus, Edit, Trash2, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ContentPage {
  id: string
  title: string
  slug: string
  is_published: boolean
  updated_at: string
}

export default function ContentPagesPage() {
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pageToDelete, setPageToDelete] = useState<ContentPage | null>(null)

  // Mock content pages data
  const [pages, setPages] = useState<ContentPage[]>([
    {
      id: "1",
      title: "About Us",
      slug: "about",
      is_published: true,
      updated_at: "2024-01-10T10:00:00Z",
    },
    {
      id: "2",
      title: "Contact",
      slug: "contact",
      is_published: true,
      updated_at: "2024-01-12T14:30:00Z",
    },
    {
      id: "3",
      title: "Privacy Policy",
      slug: "privacy",
      is_published: true,
      updated_at: "2024-01-05T09:15:00Z",
    },
    {
      id: "4",
      title: "Terms of Service",
      slug: "terms",
      is_published: true,
      updated_at: "2024-01-05T09:20:00Z",
    },
  ])

  const handleDelete = (page: ContentPage) => {
    setPageToDelete(page)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (pageToDelete) {
      setPages(pages.filter((p) => p.id !== pageToDelete.id))
      toast({
        title: "Page deleted",
        description: `${pageToDelete.title} has been removed.`,
      })
      setDeleteDialogOpen(false)
      setPageToDelete(null)
    }
  }

  const handleView = (page: ContentPage) => {
    toast({
      title: "Opening page",
      description: `Viewing ${page.title}`,
    })
    // In a real app, this would navigate to the page
    window.open(`/${page.slug}`, "_blank")
  }

  const handleEdit = (page: ContentPage) => {
    toast({
      title: "Edit page",
      description: `Opening editor for ${page.title}`,
    })
    // In a real app, this would navigate to the editor
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Pages</h1>
          <p className="text-muted-foreground">Manage static pages and content</p>
        </div>
        <Button
          onClick={() =>
            toast({
              title: "Create new page",
              description: "Opening page editor...",
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Page
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Pages</CardTitle>
          <CardDescription>Manage your website content pages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell>
                      <code className="text-sm">/{page.slug}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={page.is_published ? "default" : "secondary"}>
                        {page.is_published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(page.updated_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(page)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(page)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(page)}>
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
              This will permanently delete {pageToDelete?.title}. This action cannot be undone.
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
