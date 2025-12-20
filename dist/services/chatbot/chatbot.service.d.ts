export function createOrGetSession(sessionId: any, userId?: null): any;
export function updateSessionContext(sessionId: any, updates: any): any;
export function getSession(sessionId: any): any;
export function clearSession(sessionId: any): boolean;
export function detectIntent(message: any, sessionContext?: null): Promise<any>;
export function processMessage(message: any, sessionId: any, userId?: null): Promise<{
    source: any;
    response: any;
    intent: any;
    sessionId: any;
    context: {
        currentIntent: any;
        nextStep: any;
        requiresAction: boolean;
    };
    timestamp: string;
    sessionInfo: {
        messageCount: any;
        type: any;
        userId: any;
    };
} | {
    source: string;
    response: {
        type: string;
        content: any;
    };
    intent: string;
    sessionId: any;
    timestamp: string;
}>;
export function createActualBooking(bookingData: any, userId: any): Promise<import("mongoose").Document<unknown, {}, {
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
export function getUserInfo(userId: any): Promise<{
    role: string;
    name: string;
    email?: never;
} | {
    role: "user" | "admin" | "parking_owner";
    name: string;
    email: string;
}>;
export function getActiveSessionsCount(): number;
//# sourceMappingURL=chatbot.service.d.ts.map