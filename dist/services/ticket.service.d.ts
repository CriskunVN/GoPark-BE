export function checkInTicket(ticketId: any): Promise<import("mongoose").Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: import("mongoose").Types.ObjectId;
    parkingSlotId: import("mongoose").Types.ObjectId;
    status: "pending" | "cancelled" | "active" | "used" | "expired";
    vehicleNumber: string;
    paymentStatus: never;
    bookingId: import("mongoose").Types.ObjectId;
    ticketType: "date" | "hours" | "month" | "guest";
    checkInTime?: NativeDate | null;
    checkoutTime?: NativeDate | null;
    expiryDate?: NativeDate | null;
    qrCode?: string | null;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: import("mongoose").Types.ObjectId;
    parkingSlotId: import("mongoose").Types.ObjectId;
    status: "pending" | "cancelled" | "active" | "used" | "expired";
    vehicleNumber: string;
    paymentStatus: never;
    bookingId: import("mongoose").Types.ObjectId;
    ticketType: "date" | "hours" | "month" | "guest";
    checkInTime?: NativeDate | null;
    checkoutTime?: NativeDate | null;
    expiryDate?: NativeDate | null;
    qrCode?: string | null;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export function checkOutTicket(ticketId: any): Promise<import("mongoose").Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: import("mongoose").Types.ObjectId;
    parkingSlotId: import("mongoose").Types.ObjectId;
    status: "pending" | "cancelled" | "active" | "used" | "expired";
    vehicleNumber: string;
    paymentStatus: never;
    bookingId: import("mongoose").Types.ObjectId;
    ticketType: "date" | "hours" | "month" | "guest";
    checkInTime?: NativeDate | null;
    checkoutTime?: NativeDate | null;
    expiryDate?: NativeDate | null;
    qrCode?: string | null;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: import("mongoose").Types.ObjectId;
    parkingSlotId: import("mongoose").Types.ObjectId;
    status: "pending" | "cancelled" | "active" | "used" | "expired";
    vehicleNumber: string;
    paymentStatus: never;
    bookingId: import("mongoose").Types.ObjectId;
    ticketType: "date" | "hours" | "month" | "guest";
    checkInTime?: NativeDate | null;
    checkoutTime?: NativeDate | null;
    expiryDate?: NativeDate | null;
    qrCode?: string | null;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export function createTicket(ticketData: any): Promise<import("mongoose").Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: import("mongoose").Types.ObjectId;
    parkingSlotId: import("mongoose").Types.ObjectId;
    status: "pending" | "cancelled" | "active" | "used" | "expired";
    vehicleNumber: string;
    paymentStatus: never;
    bookingId: import("mongoose").Types.ObjectId;
    ticketType: "date" | "hours" | "month" | "guest";
    checkInTime?: NativeDate | null;
    checkoutTime?: NativeDate | null;
    expiryDate?: NativeDate | null;
    qrCode?: string | null;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: import("mongoose").Types.ObjectId;
    parkingSlotId: import("mongoose").Types.ObjectId;
    status: "pending" | "cancelled" | "active" | "used" | "expired";
    vehicleNumber: string;
    paymentStatus: never;
    bookingId: import("mongoose").Types.ObjectId;
    ticketType: "date" | "hours" | "month" | "guest";
    checkInTime?: NativeDate | null;
    checkoutTime?: NativeDate | null;
    expiryDate?: NativeDate | null;
    qrCode?: string | null;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=ticket.service.d.ts.map