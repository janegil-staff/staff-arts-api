import { Response } from "express";
import { AuthRequest } from "../types";
export declare const getExhibitions: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getExhibition: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createExhibition: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateExhibition: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteExhibition: (req: AuthRequest, res: Response) => Promise<void>;
export declare const toggleAttend: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=exhibitionController.d.ts.map