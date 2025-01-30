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

export const ExporterService = {
  firestoreToBigQuery,
};
