export type Parser<T, U> = (obj: T) => U;

export type ProjectConfig = {
  projectId: string;
};

export type FirestoreConfig = ProjectConfig & {
  firestore: {
    collectionName: string;
    /**
     * Id of database. Leave as undefined to use (default) database.
     */
    databaseId?: string;
  };
};

export type BigQueryConfig = ProjectConfig & {
  bigQuery: {
    datasetName: string;
    tableName: string;
    truncateTable?: boolean;
  };
};

export type StorageConfig = ProjectConfig & {
  storage: {
    bucketName: string;
  };
};

export type FirestoreToBigQueryConfig = {
  source: FirestoreConfig;
  destination: BigQueryConfig & StorageConfig;
};
