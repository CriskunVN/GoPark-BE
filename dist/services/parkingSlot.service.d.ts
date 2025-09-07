export function prepareParkingSlotData(data: any): Promise<any>;
export function deleteSlotAndSyncZone(slotId: any): Promise<void>;
export function getSlotsAvailable(startTime: any, endTime: any, parkingLotId: any): Promise<(import("mongoose").Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    zone: string;
    pricePerHour: number;
    slotNumber: string;
    status: "available" | "booked" | "reserved";
    parkingLot?: import("mongoose").Types.ObjectId | null;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    zone: string;
    pricePerHour: number;
    slotNumber: string;
    status: "available" | "booked" | "reserved";
    parkingLot?: import("mongoose").Types.ObjectId | null;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
})[]>;
export function getBookedSlotsForOwner(time: any, parkingLotId: any): Promise<(import("mongoose").Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    zone: string;
    pricePerHour: number;
    slotNumber: string;
    status: "available" | "booked" | "reserved";
    parkingLot?: import("mongoose").Types.ObjectId | null;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    zone: string;
    pricePerHour: number;
    slotNumber: string;
    status: "available" | "booked" | "reserved";
    parkingLot?: import("mongoose").Types.ObjectId | null;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
})[]>;
export function getAvailableSlotsForOwner(time: any, parkingLotId: any): Promise<(import("mongoose").Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    zone: string;
    pricePerHour: number;
    slotNumber: string;
    status: "available" | "booked" | "reserved";
    parkingLot?: import("mongoose").Types.ObjectId | null;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    zone: string;
    pricePerHour: number;
    slotNumber: string;
    status: "available" | "booked" | "reserved";
    parkingLot?: import("mongoose").Types.ObjectId | null;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
})[]>;
//# sourceMappingURL=parkingSlot.service.d.ts.map