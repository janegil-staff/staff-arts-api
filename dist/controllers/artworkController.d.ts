import { Response } from "express";
import { AuthRequest } from "../types";
export declare const getArtworkMediums: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getArtworks: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getArtwork: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createArtwork: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateArtwork: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteArtwork: (req: AuthRequest, res: Response) => Promise<void>;
export declare const toggleLike: (req: AuthRequest, res: Response) => Promise<void>;
export declare const toggleSave: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getSavedArtworks: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=artworkController.d.ts.map