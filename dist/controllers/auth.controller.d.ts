import type { Request, Response, NextFunction } from 'express';
export declare const signup: (req: any, res: any, next: any) => void;
export declare const verifyEmail: (req: any, res: any, next: any) => void;
export declare const login: (req: any, res: any, next: any) => void;
export declare const forgotPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const resetPassword: (req: any, res: any, next: any) => void;
export declare const updatePassword: (req: any, res: any, next: any) => void;
export declare const refreshToken: (req: any, res: any, next: any) => void;
//# sourceMappingURL=auth.controller.d.ts.map