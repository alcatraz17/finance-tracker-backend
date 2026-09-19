import winston from 'winston';

const { combine, timestamp, json, errors, colorize, printf } = winston.format;

// Human-readable output for local development
const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}: ${stack ?? message}${metaStr}`;
  })
);

// Structured JSON for production — one JSON object per line, parseable by
// log aggregators (engineering standard §). errors({ stack: true }) turns
// logged Error objects into proper stack traces instead of "{}".
const prodFormat = combine(errors({ stack: true }), timestamp(), json());

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [new winston.transports.Console()],
  // Don't crash the process if logging itself fails
  exceptionHandlers: [new winston.transports.Console()]
});

export type Logger = typeof logger;
