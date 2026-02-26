"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Eye, Mail, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { IUser } from "@/lib/types/intrerface"
import { useFetchResource } from "@/hooks/useFetchResource"

export default function CustomersPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)


  /* ================= FETCH Customer ================= */
  const {
    data: customers,
    isLoading,
    fetchData: fetchCustomers,
  } = useFetchResource<IUser>({
    url: "/api/admin/customers",
    extractData: (result) =>
      Array.isArray(result)
        ? result
        : Array.isArray(result?.data?.customers)
          ? result.data.customers
          : [],
  })

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const filteredCustomers = customers.filter(
    (customer) =>
      customer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleViewDetails = (customer: any) => {
    setSelectedCustomer(customer)
    setDetailsOpen(true)
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/customers/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update");

      // Optimistic UI update
      fetchCustomers()
      toast({
        title: "Status updated",
        description: `Customer status changed to ${newStatus}`,
      });

    } catch (err) {
      alert("Failed to update status");
    }
  };

  // const handleSendEmail = (customer: any) => {
  //   toast({
  //     title: "Email client opened",
  //     description: `Opening email to ${customer.email}`,
  //   })
  //   window.location.href = `mailto:${customer.email}`
  // }

  const handleExport = () => {
    const csvContent = [
      ["Name", "Email", "Orders", "Total Spent", "Status", "Joined"].join(","),
      ...filteredCustomers.map((customer) =>
        [
          customer.full_name,
          customer.email,
          customer.orders,
          customer.total_spent.toFixed(2),
          customer.status,
          new Date(customer.joinedDate).toLocaleDateString(),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `customers-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Customers exported",
      description: "Customer data has been exported to CSV.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage your customer base</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export Customers
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
          <CardDescription>View and manage customer information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.full_name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.orders}</TableCell>
                    <TableCell>  ${Number(customer.total_spent).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        variant={customer.status === "active" ? "default" : "destructive"}
                        size="sm"
                        onClick={() => handleToggleStatus(customer.id, customer.status)}
                      >
                        {customer.status}
                      </Button>
                    </TableCell>
                    <TableCell>{new Date(customer.joinedDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewDetails(customer)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                        {/* <Button variant="ghost" size="icon" onClick={() => handleSendEmail(customer)}>
                          <Mail className="h-4 w-4" />
                          <span className="sr-only">Send email</span>
                        </Button> */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No customers found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>View detailed customer information</DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-muted-foreground">{selectedCustomer.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-muted-foreground">{selectedCustomer.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Total Orders</p>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.orders}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Spent</p>
                  <p className="text-sm text-muted-foreground">
                    ${Number(selectedCustomer.total_spent).toFixed(2)}
                    {/* ${Number(selectedCustomer.total_spent.toFixed(2))} */}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Member Since</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedCustomer.joinedDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
