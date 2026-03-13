import mongoose, { Document } from "mongoose";
export interface IComment extends Document {
    artwork: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IComment, {}, {}, {}, mongoose.Document<unknown, {}, IComment, {}, mongoose.DefaultSchemaOptions> & IComment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IComment>;
export default _default;
//# sourceMappingURL=Comment.d.ts.map