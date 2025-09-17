import { Document, Model } from 'mongoose';
export interface IUser extends Document {
    userName: string;
    email: string;
    password: string;
    passwordConfirm?: string | undefined;
    role: 'user' | 'admin' | 'parking_owner';
    profilePicture?: string;
    phoneNumber?: string;
    isActive?: boolean;
    passwordChangeAt?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    correctPassword(candidatePassword: string, userPassword: string): Promise<boolean>;
    changedPasswordAfter(JWTTimestamp: number): boolean;
    createPasswordResetToken(): string;
}
declare const User: Model<IUser>;
export default User;
//# sourceMappingURL=user.model.d.ts.map