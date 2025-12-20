/**
 * 🎯 XỬ LÝ CÂU HỎI TÌM BÃI XE THÔNG MINH
 * - Tìm theo vị trí GPS (ưu tiên cao nhất)
 * - Tìm theo tên thành phố
 * - Luôn trả về kết quả (có gợi ý nếu không tìm thấy)
 *
 *
 */
export function handleFindParking(message: any, session: any): Promise<{
    type: string;
    content: string;
    buttons: {
        text: string;
        action: string;
    }[];
}>;
/**
 * 📋 XEM BOOKING CỦA USER
 */
export function handleMyBookings(userId: any): Promise<{
    type: string;
    content: string;
    buttons: {
        text: string;
        action: string;
    }[];
} | {
    type: string;
    content: string;
    data: {
        active: (import("mongoose").FlattenMaps<{
            createdAt: NativeDate;
            updatedAt: NativeDate;
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
        }> & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        })[];
        past: (import("mongoose").FlattenMaps<{
            createdAt: NativeDate;
            updatedAt: NativeDate;
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
        }> & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        })[];
    };
    buttons: {
        text: string;
        action: string;
        disabled: boolean;
    }[];
}>;
/**
 * 🚗 XEM XE CỦA USER
 */
export function handleMyVehicles(userId: any): Promise<{
    type: string;
    content: string;
    buttons: {
        text: string;
        action: string;
    }[];
} | {
    type: string;
    content: string;
    data: (import("mongoose").FlattenMaps<{
        createdAt: NativeDate;
        updatedAt: NativeDate;
        userId: import("mongoose").Types.ObjectId;
        licensePlate: string;
        capacity: number;
        imageVehicle: string;
    }> & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[];
    buttons: {
        text: string;
        action: string;
    }[];
}>;
/**
 * ℹ️ XEM BẢNG GIÁ
 */
export function handlePriceInfo(): {
    type: string;
    content: string;
    buttons: {
        text: string;
        action: string;
    }[];
};
/**
 * 📞 THÔNG TIN LIÊN HỆ
 */
export function handleContactInfo(): {
    type: string;
    content: string;
    buttons: {
        text: string;
        action: string;
        data: {
            phone: string;
        };
    }[];
};
export function handleFindCheapParking(message: any, session: any): Promise<{
    type: string;
    content: string;
    buttons: {
        text: string;
        action: string;
    }[];
    data?: never;
} | {
    type: string;
    content: string;
    data: any;
    buttons: ({
        text: string;
        action: string;
        data: {
            parkingId: any;
            city?: never;
            parkingData?: never;
        };
        icon: string;
    } | {
        text: string;
        action: string;
        data: {
            city: string;
            parkingData: any;
            parkingId?: never;
        };
        icon: string;
    } | {
        text: string;
        action: string;
        icon: string;
        data?: never;
    })[];
}>;
//# sourceMappingURL=intelligentHandler.service.d.ts.map