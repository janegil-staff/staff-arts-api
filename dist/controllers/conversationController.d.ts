import { Response } from "express";
import { AuthRequest } from "../types";
export declare const getConversations: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getOrCreateConversation: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMessages: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUnreadCounts: (req: AuthRequest, res: Response) => Promise<void>;
export declare const sendMessage: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=conversationController.d.ts.map