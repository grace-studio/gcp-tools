import { i as Parser, n as FirestoreConfig, o as StorageConfig, r as FirestoreToBigQueryConfig, t as BigQueryConfig } from "../index-CeE5uTmg.cjs";
import { File } from "@google-cloud/storage";
import { Writable } from "stream";

//#region src/services/BigQueryService.d.ts
declare const BigQueryService: {
  loadDataFromFile: (config: BigQueryConfig, file: File) => Promise<void>;
};
//#endregion
//#region src/services/ExporterService.d.ts
declare const ExporterService: {
  firestoreToBigQuery: <T, U extends Record<string, any>>(config: FirestoreToBigQueryConfig, documentParser: Parser<T, U>) => Promise<void>;
  firestoreToBigQueryStream: <T, U extends Record<string, any>>(config: FirestoreToBigQueryConfig, documentParser: Parser<T, U>) => Promise<void>;
};
//#endregion
//#region src/services/StorageService.d.ts
type Streamer = {
  fileStream: Writable;
  write: <T extends Record<string, any>>(data: T) => boolean;
  end: () => void;
};
declare const StorageService: {
  getFile: (config: StorageConfig, fileName: string) => Promise<File>;
  getTempFile: (config: StorageConfig) => Promise<File>;
  streamToFile: (file: File, data: Record<string, any>[]) => Promise<void>;
  streamer: (file: File) => Streamer;
};
//#endregion
//#region src/services/FirestoreService.d.ts
declare const FirestoreService: {
  fetchDocs: <T, U>({
    projectId,
    firestore: {
      databaseId,
      collectionName
    }
  }: FirestoreConfig, documentParser: Parser<T, U>) => Promise<U[]>;
  streamDocs: <T, U extends Record<string, any>>({
    projectId,
    firestore: {
      databaseId,
      collectionName
    }
  }: FirestoreConfig, documentParser: Parser<T, U>, streamer: Streamer) => Promise<void>;
};
//#endregion
export { BigQueryService, ExporterService, FirestoreService, StorageService, Streamer };