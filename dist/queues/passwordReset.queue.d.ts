import { Queue } from 'bullmq';
declare const passwordResetQueue: Queue<any, any, string, any, any, string>;
declare const addPasswordResetJob: (email: string, token: string) => Promise<void>;
export { passwordResetQueue, addPasswordResetJob };
//# sourceMappingURL=passwordReset.queue.d.ts.map