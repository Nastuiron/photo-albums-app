type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

export function rateLimit(params: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const current = store.get(params.key);

  if (!current || current.resetAt < now) {
    store.set(params.key, {
      count: 1,
      resetAt: now + params.windowMs,
    });

    return {
      success: true,
      remaining: params.limit - 1,
    };
  }

  if (current.count >= params.limit) {
    return {
      success: false,
      remaining: 0,
    };
  }

  current.count++;

  return {
    success: true,
    remaining: params.limit - current.count,
  };
}
