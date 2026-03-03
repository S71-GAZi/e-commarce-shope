"use client"

import { useState, useRef } from "react"
import divisionsData from "../json/division.json"
import districtsData from "../json/district.json"
import upazilasData from "../json/upazila.json"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea" // Make sure this is installed
import { Truck, Tag, Image as ImageIcon, X } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { base64ToFile } from "@/app/utils/image-utils"

interface Props {
    user: any
    onChange: (data: any) => void
}

export default function ShippingForm({ user, onChange }: Props) {
    const [selectedDivision, setSelectedDivision] = useState<any>()
    const [selectedDistrict, setSelectedDistrict] = useState<any>()
    const [selectedUpazila, setSelectedUpazila] = useState<any>()
    const [districts, setDistricts] = useState<any[]>([])
    const [upazilas, setUpazilas] = useState<any[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)



    const { buyNowItem } = useCart()
    const [note, setNote] = useState<string>(buyNowItem?.note || "")
    // ShippingForm.tsx
    const [imageFile, setImageFile] = useState<File | null>(() =>
        buyNowItem?.sample_image
            ? base64ToFile(buyNowItem.sample_image, "sample.jpg")
            : null
    )
    const [previewImage, setPreviewImage] = useState<any>(
        buyNowItem?.sample_image || null
    )

    // const shipping = subtotal >= 75 ? 0 : 9.99

    const notify = (extra: any = {}) => {
        onChange({
            name: (document.getElementById("s-name") as HTMLInputElement)?.value,
            email: (document.getElementById("s-email") as HTMLInputElement)?.value,
            phone: (document.getElementById("s-phone") as HTMLInputElement)?.value,
            division: selectedDivision?.name,
            district: selectedDistrict?.name,
            upazila: selectedUpazila?.name,
            address: (document.getElementById("s-address") as HTMLInputElement)?.value,
            note: note,
            // sample_image: imageFile,
            imagePreview: previewImage,
            ...extra,
        })
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!file.type.startsWith("image/")) {
                alert("Please select a valid image file.")
                return
            }
            if (file.size > 5 * 1024 * 1024) {
                alert("Image size should be less than 5MB.")
                return
            }
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewImage(reader.result as string)
                notify({ sample_image: file, imagePreview: reader.result as string })
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setPreviewImage(null)
        setImageFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
        notify({ sample_image: null, imagePreview: null })
    }

    return (
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

                {/* Name */}
                <div className="space-y-2">
                    <Label htmlFor="s-name" className="text-sm font-medium">
                        Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="s-name"
                        required
                        defaultValue={user?.full_name}
                        className="w-full h-10"
                        placeholder="John Doe"
                        onChange={() => notify()}
                    />
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="s-email" className="text-sm font-medium">
                            Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="s-email"
                            type="email"
                            required
                            defaultValue={user?.email}
                            className="w-full h-10"
                            placeholder="john@example.com"
                            onChange={() => notify()}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="s-phone" className="text-sm font-medium">
                            Phone <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="s-phone"
                            type="tel"
                            required
                            defaultValue={user?.phone}
                            className="w-full h-10"
                            placeholder="+880 1XXX-XXXXXX"
                            onChange={() => notify()}
                        />
                    </div>
                </div>

                {/* Division + District + Upazila */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Division */}
                    <div className="space-y-2">
                        <Label htmlFor="division" className="text-sm font-medium">
                            Division <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            onValueChange={(id) => {
                                const division = divisionsData.find((d) => d.id === id)
                                setSelectedDivision(division)
                                setSelectedDistrict(undefined)
                                setSelectedUpazila(undefined)
                                setDistricts(districtsData.filter((d) => d.division_id === id))
                                setUpazilas([])
                                notify({ division: division?.name, district: undefined, upazila: undefined })
                            }}
                        >
                            <SelectTrigger id="division" className="w-full h-10">
                                <SelectValue placeholder="Select Division" />
                            </SelectTrigger>
                            <SelectContent>
                                {divisionsData.map((d) => (
                                    <SelectItem key={d.id} value={d.id}>
                                        {d.name} ({d.name_bn})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* District */}
                    <div className="space-y-2">
                        <Label htmlFor="district" className="text-sm font-medium">
                            District <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            onValueChange={(id) => {
                                const district = districts.find((d) => d.id === id)
                                setSelectedDistrict(district)
                                setSelectedUpazila(undefined)
                                setUpazilas(upazilasData.filter((u) => u.district_id === id))
                                notify({ district: district?.name, upazila: undefined })
                            }}
                        >
                            <SelectTrigger id="district" className="w-full h-10">
                                <SelectValue placeholder="Select District" />
                            </SelectTrigger>
                            <SelectContent>
                                {districts.map((d) => (
                                    <SelectItem key={d.id} value={d.id}>
                                        {d.name} ({d.name_bn})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Upazila */}
                    <div className="space-y-2">
                        <Label htmlFor="upazila" className="text-sm font-medium">
                            Thana / Upazila <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            onValueChange={(id) => {
                                const upazila = upazilas.find((u) => u.id === id)
                                setSelectedUpazila(upazila)
                                notify({ upazila: upazila?.name })
                            }}
                        >
                            <SelectTrigger id="upazila" className="w-full h-10">
                                <SelectValue placeholder="Select Upazila / Thana" />
                            </SelectTrigger>
                            <SelectContent>
                                {upazilas.map((u) => (
                                    <SelectItem key={u.id} value={u.id}>
                                        {u.name} ({u.name_bn})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Street Address */}
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="s-address" className="text-sm font-medium">
                            Street Address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="s-address"
                            required
                            className="w-full h-10"
                            placeholder="House #, Road #, Area"
                            onChange={() => notify()}
                        />
                    </div>
                </div>

                {/* Delivery Note */}
                <div className="space-y-2">
                    <Label htmlFor="s-note" className="text-sm font-medium">
                        Delivery Note <span className="text-muted-foreground">(Optional)</span>
                    </Label>
                    <Textarea
                        id="s-note"
                        className="w-full min-h-20 resize-y"
                        placeholder="Any special instructions? e.g., 'Leave at front desk', 'Call upon arrival'..."
                        value={note}
                        onChange={(e) => {
                            setNote(e.target.value)
                            notify({ note: e.target.value })
                        }}
                    />
                </div>

                {/* Image Upload with Preview */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Upload Reference Image <span className="text-muted-foreground">(Optional)</span>
                    </Label>
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                        {!previewImage ? (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-dashed border-muted-foreground/50 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <ImageIcon className="h-4 w-4" />
                                Choose Image
                            </button>
                        ) : (
                            <div className="relative group">
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    className="w-20 h-20 object-cover rounded-lg border shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                                    aria-label="Remove image"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        )}
                        {previewImage && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-sm text-primary hover:underline"
                            >
                                Change
                            </button>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Max 5MB • JPG, PNG, GIF • Helps delivery personnel locate your address
                    </p>
                </div>

                {/* Shipping badge */}
                {/* {shipping === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">
                        <Truck className="h-4 w-4" />
                        <span className="font-medium">You qualify for FREE shipping!</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                        <Tag className="h-4 w-4" />
                        <span>
                            Spend <strong>${(75 - subtotal).toFixed(2)}</strong> more for free shipping
                        </span>
                    </div>
                )} */}

            </CardContent>
        </Card>
    )
}