//#region src/types/index.d.ts
type Parser<T, U> = (obj: T) => U;
type ProjectConfig = {
  projectId: string;
};
type FirestoreConfig = ProjectConfig & {
  firestore: {
    collectionName: string;
    /**
     * Id of database. Leave as undefined to use (default) database.
     */
    databaseId?: string;
  };
};
type BigQueryConfig = ProjectConfig & {
  bigQuery: {
    datasetName: string;
    tableName: string;
    truncateTable?: boolean;
  };
};
type StorageConfig = ProjectConfig & {
  storage: {
    bucketName: string;
  };
};
type FirestoreToBigQueryConfig = {
  source: FirestoreConfig;
  destination: BigQueryConfig & StorageConfig;
};
//#endregion
export { ProjectConfig as a, Parser as i, FirestoreConfig as n, StorageConfig as o, FirestoreToBigQueryConfig as r, BigQueryConfig as t };