export const signup: (req: any, res: any, next: any) => void;
export const login: (req: any, res: any, next: any) => void;
export const protect: (req: any, res: any, next: any) => void;
export function restrictTo(...roles: any[]): (req: any, res: any, next: any) => any;
export const forgotPassword: (req: any, res: any, next: any) => void;
export const resetPassword: (req: any, res: any, next: any) => void;
export const updatePassword: (req: any, res: any, next: any) => void;
//# sourceMappingURL=auth.controller.d.ts.map