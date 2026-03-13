import mongoose, { Document, Model } from 'mongoose';
import { UserRole } from '../types';
export interface IUser extends Document {
    email: string;
    password: string;
    name?: string;
    displayName?: string;
    username?: string;
    slug?: string;
    role: UserRole;
    avatar?: string;
    coverImage?: string;
    bio?: string;
    location?: string;
    website: string;
    verified: boolean;
    socialLinks: Map<string, string>;
    mediums: string[];
    styles: string[];
    isAvailableForCommission: boolean;
    isFeatured: boolean;
    followers: mongoose.Types.ObjectId[];
    following: mongoose.Types.ObjectId[];
    savedArtworks: mongoose.Types.ObjectId[];
    refreshToken?: string;
    followerCount: number;
    followingCount: number;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidate: string): Promise<boolean>;
}
export interface IUserModel extends Model<IUser> {
    findByEmail(email: string): Promise<IUser | null>;
}
declare const _default: IUserModel;
export default _default;
//# sourceMappingURL=User.d.ts.map