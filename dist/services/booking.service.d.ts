export function createBookingForGuest(data: any): Promise<mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "completed" | "pending" | "confirmed" | "cancelled";
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "prepaid" | "pay-at-parking";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month" | "guest";
    discount: number;
    totalPrice: number;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "completed" | "pending" | "confirmed" | "cancelled";
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "prepaid" | "pay-at-parking";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month" | "guest";
    discount: number;
    totalPrice: number;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export function createBooking(data: any): Promise<mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "completed" | "pending" | "confirmed" | "cancelled";
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "prepaid" | "pay-at-parking";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month" | "guest";
    discount: number;
    totalPrice: number;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "completed" | "pending" | "confirmed" | "cancelled";
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "prepaid" | "pay-at-parking";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month" | "guest";
    discount: number;
    totalPrice: number;
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
        status: "failed" | "paid" | "unpaid";
        userId: mongoose.Types.ObjectId;
        paymentMethod: "bank" | "cash" | "e-wallet";
        bookingId: mongoose.Types.ObjectId;
        invoiceNumber: string;
        amount: number;
        transactionId: string;
        paymentDate: NativeDate;
    }, {}> & {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        status: "failed" | "paid" | "unpaid";
        userId: mongoose.Types.ObjectId;
        paymentMethod: "bank" | "cash" | "e-wallet";
        bookingId: mongoose.Types.ObjectId;
        invoiceNumber: string;
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
    status: "completed" | "pending" | "confirmed" | "cancelled";
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "prepaid" | "pay-at-parking";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month" | "guest";
    discount: number;
    totalPrice: number;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "completed" | "pending" | "confirmed" | "cancelled";
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "prepaid" | "pay-at-parking";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month" | "guest";
    discount: number;
    totalPrice: number;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export function cancelBooking(id: any): Promise<(mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "completed" | "pending" | "confirmed" | "cancelled";
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "prepaid" | "pay-at-parking";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month" | "guest";
    discount: number;
    totalPrice: number;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "completed" | "pending" | "confirmed" | "cancelled";
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "prepaid" | "pay-at-parking";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month" | "guest";
    discount: number;
    totalPrice: number;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}) | null>;
export function checkInBooking(id: any): Promise<(mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "completed" | "pending" | "confirmed" | "cancelled";
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "prepaid" | "pay-at-parking";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month" | "guest";
    discount: number;
    totalPrice: number;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "completed" | "pending" | "confirmed" | "cancelled";
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "prepaid" | "pay-at-parking";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month" | "guest";
    discount: number;
    totalPrice: number;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}) | null>;
export function checkOutBooking(id: any): Promise<(mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "completed" | "pending" | "confirmed" | "cancelled";
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "prepaid" | "pay-at-parking";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month" | "guest";
    discount: number;
    totalPrice: number;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "completed" | "pending" | "confirmed" | "cancelled";
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "prepaid" | "pay-at-parking";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month" | "guest";
    discount: number;
    totalPrice: number;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}) | null>;
export function checkOutBookingForGuest(id: any): Promise<mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "completed" | "pending" | "confirmed" | "cancelled";
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "prepaid" | "pay-at-parking";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month" | "guest";
    discount: number;
    totalPrice: number;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "completed" | "pending" | "confirmed" | "cancelled";
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "prepaid" | "pay-at-parking";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month" | "guest";
    discount: number;
    totalPrice: number;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
import mongoose from 'mongoose';
//# sourceMappingURL=booking.service.d.ts.map