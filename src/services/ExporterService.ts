import type { FirestoreToBigQueryConfig, Parser } from '../types';
import { FirestoreService } from './FirestoreService';
import { StorageService } from './StorageService';
import { BigQueryService } from './BigQueryService';

const firestoreToBigQuery = async <T, U extends Record<string, any>>(
  config: FirestoreToBigQueryConfig,
  documentParser: Parser<T, U>,
) => {
  const docData = (await FirestoreService.fetchDocs(
    config.source,
    documentParser,
  )) as U[];
  const tempFile = await StorageService.getTempFile(config.destination);
  await StorageService.streamToFile(tempFile, docData);
  await BigQueryService.loadDataFromFile(config.destination, tempFile);
  await tempFile.delete({ ignoreNotFound: true });
};

const firestoreToBigQueryStream = async <T, U extends Record<string, any>>(
  config: FirestoreToBigQueryConfig,
  documentParser: Parser<T, U>,
) =>
  new Promise<void>(async (resolve, reject) => {
    const tempFile = await StorageService.getTempFile(config.destination);
    const streamer = StorageService.streamer(tempFile);
    await FirestoreService.streamDocs(config.source, documentParser, streamer);
    streamer.end();

    streamer.fileStream.on('finish', async () => {
      const [exists] = await tempFile.exists();
      if (exists) {
        await BigQueryService.loadDataFromFile(config.destination, tempFile);
        await tempFile.delete({ ignoreNotFound: true });
        resolve();
      } else {
        reject();
      }
    });

    streamer.fileStream.on('error', () => {
      reject();
    });
  });

export const ExporterService = {
  firestoreToBigQuery,
  firestoreToBigQueryStream,
};
