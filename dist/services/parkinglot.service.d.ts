export function createParkingLotWithSlots(body: any): Promise<{
    newLot: mongoose.Document<unknown, {}, {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        name: string;
        isActive: boolean;
        parkingOwner: mongoose.Types.ObjectId;
        address: string;
        zones: mongoose.Types.DocumentArray<{
            zone: string;
            count: number;
        }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
            zone: string;
            count: number;
        }> & {
            zone: string;
            count: number;
        }>;
        pricePerHour: number;
        avtImage: string;
        image: string[];
        allowedPaymentMethods: string[];
        description?: string | null;
        location?: {
            type: "Point";
            coordinates: number[];
        } | null;
    }, {}> & {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        name: string;
        isActive: boolean;
        parkingOwner: mongoose.Types.ObjectId;
        address: string;
        zones: mongoose.Types.DocumentArray<{
            zone: string;
            count: number;
        }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
            zone: string;
            count: number;
        }> & {
            zone: string;
            count: number;
        }>;
        pricePerHour: number;
        avtImage: string;
        image: string[];
        allowedPaymentMethods: string[];
        description?: string | null;
        location?: {
            type: "Point";
            coordinates: number[];
        } | null;
    } & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    };
}>;
export function getParkingLotByIdWithStats(id: any): Promise<any>;
export function getUserBookingInParkingLot(parkingLotId: any): Promise<any[]>;
import mongoose from 'mongoose';
//# sourceMappingURL=parkinglot.service.d.ts.map