export function getUserInfo(userId: any): Promise<{
    role: string;
    name: string;
    contextInfo: string;
    email?: never;
} | {
    role: "user" | "admin" | "parking_owner";
    name: string;
    email: string;
    contextInfo: string;
}>;
export function askGeminiAI(message: any, userId?: null): Promise<any>;
//# sourceMappingURL=chatbot.service.d.ts.map