export type TOrderStatus =
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";

export type TPaymentMethod = "cod" | "mobile_banking";

export type TPaymentStatus =
    | "pending"
    | "paid"
    | "failed"
    | "refunded";

export type TShippingStatus =
    | "pending"
    | "picked"
    | "in_transit"
    | "delivered"
    | "failed"
    | "returned";


export interface IOrder {
    id: number;
    order_number: string;
    user_id: number; // ✅ number, string নয় (FK হলে consistent রাখো)

    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    coupon_code: string | null;

    status: TOrderStatus;
    total: number;

    payment_method: TPaymentMethod;
    payment_status: TPaymentStatus;

    payment_provider: string | null;
    payment_sender_account: string | null;
    payment_transaction_id: string | null;

    note: string | null;
    note_image: string | null;
    ip_address: string | null;

    created_at: string;
    updated_at: string;
}

export interface IOrderItem {
    id: number;
    order_id: number;

    product_id: number; // ✅ string → number (DB FK)
    variant_id: number | null; // ✅ string → number (DB FK)

    name: string;
    slug: string | null;

    price_snapshot: number;
    quantity: number;

    images: string[] | null; // ✅ longtext JSON → parse করলে string[] ভালো
}


export interface IOrderShipping {
    id: number;
    order_id: number;

    name: string;
    email: string | null; // ✅ email সবসময় required নাও হতে পারে
    phone: string;

    division: string;
    district: string;
    upazila: string;
    address: string;

    shipping_method: string | null;
    courier_name: string | null;
    tracking_code: string | null;

    shipping_status: TShippingStatus;
}

export interface IOrderFull extends IOrder {
    items: IOrderItem[];
    shipping_info: IOrderShipping; // ✅ single object, array নয় — সঠিক আছে
}