import { Request } from 'express';
export interface JwtPayload {
    userId: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}
export interface AuthRequest extends Request {
    user?: JwtPayload;
}
export type UserRole = 'artist' | 'collector' | 'curator' | 'gallery' | 'admin';
export type ArtworkStatus = 'draft' | 'published' | 'sold' | 'archived' | 'available';
export type DimensionUnit = 'in' | 'cm' | 'mm';
export type EventType = 'opening' | 'workshop' | 'talk' | 'fair' | 'other' | 'concert' | 'dj_set' | 'live_performance' | 'open_mic' | 'festival' | 'album_release';
export type EventCategory = 'exhibition' | 'event' | 'music';
export type ExhibitionStatus = 'upcoming' | 'live' | 'past' | 'cancelled';
export interface IImage {
    url: string;
    publicId: string;
    width?: number;
    height?: number;
    blurUrl?: string;
}
export interface ICoverImage {
    url?: string;
    publicId?: string;
}
export interface IDimensions {
    width?: number;
    height?: number;
    depth?: number;
    unit: DimensionUnit;
}
export interface PaginationQuery {
    page?: string;
    limit?: string;
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}
//# sourceMappingURL=index.d.ts.map