Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_utils_index = require("../utils/index.cjs");
let _google_cloud_storage = require("@google-cloud/storage");
let _google_cloud_bigquery = require("@google-cloud/bigquery");
let _google_cloud_firestore = require("@google-cloud/firestore");
let crypto = require("crypto");
//#region src/services/BigQueryService.ts
const getDataset = async ({ projectId, bigQuery: { datasetName } }) => {
	const dataset = new _google_cloud_bigquery.BigQuery({ projectId }).dataset(datasetName);
	const [exists] = await dataset.exists();
	if (!exists) await dataset.create({ location: "EU" });
	return dataset;
};
const getTable = async (config) => {
	const table = (await getDataset(config)).table(config.bigQuery.tableName);
	const [exists] = await table.exists();
	if (!exists) await table.create({ location: "EU" });
	return table;
};
const loadDataFromFile = async (config, file) => {
	const table = await getTable(config);
	const loadMetadata = {
		sourceFormat: "NEWLINE_DELIMITED_JSON",
		autodetect: true,
		location: "EU",
		...config.bigQuery.truncateTable ? { writeDisposition: "WRITE_TRUNCATE" } : {
			writeDisposition: "WRITE_APPEND",
			schemaUpdateOptions: ["ALLOW_FIELD_ADDITION", "ALLOW_FIELD_RELAXATION"]
		}
	};
	await table.load(file, loadMetadata);
};
const BigQueryService = { loadDataFromFile };
//#endregion
//#region src/services/FirestoreService.ts
const fetchDocs = async ({ projectId, firestore: { databaseId, collectionName } }, documentParser) => {
	return (await new _google_cloud_firestore.Firestore({
		projectId,
		databaseId,
		ignoreUndefinedProperties: true
	}).collection(collectionName).get()).docs.map((doc) => documentParser({
		...doc.data(),
		documentId: doc.id
	}));
};
const streamDocs = async ({ projectId, firestore: { databaseId, collectionName } }, documentParser, streamer) => {
	(await new _google_cloud_firestore.Firestore({
		projectId,
		databaseId,
		ignoreUndefinedProperties: true
	}).collection(collectionName).get()).docs.forEach((doc) => {
		streamer.write(documentParser({
			...doc.data(),
			documentId: doc.id
		}));
	});
};
const FirestoreService = {
	fetchDocs,
	streamDocs
};
//#endregion
//#region src/services/StorageService.ts
const getBucket = async ({ projectId, storage: { bucketName } }) => {
	const storage = new _google_cloud_storage.Storage({ projectId });
	const [exists] = await storage.bucket(bucketName).exists();
	if (!exists) await storage.createBucket(bucketName, { location: "eu" });
	return storage.bucket(bucketName);
};
const getFile = async (config, fileName) => {
	return (await getBucket(config)).file(fileName);
};
const getTempFile = async (config) => {
	const bucket = await getBucket(config);
	const fileName = `temp/${(0, crypto.randomUUID)()}.txt`;
	return bucket.file(fileName);
};
const streamer = (file) => {
	const stream = file.createWriteStream({
		resumable: false,
		gzip: true,
		contentType: "application/text"
	});
	return {
		fileStream: stream,
		write: (data) => stream.write(`${JSON.stringify(data)}\n`),
		end: () => stream.end()
	};
};
const streamToFile = (file, data) => {
	try {
		const { fileStream, end, write } = streamer(file);
		data.forEach((d) => {
			write(d);
		});
		end();
		return new Promise((resolve, reject) => {
			fileStream.on("finish", async () => {
				try {
					const [exists] = await file.exists();
					if (exists) resolve();
					else {
						require_utils_index.logger.ERROR({
							message: "File does not exist after write operation",
							description: `File: ${file.name} written to storage bucket`
						});
						reject();
					}
				} catch (error) {
					require_utils_index.logger.ERROR({
						message: "Error verifying file in Storage Bucket",
						description: `File: ${file.name} written to storage bucket`,
						data: error
					});
					reject();
				}
			});
			fileStream.on("error", (err) => {
				reject(err);
			});
		});
	} catch (err) {
		console.error(err);
		return Promise.reject();
	}
};
const StorageService = {
	getFile,
	getTempFile,
	streamToFile,
	streamer
};
//#endregion
//#region src/services/ExporterService.ts
const firestoreToBigQuery = async (config, documentParser) => {
	const docData = await FirestoreService.fetchDocs(config.source, documentParser);
	const tempFile = await StorageService.getTempFile(config.destination);
	await StorageService.streamToFile(tempFile, docData);
	await BigQueryService.loadDataFromFile(config.destination, tempFile);
	await tempFile.delete({ ignoreNotFound: true });
};
const firestoreToBigQueryStream = async (config, documentParser) => new Promise(async (resolve, reject) => {
	const tempFile = await StorageService.getTempFile(config.destination);
	const streamer = StorageService.streamer(tempFile);
	await FirestoreService.streamDocs(config.source, documentParser, streamer);
	streamer.end();
	streamer.fileStream.on("finish", async () => {
		const [exists] = await tempFile.exists();
		if (exists) {
			await BigQueryService.loadDataFromFile(config.destination, tempFile);
			await tempFile.delete({ ignoreNotFound: true });
			resolve();
		} else reject();
	});
	streamer.fileStream.on("error", () => {
		reject();
	});
});
const ExporterService = {
	firestoreToBigQuery,
	firestoreToBigQueryStream
};
//#endregion
exports.BigQueryService = BigQueryService;
exports.ExporterService = ExporterService;
exports.FirestoreService = FirestoreService;
exports.StorageService = StorageService;
