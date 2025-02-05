import type { StorageConfig } from '../types';
import { logger } from '../utils';
import { Storage, File as StorageFile } from '@google-cloud/storage';
import internal, { PassThrough } from 'stream';
import { randomUUID } from 'crypto';

export type Streamer = {
  fileStream: internal.Writable;
  write: <T extends Record<string, any>>(data: T) => boolean;
  end: () => void;
};

const getBucket = async ({
  projectId,
  storage: { bucketName },
}: StorageConfig) => {
  const storage = new Storage({ projectId });

  const [exists] = await storage.bucket(bucketName).exists();

  if (!exists) {
    await storage.createBucket(bucketName, { location: 'eu' });
  }

  return storage.bucket(bucketName);
};

const getFile = async (config: StorageConfig, fileName: string) => {
  const bucket = await getBucket(config);

  return bucket.file(fileName);
};

const getTempFile = async (config: StorageConfig) => {
  const bucket = await getBucket(config);

  const fileName = `temp/${randomUUID()}.txt`;

  return bucket.file(fileName);
};

const streamer = (file: StorageFile): Streamer => {
  const passThroughStream = new PassThrough();

  const stream = file.createWriteStream({
    resumable: false,
    gzip: true,
    contentType: 'application/text',
  });

  passThroughStream.pipe(stream);

  return {
    fileStream: stream,
    write: (data: Record<string, any>) =>
      passThroughStream.write(`${JSON.stringify(data)}\n`),
    end: () => passThroughStream.end(),
  };
};

const streamToFile = (
  file: StorageFile,
  data: Record<string, any>[],
): Promise<void> => {
  try {
    const { fileStream, end, write } = streamer(file);
    data.forEach((d) => {
      write(d);
    });
    end();

    return new Promise((resolve, reject) => {
      fileStream.on('finish', async () => {
        try {
          const [exists] = await file.exists();

          if (exists) {
            resolve();
          } else {
            logger.ERROR({
              message: 'File does not exist after write operation',
              description: `File: ${file.name} written to storage bucket`,
            });

            reject();
          }
        } catch (error) {
          logger.ERROR({
            message: 'Error verifying file in Storage Bucket',
            description: `File: ${file.name} written to storage bucket`,
            data: error,
          });

          reject();
        }
      });

      fileStream.on('error', (err) => {
        reject(err);
      });
    });
  } catch (err) {
    console.error(err);
    return Promise.reject();
  }
};

export const StorageService = { getFile, getTempFile, streamToFile, streamer };
