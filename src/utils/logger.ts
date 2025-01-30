/**
 * DEFAULT	(0) The log entry has no assigned severity level.
 * DEBUG	(100) Debug or trace information.
 * INFO	(200) Routine information, such as ongoing status or performance.
 * NOTICE	(300) Normal but significant events, such as start up, shut down, or a configuration change.
 * WARNING	(400) Warning events might cause problems.
 * ERROR	(500) Error events are likely to cause problems.
 * CRITICAL	(600) Critical events cause more severe problems or outages.
 * ALERT	(700) A person must take an action immediately.
 * EMERGENCY	(800) One or more systems are unusable.
 */
type Severity =
  | 'DEFAULT'
  | 'DEBUG'
  | 'INFO'
  | 'NOTICE'
  | 'WARNING'
  | 'ERROR'
  | 'CRITICAL'
  | 'ALERT'
  | 'EMERGENCY';

type Entry = {
  message: string;
  description?: string;
  data?: any;
};

type LogEntry = Entry & {
  severity: Severity;
};

const writeLog = (severity: Severity) => (entry: Entry) => {
  const _entry: LogEntry = {
    severity,
    ...entry,
  };

  switch (severity) {
    case 'DEFAULT':
    case 'DEBUG':
    case 'INFO':
    case 'NOTICE':
      console.log(JSON.stringify(_entry));
      break;
    case 'WARNING':
      console.warn(JSON.stringify(_entry));
      break;
    case 'ERROR':
    case 'CRITICAL':
    case 'ALERT':
    case 'EMERGENCY':
    default:
      console.error(JSON.stringify(_entry));
      break;
  }
};

export const logger = {
  DEFAULT: writeLog('DEFAULT'),
  DEBUG: writeLog('DEBUG'),
  INFO: writeLog('INFO'),
  NOTICE: writeLog('NOTICE'),
  WARNING: writeLog('WARNING'),
  ERROR: writeLog('ERROR'),
  CRITICAL: writeLog('CRITICAL'),
  ALERT: writeLog('ALERT'),
  EMERGENCY: writeLog('EMERGENCY'),
};
