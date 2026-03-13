import { Response } from 'express';
import { AuthRequest } from '../types';
export declare const getTracks: (_req: AuthRequest, res: Response) => Promise<void>;
export declare const getTrack: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createTrack: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateTrack: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteTrack: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=trackController.d.ts.map