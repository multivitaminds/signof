type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getMinLevel(): LogLevel {
  const env = process.env.LOG_LEVEL?.toLowerCase();
  if (env && env in LEVEL_ORDER) return env as LogLevel;
  return 'info';
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[getMinLevel()];
}

function formatLog(level: LogLevel, message: string, data?: Record<string, unknown>): string {
  const entry: Record<string, unknown> = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...data,
  };
  return JSON.stringify(entry);
}

export const logger = {
  debug(message: string, data?: Record<string, unknown>): void {
    if (shouldLog('debug')) {
      process.stdout.write(formatLog('debug', message, data) + '\n');
    }
  },
  info(message: string, data?: Record<string, unknown>): void {
    if (shouldLog('info')) {
      process.stdout.write(formatLog('info', message, data) + '\n');
    }
  },
  warn(message: string, data?: Record<string, unknown>): void {
    if (shouldLog('warn')) {
      process.stderr.write(formatLog('warn', message, data) + '\n');
    }
  },
  error(message: string, data?: Record<string, unknown>): void {
    if (shouldLog('error')) {
      process.stderr.write(formatLog('error', message, data) + '\n');
    }
  },
};
