import redis from '../queues/redis.js';
import AppError from './appError.js';
export async function limitResetRequest(email, ip, limit = 5, windowSec = 60) {
    const key = `rl:reset:${email}:${ip}`;
    const cur = await redis.incr(key);
    if (cur === 1)
        await redis.expire(key, windowSec);
    if (cur > limit)
        throw new AppError('TOO_MANY_REQUESTS_RESET_PASSWORD', 429);
}
//# sourceMappingURL=rateLimit.js.map