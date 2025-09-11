export default Booking;
declare const Booking: mongoose.Model<{
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
}, {}, {}, {}, mongoose.Document<unknown, {}, {
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
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
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
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
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
}>, {}> & mongoose.FlatRecord<{
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
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
import mongoose from 'mongoose';
//# sourceMappingURL=booking.model.d.ts.map