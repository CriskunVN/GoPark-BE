import mongoose, { Document } from 'mongoose';
export interface ISession extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    refreshToken: string;
    createdAt: Date;
}
declare const Session: mongoose.Model<ISession, {}, {}, {}, mongoose.Document<unknown, {}, ISession, {}> & ISession & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Session;
//# sourceMappingURL=session.model.d.ts.map