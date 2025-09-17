export default ParkingLot;
declare const ParkingLot: mongoose.Model<any, {}, {}, {}, any, any> | mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    isActive: boolean;
    name: string;
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
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    isActive: boolean;
    name: string;
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
    isActive: boolean;
    name: string;
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
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    isActive: boolean;
    name: string;
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
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    isActive: boolean;
    name: string;
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
}>, {}> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    isActive: boolean;
    name: string;
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
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
import mongoose from 'mongoose';
//# sourceMappingURL=parkinglot.model.d.ts.map