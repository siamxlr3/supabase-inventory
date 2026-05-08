interface RateLimitStore {
  [key: string]: {
    count: number;
    startTime: number;
  };
}

const store: RateLimitStore = {};

export const rateLimiter = (ip: string, limit = 100, windowMs = 60000) => {
  const now = Date.now();
  if (!store[ip]) {
    store[ip] = { count: 1, startTime: now };
    return true;
  }

  const { count, startTime } = store[ip];
  if (now - startTime > windowMs) {
    store[ip] = { count: 1, startTime: now };
    return true;
  }

  if (count >= limit) {
    return false;
  }

  store[ip].count += 1;
  return true;
};
