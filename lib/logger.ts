// lib/logger.ts

export function logError(message: string, context?: any) {
  console.error(`[ERROR]: ${message}`, context);
  // TODO: добавить интеграцию с внешней системой (например, Sentry, Logtail)
}

export function logInfo(message: string, context?: any) {
  console.info(`[INFO]: ${message}`, context);
}

export function logWarn(message: string, context?: any) {
  console.warn(`[WARN]: ${message}`, context);
}
