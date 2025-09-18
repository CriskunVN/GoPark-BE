import type { NextFunction, Request, Response } from 'express';
export declare const protect: (req: any, res: any, next: any) => void;
export declare const restrictTo: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map