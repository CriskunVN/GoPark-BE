export default Booking;
declare const Booking: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "pending" | "confirmed" | "cancelled" | "completed" | "checked-in" | "over-due";
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "prepaid" | "pay-at-parking";
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
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "pending" | "confirmed" | "cancelled" | "completed" | "checked-in" | "over-due";
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "prepaid" | "pay-at-parking";
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
    status: "pending" | "confirmed" | "cancelled" | "completed" | "checked-in" | "over-due";
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "prepaid" | "pay-at-parking";
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
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "pending" | "confirmed" | "cancelled" | "completed" | "checked-in" | "over-due";
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "prepaid" | "pay-at-parking";
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
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "pending" | "confirmed" | "cancelled" | "completed" | "checked-in" | "over-due";
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "prepaid" | "pay-at-parking";
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
}>, {}> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "pending" | "confirmed" | "cancelled" | "completed" | "checked-in" | "over-due";
    userId: mongoose.Types.ObjectId;
    parkingSlotId: mongoose.Types.ObjectId;
    startTime: NativeDate;
    endTime: NativeDate;
    vehicleNumber: string;
    paymentStatus: "paid" | "unpaid";
    paymentMethod: "prepaid" | "pay-at-parking";
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
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
import mongoose from 'mongoose';
//# sourceMappingURL=booking.model.d.ts.map