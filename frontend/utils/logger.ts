// Frontend logging utility for development

type LogData = unknown;

class FrontendLogger {
  static log(message: string, data?: LogData) {
    if (typeof window !== 'undefined') {
      // Log to browser console during development
      console.log(`[DEV LOG] ${message}`, data);
    }
  }

  static info(message: string, data?: LogData) {
    this.log(`[INFO] ${message}`, data);
  }

  static error(message: string, data?: LogData) {
    this.log(`[ERROR] ${message}`, data);
  }

  static debug(message: string, data?: LogData) {
    this.log(`[DEBUG] ${message}`, data);
  }
}

export default FrontendLogger;