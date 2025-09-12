import { Queue } from 'bullmq';
export declare const passwordResetQueue: Queue<any, any, string, any, any, string>;
export declare const addPasswordResetJob: (email: string, token: string) => Promise<void>;
//# sourceMappingURL=passwordReset.queue.d.ts.map