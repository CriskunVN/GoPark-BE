export const getEnv_Redis = () => {
    console.log(process.env.PORT, process.env.DATABASE, process.env.REDISPASSWORD);
    return {
        host: process.env.REDISHOST || '',
        port: Number(process.env.REDISPORT) || 67261,
        password: process.env.REDISPASSWORD || '',
    };
};
//# sourceMappingURL=getENV.js.map