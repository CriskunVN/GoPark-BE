export function checkInBooking(id: any): Promise<import("mongoose").Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "pending" | "confirmed" | "cancelled" | "completed" | "checked-in" | "over-due";
    startTime: NativeDate;
    endTime: NativeDate;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "prepaid" | "pay-at-parking";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month";
    discount: number;
    totalPrice: number;
    userId?: import("mongoose").Types.ObjectId | null;
    parkingSlotId?: import("mongoose").Types.ObjectId | null;
    vehicleId?: import("mongoose").Types.ObjectId | null;
    vehicleSnapshot?: {
        image: string;
        number?: string | null;
    } | null;
    overDueInfo?: {
        overDueStart?: NativeDate | null;
        overDueEnd?: NativeDate | null;
        overDueMinutes?: number | null;
        overDueFee?: number | null;
    } | null;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "pending" | "confirmed" | "cancelled" | "completed" | "checked-in" | "over-due";
    startTime: NativeDate;
    endTime: NativeDate;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "prepaid" | "pay-at-parking";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month";
    discount: number;
    totalPrice: number;
    userId?: import("mongoose").Types.ObjectId | null;
    parkingSlotId?: import("mongoose").Types.ObjectId | null;
    vehicleId?: import("mongoose").Types.ObjectId | null;
    vehicleSnapshot?: {
        image: string;
        number?: string | null;
    } | null;
    overDueInfo?: {
        overDueStart?: NativeDate | null;
        overDueEnd?: NativeDate | null;
        overDueMinutes?: number | null;
        overDueFee?: number | null;
    } | null;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export function checkOutBooking(id: any): Promise<import("mongoose").Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "pending" | "confirmed" | "cancelled" | "completed" | "checked-in" | "over-due";
    startTime: NativeDate;
    endTime: NativeDate;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "prepaid" | "pay-at-parking";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month";
    discount: number;
    totalPrice: number;
    userId?: import("mongoose").Types.ObjectId | null;
    parkingSlotId?: import("mongoose").Types.ObjectId | null;
    vehicleId?: import("mongoose").Types.ObjectId | null;
    vehicleSnapshot?: {
        image: string;
        number?: string | null;
    } | null;
    overDueInfo?: {
        overDueStart?: NativeDate | null;
        overDueEnd?: NativeDate | null;
        overDueMinutes?: number | null;
        overDueFee?: number | null;
    } | null;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "pending" | "confirmed" | "cancelled" | "completed" | "checked-in" | "over-due";
    startTime: NativeDate;
    endTime: NativeDate;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "prepaid" | "pay-at-parking";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month";
    discount: number;
    totalPrice: number;
    userId?: import("mongoose").Types.ObjectId | null;
    parkingSlotId?: import("mongoose").Types.ObjectId | null;
    vehicleId?: import("mongoose").Types.ObjectId | null;
    vehicleSnapshot?: {
        image: string;
        number?: string | null;
    } | null;
    overDueInfo?: {
        overDueStart?: NativeDate | null;
        overDueEnd?: NativeDate | null;
        overDueMinutes?: number | null;
        overDueFee?: number | null;
    } | null;
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
    slotNumber: string;
    status: "cancelled" | "active" | "used";
    paymentStatus: never;
    bookingId: import("mongoose").Types.ObjectId;
    vehicleNumber: string;
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
    slotNumber: string;
    status: "cancelled" | "active" | "used";
    paymentStatus: never;
    bookingId: import("mongoose").Types.ObjectId;
    vehicleNumber: string;
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