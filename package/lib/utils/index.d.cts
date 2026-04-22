//#region src/utils/logger.d.ts
type Entry = {
  message: string;
  description?: string;
  data?: any;
};
declare const logger: {
  DEFAULT: (entry: Entry) => void;
  DEBUG: (entry: Entry) => void;
  INFO: (entry: Entry) => void;
  NOTICE: (entry: Entry) => void;
  WARNING: (entry: Entry) => void;
  ERROR: (entry: Entry) => void;
  CRITICAL: (entry: Entry) => void;
  ALERT: (entry: Entry) => void;
  EMERGENCY: (entry: Entry) => void;
};
//#endregion
export { logger };