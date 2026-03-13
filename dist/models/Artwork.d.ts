import mongoose, { Document } from 'mongoose';
import { IImage, IDimensions, ArtworkStatus } from '../types';
export interface IArtwork extends Document {
    artist: mongoose.Types.ObjectId;
    title: string;
    description: string;
    images: IImage[];
    medium: string;
    style: string;
    subject: string;
    materials: string[];
    categories: string[];
    tags: string[];
    aiTags: string[];
    aiDescription: string;
    mood: string;
    dominantColors: string[];
    dimensions?: IDimensions;
    year?: number;
    edition: string;
    forSale: boolean;
    price: number;
    currency: string;
    isOriginal: boolean;
    isPrint: boolean;
    isDigital: boolean;
    shippingInfo: string;
    views: number;
    likes: mongoose.Types.ObjectId[];
    likesCount: number;
    saves: mongoose.Types.ObjectId[];
    savesCount: number;
    commentsCount: number;
    status: ArtworkStatus;
    isFeatured: boolean;
    exhibition?: mongoose.Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IArtwork, {}, {}, {}, mongoose.Document<unknown, {}, IArtwork, {}, mongoose.DefaultSchemaOptions> & IArtwork & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IArtwork>;
export default _default;
//# sourceMappingURL=Artwork.d.ts.map