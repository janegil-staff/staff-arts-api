import mongoose, { Document } from 'mongoose';
import { ICoverImage, EventType, EventCategory } from '../types';
export interface IEvent extends Document {
    organizer: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    type: EventType;
    category: EventCategory;
    coverImage?: ICoverImage;
    date: Date;
    endDate?: Date;
    location: string;
    isOnline: boolean;
    link?: string;
    maxAttendees?: number;
    rsvps: mongoose.Types.ObjectId[];
    attendees: mongoose.Types.ObjectId[];
    price: number;
    isFree: boolean;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IEvent, {}, {}, {}, mongoose.Document<unknown, {}, IEvent, {}, mongoose.DefaultSchemaOptions> & IEvent & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IEvent>;
export default _default;
//# sourceMappingURL=Event.d.ts.map