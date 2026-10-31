export const config = {
  port: Number(process.env.PORT ?? 3100),
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN ?? '',
  appSecret: process.env.WHATSAPP_APP_SECRET ?? '',
  platformApiUrl: process.env.PLATFORM_API_URL ?? 'http://localhost:3000',
  tenantRateLimitPerMin: Number(process.env.TENANT_RATE_LIMIT_PER_MIN ?? 600),
};
