import mongoose, { Document } from "mongoose";
export interface ITrack extends Document {
    title: string;
    artist: mongoose.Types.ObjectId;
    artistName?: string;
    audioUrl: string;
    coverUrl?: string;
    duration?: number;
    genre?: string;
    plays: number;
    createdAt: Date;
    updatedAt: Date;
    date: Date;
}
declare const _default: mongoose.Model<ITrack, {}, {}, {}, mongoose.Document<unknown, {}, ITrack, {}, mongoose.DefaultSchemaOptions> & ITrack & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ITrack>;
export default _default;
//# sourceMappingURL=Track.d.ts.map