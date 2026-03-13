import { Response } from "express";
import { AuthRequest } from "../types";
export declare const getComments: (req: AuthRequest, res: Response) => Promise<void>;
export declare const addComment: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteComment: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=commentController.d.ts.map