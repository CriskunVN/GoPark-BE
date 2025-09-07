export default Invoice;
declare const Invoice: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "paid" | "unpaid" | "failed";
    userId: mongoose.Types.ObjectId;
    paymentMethod: "bank" | "cash" | "e-wallet";
    bookingId: mongoose.Types.ObjectId;
    invoiceNumber: string;
    amount: number;
    transactionId: string;
    paymentDate: NativeDate;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "paid" | "unpaid" | "failed";
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
    status: "paid" | "unpaid" | "failed";
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
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "paid" | "unpaid" | "failed";
    userId: mongoose.Types.ObjectId;
    paymentMethod: "bank" | "cash" | "e-wallet";
    bookingId: mongoose.Types.ObjectId;
    invoiceNumber: string;
    amount: number;
    transactionId: string;
    paymentDate: NativeDate;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "paid" | "unpaid" | "failed";
    userId: mongoose.Types.ObjectId;
    paymentMethod: "bank" | "cash" | "e-wallet";
    bookingId: mongoose.Types.ObjectId;
    invoiceNumber: string;
    amount: number;
    transactionId: string;
    paymentDate: NativeDate;
}>, {}> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "paid" | "unpaid" | "failed";
    userId: mongoose.Types.ObjectId;
    paymentMethod: "bank" | "cash" | "e-wallet";
    bookingId: mongoose.Types.ObjectId;
    invoiceNumber: string;
    amount: number;
    transactionId: string;
    paymentDate: NativeDate;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
import mongoose from 'mongoose';
//# sourceMappingURL=invoice.model.d.ts.map