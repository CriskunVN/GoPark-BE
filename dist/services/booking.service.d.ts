export function createBookingForGuest(data: any): Promise<{
    booking: mongoose.Document<unknown, {}, {
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
        userId?: mongoose.Types.ObjectId | null;
        parkingSlotId?: mongoose.Types.ObjectId | null;
        vehicleId?: mongoose.Types.ObjectId | null;
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
        userId?: mongoose.Types.ObjectId | null;
        parkingSlotId?: mongoose.Types.ObjectId | null;
        vehicleId?: mongoose.Types.ObjectId | null;
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
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    };
    ticket: any;
}>;
export function createBooking(data: any): Promise<mongoose.Document<unknown, {}, {
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
    userId?: mongoose.Types.ObjectId | null;
    parkingSlotId?: mongoose.Types.ObjectId | null;
    vehicleId?: mongoose.Types.ObjectId | null;
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
    userId?: mongoose.Types.ObjectId | null;
    parkingSlotId?: mongoose.Types.ObjectId | null;
    vehicleId?: mongoose.Types.ObjectId | null;
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
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export function handleBookingAfterCreate(bookingData: any): Promise<{
    ticket: any;
    invoice?: never;
} | {
    invoice: mongoose.Document<unknown, {}, {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        userId: mongoose.Types.ObjectId;
        status: "paid" | "unpaid" | "failed";
        paymentMethod: "bank" | "cash" | "e-wallet";
        invoiceNumber: string;
        bookingId: mongoose.Types.ObjectId;
        amount: number;
        transactionId: string;
        paymentDate: NativeDate;
    }, {}> & {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        userId: mongoose.Types.ObjectId;
        status: "paid" | "unpaid" | "failed";
        paymentMethod: "bank" | "cash" | "e-wallet";
        invoiceNumber: string;
        bookingId: mongoose.Types.ObjectId;
        amount: number;
        transactionId: string;
        paymentDate: NativeDate;
    } & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    };
    ticket?: never;
} | {
    ticket?: never;
    invoice?: never;
}>;
export function getBookingById(id: any): Promise<mongoose.Document<unknown, {}, {
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
    userId?: mongoose.Types.ObjectId | null;
    parkingSlotId?: mongoose.Types.ObjectId | null;
    vehicleId?: mongoose.Types.ObjectId | null;
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
    userId?: mongoose.Types.ObjectId | null;
    parkingSlotId?: mongoose.Types.ObjectId | null;
    vehicleId?: mongoose.Types.ObjectId | null;
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
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export function cancelBooking(id: any): Promise<(mongoose.Document<unknown, {}, {
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
    userId?: mongoose.Types.ObjectId | null;
    parkingSlotId?: mongoose.Types.ObjectId | null;
    vehicleId?: mongoose.Types.ObjectId | null;
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
    userId?: mongoose.Types.ObjectId | null;
    parkingSlotId?: mongoose.Types.ObjectId | null;
    vehicleId?: mongoose.Types.ObjectId | null;
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
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}) | null>;
export function checkOutBookingForGuest(id: any): Promise<mongoose.Document<unknown, {}, {
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
    userId?: mongoose.Types.ObjectId | null;
    parkingSlotId?: mongoose.Types.ObjectId | null;
    vehicleId?: mongoose.Types.ObjectId | null;
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
    userId?: mongoose.Types.ObjectId | null;
    parkingSlotId?: mongoose.Types.ObjectId | null;
    vehicleId?: mongoose.Types.ObjectId | null;
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
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export function getBookingWithSlot(id: any): Promise<(mongoose.Document<unknown, {}, {
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
    userId?: mongoose.Types.ObjectId | null;
    parkingSlotId?: mongoose.Types.ObjectId | null;
    vehicleId?: mongoose.Types.ObjectId | null;
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
    userId?: mongoose.Types.ObjectId | null;
    parkingSlotId?: mongoose.Types.ObjectId | null;
    vehicleId?: mongoose.Types.ObjectId | null;
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
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}) | null>;
import mongoose from 'mongoose';
//# sourceMappingURL=booking.service.d.ts.map