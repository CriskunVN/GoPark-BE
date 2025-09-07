export function createInvoice(invoiceData: any): Promise<import("mongoose").Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "paid" | "unpaid" | "failed";
    userId: import("mongoose").Types.ObjectId;
    paymentMethod: "bank" | "cash" | "e-wallet";
    bookingId: import("mongoose").Types.ObjectId;
    invoiceNumber: string;
    amount: number;
    transactionId: string;
    paymentDate: NativeDate;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "paid" | "unpaid" | "failed";
    userId: import("mongoose").Types.ObjectId;
    paymentMethod: "bank" | "cash" | "e-wallet";
    bookingId: import("mongoose").Types.ObjectId;
    invoiceNumber: string;
    amount: number;
    transactionId: string;
    paymentDate: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=invoice.service.d.ts.map