/* eslint-disable no-console */

export const logger = {
  info: (msg: string, details?: any) => {
    console.log(`\x1b[34m[INFO]\x1b[0m ${new Date().toISOString()}: ${msg}`, details || '');
  },
  warn: (msg: string, details?: any) => {
    console.warn(`\x1b[33m[WARN]\x1b[0m ${new Date().toISOString()}: ${msg}`, details || '');
  },
  error: (msg: string, details?: any) => {
    console.error(`\x1b[31m[ERROR]\x1b[0m ${new Date().toISOString()}: ${msg}`, details || '');
  },
  performance: (method: string, url: string, duration: number) => {
    const isSlow = duration > 500;
    const color = isSlow ? '\x1b[31m' : '\x1b[32m';
    const logMsg = `${color}[PERF]\x1b[0m ${method} ${url} - ${duration}ms ${isSlow ? '(SLOW)' : ''}`;
    
    if (isSlow) {
      console.warn(logMsg);
    } else {
      console.log(logMsg);
    }
  }
};
