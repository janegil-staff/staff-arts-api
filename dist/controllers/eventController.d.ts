import { Response } from "express";
import { AuthRequest } from "../types";
export declare const getEvents: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getEvent: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createEvent: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateEvent: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteEvent: (req: AuthRequest, res: Response) => Promise<void>;
export declare const toggleRsvp: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=eventController.d.ts.map