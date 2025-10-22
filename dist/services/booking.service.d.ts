export function createBookingForGuest(data: any): Promise<mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "pay-at-parking" | "prepaid";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month" | "guest";
    discount: number;
    totalPrice: number;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "pay-at-parking" | "prepaid";
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
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "pay-at-parking" | "prepaid";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month" | "guest";
    discount: number;
    totalPrice: number;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "pay-at-parking" | "prepaid";
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
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "pay-at-parking" | "prepaid";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month" | "guest";
    discount: number;
    totalPrice: number;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "pay-at-parking" | "prepaid";
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
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "pay-at-parking" | "prepaid";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month" | "guest";
    discount: number;
    totalPrice: number;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "pay-at-parking" | "prepaid";
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
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "pay-at-parking" | "prepaid";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month" | "guest";
    discount: number;
    totalPrice: number;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "pay-at-parking" | "prepaid";
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
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "pay-at-parking" | "prepaid";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month" | "guest";
    discount: number;
    totalPrice: number;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "pay-at-parking" | "prepaid";
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
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "pay-at-parking" | "prepaid";
    bookingDate: NativeDate;
    bookingType: "date" | "hours" | "month" | "guest";
    discount: number;
    totalPrice: number;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "pay-at-parking" | "prepaid";
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