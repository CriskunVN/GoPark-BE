declare const _default: mongoose.Model<{
    message: string;
    createdAt: NativeDate;
    userId: string;
    aiReply: string;
    userRole: "user" | "admin" | "parking_owner" | "guest";
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    message: string;
    createdAt: NativeDate;
    userId: string;
    aiReply: string;
    userRole: "user" | "admin" | "parking_owner" | "guest";
}, {}> & {
    message: string;
    createdAt: NativeDate;
    userId: string;
    aiReply: string;
    userRole: "user" | "admin" | "parking_owner" | "guest";
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    message: string;
    createdAt: NativeDate;
    userId: string;
    aiReply: string;
    userRole: "user" | "admin" | "parking_owner" | "guest";
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    message: string;
    createdAt: NativeDate;
    userId: string;
    aiReply: string;
    userRole: "user" | "admin" | "parking_owner" | "guest";
}>, {}> & mongoose.FlatRecord<{
    message: string;
    createdAt: NativeDate;
    userId: string;
    aiReply: string;
    userRole: "user" | "admin" | "parking_owner" | "guest";
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
import mongoose from "mongoose";
//# sourceMappingURL=chatHistory.model.d.ts.map