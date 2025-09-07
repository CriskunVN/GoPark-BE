export default ParkingSlot;
declare const ParkingSlot: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    zone: string;
    pricePerHour: number;
    slotNumber: string;
    status: "available" | "booked" | "reserved";
    parkingLot?: mongoose.Types.ObjectId | null;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    zone: string;
    pricePerHour: number;
    slotNumber: string;
    status: "available" | "booked" | "reserved";
    parkingLot?: mongoose.Types.ObjectId | null;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    zone: string;
    pricePerHour: number;
    slotNumber: string;
    status: "available" | "booked" | "reserved";
    parkingLot?: mongoose.Types.ObjectId | null;
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
    zone: string;
    pricePerHour: number;
    slotNumber: string;
    status: "available" | "booked" | "reserved";
    parkingLot?: mongoose.Types.ObjectId | null;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    zone: string;
    pricePerHour: number;
    slotNumber: string;
    status: "available" | "booked" | "reserved";
    parkingLot?: mongoose.Types.ObjectId | null;
}>, {}> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    zone: string;
    pricePerHour: number;
    slotNumber: string;
    status: "available" | "booked" | "reserved";
    parkingLot?: mongoose.Types.ObjectId | null;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
import mongoose from 'mongoose';
//# sourceMappingURL=parkingSlot.model.d.ts.map