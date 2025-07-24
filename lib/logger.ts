// lib/logger.ts

const log = (level: "log" | "warn" | "error", message: string, context: Record<string, any> = {}, error?: any) => {
    const timestamp = new Date().toISOString();
    const component = context.component || "Unknown";
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${component}] ${message}`;

    if (error) {
        console[level](logMessage, context, error);
    } else {
        console[level](logMessage, context);
    }
  };
  
  export const clientLogger = {
    log: (message: string, context?: Record<string, any>) => log("log", message, { ...context, component: "client" }),
    warn: (message: string, context?: Record<string, any>) => log("warn", message, { ...context, component: "client" }),
    error: (message: string, error: any, context?: Record<string, any>) => {
      log("error", message, { ...context, component: "client" }, error);
    },
  };
  
  export const serverLogger = {
    log: (message: string, context?: Record<string, any>) => log("log", message, { ...context, component: "server" }),
    warn: (message: string, context?: Record<string, any>) => log("warn", message, { ...context, component: "server" }),
    error: (message: string, error: any, context?: Record<string, any>) => {
      log("error", message, { ...context, component: "server" }, error);
    },
  };
