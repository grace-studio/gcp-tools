import { File as StorageFile } from '@google-cloud/storage';
import { BigQuery } from '@google-cloud/bigquery';
import type { JobLoadMetadata } from '@google-cloud/bigquery';
import type { BigQueryConfig } from '../types';

const getDataset = async ({
  projectId,
  bigQuery: { datasetName },
}: BigQueryConfig) => {
  const bigquery = new BigQuery({ projectId });
  const dataset = bigquery.dataset(datasetName);

  const [exists] = await dataset.exists();

  if (!exists) {
    await dataset.create({ location: 'EU' });
  }

  return dataset;
};

const getTable = async (config: BigQueryConfig) => {
  const dataset = await getDataset(config);
  const table = dataset.table(config.bigQuery.tableName);

  const [exists] = await table.exists();

  if (!exists) {
    await table.create({ location: 'EU' });
  }

  return table;
};

const loadDataFromFile = async (config: BigQueryConfig, file: StorageFile) => {
  const table = await getTable(config);

  const loadMetadata: JobLoadMetadata = {
    sourceFormat: 'NEWLINE_DELIMITED_JSON',
    autodetect: true,
    location: 'EU',
    ...(config.bigQuery.truncateTable
      ? { writeDisposition: 'WRITE_TRUNCATE' }
      : {
          writeDisposition: 'WRITE_APPEND',
          schemaUpdateOptions: [
            'ALLOW_FIELD_ADDITION',
            'ALLOW_FIELD_RELAXATION',
          ],
        }),
  };

  await table.load(file, loadMetadata);
};

export const BigQueryService = {
  loadDataFromFile,
};
