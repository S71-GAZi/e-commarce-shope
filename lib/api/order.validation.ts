import { nullable, z } from "zod";

export const ShippingInfoSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email").nullable().optional(), // ✅ nullable (guest checkout)
    phone: z.string().min(8, "Phone number is required"),

    division: z.string().min(1, "Division is required"),
    district: z.string().min(1, "District is required"),
    upazila: z.string().min(1, "Upazila is required"),
    address: z.string().min(1, "Address is required"),

    // backend assigns these later
    shipping_method: z.string().nullable().optional(),
    courier_name: z.string().nullable().optional(),
    tracking_code: z.string().nullable().optional(),
});

export const PaymentSchema = z
    .object({
        payment_method: z.enum(["cod", "mobile_banking"]),
        payment_provider: z.string().nullable().optional(),
        payment_sender_account: z.string().nullable().optional(),
        payment_transaction_id: z.string().nullable().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.payment_method === "mobile_banking") {
            if (!data.payment_provider) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Payment provider is required for mobile banking",
                    path: ["payment_provider"],
                });
            }

            if (!data.payment_sender_account) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Sender account is required",
                    path: ["payment_sender_account"],
                });
            }

            if (!data.payment_transaction_id) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Transaction ID is required",
                    path: ["payment_transaction_id"],
                });
            }
        }
    });

export const OrderItemSchema = z.object({
    product_id: z.string().min(1, "Product Id is required"),
    variant_id: z.number().int().positive().nullable().optional(),

    name: z.string().min(1, "Item name is required"),
    slug: z.string().nullable().optional(),
    price_snapshot: z.coerce.number().nonnegative("Price must be non-negative"),
    quantity: z.number().int().min(1, "Quantity must be at least 1"),

    images: z.string().nullable().optional(),
    selected_size: z.string().nullable().optional(),
    product_code: z.string().nullable().optional()
});

export const CreateOrderSchema = z
    .object({
        shipping_info: ShippingInfoSchema,
        payment: PaymentSchema,

        items: z.array(OrderItemSchema).min(1, "Order must have at least one item"),

        subtotal: z.number().nonnegative("Subtotal must be non-negative"),
        shipping: z.number().nonnegative("Shipping must be non-negative"),
        tax: z.number().nonnegative("Tax must be non-negative"),
        discount: z.number().nonnegative("Discount must be non-negative").default(0), // ✅ default(0) — always present
        coupon_code: z.string().nullable().optional(),
        total: z.number().nonnegative("Total must be non-negative"),

        note: z.string().max(500, "Note must be under 500 characters").nullable().optional(), // ✅ max length
        sample_image: z.string().url("Invalid image URL").nullable().optional(), // ✅ url validation
    })
    .superRefine((data, ctx) => {
        // ✅ total integrity check
        const expected = data.subtotal + data.shipping + data.tax - (data.discount ?? 0);
        if (Math.round(data.total * 100) !== Math.round(expected * 100)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Total mismatch: expected ${expected.toFixed(2)}, got ${data.total.toFixed(2)}`,
                path: ["total"],
            });
        }
    });

export const UpdateOrderStatusSchema = z.object({
    order_id: z.string().min(1, "Order ID is required"),

    // Order status could be pending, processing, completed, cancelled, refunded, etc.
    status: z.enum(["pending", "processing", "completed", "cancelled", "refunded"]),

    // Optional payment status update
    payment_status: z.enum(["pending", "paid", "failed", "refunded"]).nullable().optional(),

    // Optional shipping status update
    shipping_status: z.enum(["pending", "shipped", "delivered", "returned", "cancelled"]).nullable().optional(),

    // Optional note for status update
    note: z.string().max(500, "Note must be under 500 characters").nullable().optional(),
});


// ✅ Inferred types from schema
export type TCreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type TOrderItemInput = z.infer<typeof OrderItemSchema>;
export type TShippingInfoInput = z.infer<typeof ShippingInfoSchema>;
export type TPaymentInput = z.infer<typeof PaymentSchema>;
export type TUpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;