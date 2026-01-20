type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
}

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production'

// Check if we're in browser
const isBrowser = typeof window !== 'undefined'

// Log level priority
const levelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

// Minimum log level (can be configured via env)
const minLogLevel: LogLevel =
  (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || (isProduction ? 'warn' : 'debug')

// Format log entry
function formatLogEntry(entry: LogEntry): string {
  const { timestamp, level, message, context } = entry
  const contextStr = context ? ` ${JSON.stringify(context)}` : ''
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
}

// Should log based on level
function shouldLog(level: LogLevel): boolean {
  return levelPriority[level] >= levelPriority[minLogLevel]
}

// Create log entry
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  }
}

// Console output with appropriate styling
function consoleOutput(entry: LogEntry): void {
  const formatted = formatLogEntry(entry)

  switch (entry.level) {
    case 'debug':
      console.debug(formatted)
      break
    case 'info':
      console.info(formatted)
      break
    case 'warn':
      console.warn(formatted)
      break
    case 'error':
      console.error(formatted)
      break
  }
}

// Send logs to remote service (for production)
async function sendToRemote(entry: LogEntry): Promise<void> {
  // Only send errors and warnings in production
  if (!isProduction || entry.level === 'debug' || entry.level === 'info') {
    return
  }

  // Check if logging endpoint is configured
  const logEndpoint = process.env.NEXT_PUBLIC_LOG_ENDPOINT
  if (!logEndpoint) {
    return
  }

  try {
    await fetch(logEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...entry,
        url: isBrowser ? window.location.href : undefined,
        userAgent: isBrowser ? navigator.userAgent : undefined,
      }),
    })
  } catch {
    // Silently fail - don't want logging to break the app
  }
}

// Main log function
function log(level: LogLevel, message: string, context?: LogContext): void {
  if (!shouldLog(level)) {
    return
  }

  const entry = createLogEntry(level, message, context)

  // Output to console
  consoleOutput(entry)

  // Send to remote in production
  sendToRemote(entry)
}

// Public logger API
export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),

  // Helper for logging API errors
  apiError: (endpoint: string, error: unknown, context?: LogContext) => {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined

    log('error', `API Error: ${endpoint}`, {
      ...context,
      error: errorMessage,
      stack: errorStack,
    })
  },

  // Helper for user actions
  action: (action: string, context?: LogContext) => {
    log('info', `User Action: ${action}`, context)
  },

  // Helper for performance logging
  perf: (operation: string, durationMs: number, context?: LogContext) => {
    log('debug', `Performance: ${operation}`, {
      ...context,
      durationMs,
    })
  },
}

// Export types
export type { LogLevel, LogContext, LogEntry }
