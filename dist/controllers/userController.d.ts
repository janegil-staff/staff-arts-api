import { Response } from "express";
import { AuthRequest } from "../types";
export declare const getUsers: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUserByUsername: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUserById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateUser: (req: AuthRequest, res: Response) => Promise<void>;
export declare const toggleFollow: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUserArtworks: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteUser: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=userController.d.ts.map