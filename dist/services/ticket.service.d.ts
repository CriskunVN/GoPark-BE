export function checkInBooking(id: any): Promise<import("mongoose").Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: import("mongoose").Types.ObjectId;
    parkingSlotId: import("mongoose").Types.ObjectId;
    status: "pending" | "confirmed" | "cancelled" | "completed" | "checked-in" | "over-due";
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "pay-at-parking" | "prepaid";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month";
    discount: number;
    totalPrice: number;
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
    userId: import("mongoose").Types.ObjectId;
    parkingSlotId: import("mongoose").Types.ObjectId;
    status: "pending" | "confirmed" | "cancelled" | "completed" | "checked-in" | "over-due";
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "pay-at-parking" | "prepaid";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month";
    discount: number;
    totalPrice: number;
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
    userId: import("mongoose").Types.ObjectId;
    parkingSlotId: import("mongoose").Types.ObjectId;
    status: "pending" | "confirmed" | "cancelled" | "completed" | "checked-in" | "over-due";
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "pay-at-parking" | "prepaid";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month";
    discount: number;
    totalPrice: number;
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
    userId: import("mongoose").Types.ObjectId;
    parkingSlotId: import("mongoose").Types.ObjectId;
    status: "pending" | "confirmed" | "cancelled" | "completed" | "checked-in" | "over-due";
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "pay-at-parking" | "prepaid";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month";
    discount: number;
    totalPrice: number;
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
    parkingSlotId: import("mongoose").Types.ObjectId;
    status: "cancelled" | "active" | "used";
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
    status: "cancelled" | "active" | "used";
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