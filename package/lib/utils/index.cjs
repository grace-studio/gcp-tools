Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
//#region src/utils/logger.ts
const writeLog = (severity) => (entry) => {
	const _entry = {
		severity,
		...entry
	};
	switch (severity) {
		case "DEFAULT":
		case "DEBUG":
		case "INFO":
		case "NOTICE":
			console.log(JSON.stringify(_entry));
			break;
		case "WARNING":
			console.warn(JSON.stringify(_entry));
			break;
		default:
			console.error(JSON.stringify(_entry));
			break;
	}
};
const logger = {
	DEFAULT: writeLog("DEFAULT"),
	DEBUG: writeLog("DEBUG"),
	INFO: writeLog("INFO"),
	NOTICE: writeLog("NOTICE"),
	WARNING: writeLog("WARNING"),
	ERROR: writeLog("ERROR"),
	CRITICAL: writeLog("CRITICAL"),
	ALERT: writeLog("ALERT"),
	EMERGENCY: writeLog("EMERGENCY")
};
//#endregion
exports.logger = logger;
