import type { FirestoreConfig, Parser } from '../types';
import { Firestore } from '@google-cloud/firestore';
import type { Streamer } from './StorageService';

const fetchDocs = async <T, U>(
  { projectId, firestore: { databaseId, collectionName } }: FirestoreConfig,
  documentParser: Parser<T, U>,
): Promise<U[]> => {
  const firestore = new Firestore({
    projectId,
    databaseId,
    ignoreUndefinedProperties: true,
  });

  const collectionRef = firestore.collection(collectionName);
  const snapshot = await collectionRef.get();

  return snapshot.docs.map((doc) =>
    documentParser({
      ...doc.data(),
      documentId: doc.id,
    } as T),
  );
};

const streamDocs = async <T, U extends Record<string, any>>(
  { projectId, firestore: { databaseId, collectionName } }: FirestoreConfig,
  documentParser: Parser<T, U>,
  streamer: Streamer,
): Promise<void> => {
  const firestore = new Firestore({
    projectId,
    databaseId,
    ignoreUndefinedProperties: true,
  });

  const collectionRef = firestore.collection(collectionName);
  const snapshot = await collectionRef.get();

  snapshot.docs.forEach((doc) => {
    streamer.write(
      documentParser({
        ...doc.data(),
        documentId: doc.id,
      } as T),
    );
  });
};

export const FirestoreService = {
  fetchDocs,
  streamDocs,
};
