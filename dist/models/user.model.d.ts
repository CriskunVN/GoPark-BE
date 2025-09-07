export default User;
declare const User: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userName: string;
    email: string;
    password: string;
    passwordConfirm: string;
    role: "user" | "admin" | "parking_owner";
    profilePicture: string;
    phoneNumber: string;
    isActive: boolean;
    passwordChangeAt: NativeDate;
    passwordResetToken?: string | null;
    passwordResetExpires?: NativeDate | null;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userName: string;
    email: string;
    password: string;
    passwordConfirm: string;
    role: "user" | "admin" | "parking_owner";
    profilePicture: string;
    phoneNumber: string;
    isActive: boolean;
    passwordChangeAt: NativeDate;
    passwordResetToken?: string | null;
    passwordResetExpires?: NativeDate | null;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userName: string;
    email: string;
    password: string;
    passwordConfirm: string;
    role: "user" | "admin" | "parking_owner";
    profilePicture: string;
    phoneNumber: string;
    isActive: boolean;
    passwordChangeAt: NativeDate;
    passwordResetToken?: string | null;
    passwordResetExpires?: NativeDate | null;
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
    userName: string;
    email: string;
    password: string;
    passwordConfirm: string;
    role: "user" | "admin" | "parking_owner";
    profilePicture: string;
    phoneNumber: string;
    isActive: boolean;
    passwordChangeAt: NativeDate;
    passwordResetToken?: string | null;
    passwordResetExpires?: NativeDate | null;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userName: string;
    email: string;
    password: string;
    passwordConfirm: string;
    role: "user" | "admin" | "parking_owner";
    profilePicture: string;
    phoneNumber: string;
    isActive: boolean;
    passwordChangeAt: NativeDate;
    passwordResetToken?: string | null;
    passwordResetExpires?: NativeDate | null;
}>, {}> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userName: string;
    email: string;
    password: string;
    passwordConfirm: string;
    role: "user" | "admin" | "parking_owner";
    profilePicture: string;
    phoneNumber: string;
    isActive: boolean;
    passwordChangeAt: NativeDate;
    passwordResetToken?: string | null;
    passwordResetExpires?: NativeDate | null;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
import mongoose from 'mongoose';
//# sourceMappingURL=user.model.d.ts.map