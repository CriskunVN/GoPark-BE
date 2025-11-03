export default Ticket;
declare const Ticket: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: mongoose.Types.ObjectId;
    slotNumber: string;
    status: "cancelled" | "active" | "used";
    paymentStatus: never;
    bookingId: mongoose.Types.ObjectId;
    vehicleNumber: string;
    ticketType: "date" | "hours" | "month" | "guest";
    checkInTime?: NativeDate | null;
    checkoutTime?: NativeDate | null;
    expiryDate?: NativeDate | null;
    qrCode?: string | null;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: mongoose.Types.ObjectId;
    slotNumber: string;
    status: "cancelled" | "active" | "used";
    paymentStatus: never;
    bookingId: mongoose.Types.ObjectId;
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
    userId: mongoose.Types.ObjectId;
    slotNumber: string;
    status: "cancelled" | "active" | "used";
    paymentStatus: never;
    bookingId: mongoose.Types.ObjectId;
    vehicleNumber: string;
    ticketType: "date" | "hours" | "month" | "guest";
    checkInTime?: NativeDate | null;
    checkoutTime?: NativeDate | null;
    expiryDate?: NativeDate | null;
    qrCode?: string | null;
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
    userId: mongoose.Types.ObjectId;
    slotNumber: string;
    status: "cancelled" | "active" | "used";
    paymentStatus: never;
    bookingId: mongoose.Types.ObjectId;
    vehicleNumber: string;
    ticketType: "date" | "hours" | "month" | "guest";
    checkInTime?: NativeDate | null;
    checkoutTime?: NativeDate | null;
    expiryDate?: NativeDate | null;
    qrCode?: string | null;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: mongoose.Types.ObjectId;
    slotNumber: string;
    status: "cancelled" | "active" | "used";
    paymentStatus: never;
    bookingId: mongoose.Types.ObjectId;
    vehicleNumber: string;
    ticketType: "date" | "hours" | "month" | "guest";
    checkInTime?: NativeDate | null;
    checkoutTime?: NativeDate | null;
    expiryDate?: NativeDate | null;
    qrCode?: string | null;
}>, {}> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: mongoose.Types.ObjectId;
    slotNumber: string;
    status: "cancelled" | "active" | "used";
    paymentStatus: never;
    bookingId: mongoose.Types.ObjectId;
    vehicleNumber: string;
    ticketType: "date" | "hours" | "month" | "guest";
    checkInTime?: NativeDate | null;
    checkoutTime?: NativeDate | null;
    expiryDate?: NativeDate | null;
    qrCode?: string | null;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
import mongoose from 'mongoose';
//# sourceMappingURL=ticket.models.d.ts.map