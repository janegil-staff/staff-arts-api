import mongoose, { Document } from 'mongoose';
import { ICoverImage, ExhibitionStatus } from '../types';
export interface IExhibition extends Document {
    organizer: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    coverImage?: ICoverImage;
    artworks: mongoose.Types.ObjectId[];
    artists: mongoose.Types.ObjectId[];
    startDate: Date;
    endDate: Date;
    location: string;
    isVirtual: boolean;
    virtualUrl: string;
    ticketPrice: number;
    isFree: boolean;
    attendees: mongoose.Types.ObjectId[];
    status: ExhibitionStatus;
    isFeatured: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IExhibition, {}, {}, {}, mongoose.Document<unknown, {}, IExhibition, {}, mongoose.DefaultSchemaOptions> & IExhibition & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IExhibition>;
export default _default;
//# sourceMappingURL=Exhibition.d.ts.map