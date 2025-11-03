import jwt from 'jsonwebtoken';
import crypto from 'crypto';
// Hàm tạo JWT
export const createTokens = (userId) => {
    const accessSecret = process.env.JWT_SECRET;
    if (!accessSecret) {
        throw new Error('JWT secrets are not defined in environment variables.');
    }
    // Tạo access token
    const accessToken = jwt.sign({ id: userId }, accessSecret, {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });
    // Tạo refresh token
    const refreshToken = crypto.randomBytes(64).toString('hex');
    return { accessToken, refreshToken };
};
export const createToken = (userId) => {
    // Tạo access token
    return createTokens(userId).accessToken;
};
//# sourceMappingURL=createToken.js.map