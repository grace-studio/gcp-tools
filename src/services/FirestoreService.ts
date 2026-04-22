import type { FirestoreConfig, Parser } from '../types';
import type { DocumentSnapshot } from '@google-cloud/firestore';
import { Firestore } from '@google-cloud/firestore';
import type { Streamer } from './StorageService';

const PAGE_SIZE = 500;

const createFirestoreClient = ({
  projectId,
  databaseId,
}: {
  projectId: string;
  databaseId?: string;
}) =>
  new Firestore({
    projectId,
    databaseId,
    ignoreUndefinedProperties: true,
  });

const fetchDocs = async <T, U>(
  { projectId, firestore: { databaseId, collectionName } }: FirestoreConfig,
  documentParser: Parser<T, U>,
): Promise<U[]> => {
  const firestore = createFirestoreClient({ projectId, databaseId });
  const collectionRef = firestore.collection(collectionName);
  const results: U[] = [];

  let lastDoc: DocumentSnapshot | undefined;
  let hasMore = true;

  while (hasMore) {
    const query = lastDoc
      ? collectionRef.orderBy('__name__').startAfter(lastDoc).limit(PAGE_SIZE)
      : collectionRef.orderBy('__name__').limit(PAGE_SIZE);

    const snapshot = await query.get();

    snapshot.docs.forEach((doc) => {
      results.push(
        documentParser({
          ...doc.data(),
          documentId: doc.id,
        } as T),
      );
    });

    hasMore = snapshot.size === PAGE_SIZE;
    lastDoc = snapshot.docs[snapshot.size - 1];
  }

  return results;
};

const streamDocs = async <T, U extends Record<string, any>>(
  { projectId, firestore: { databaseId, collectionName } }: FirestoreConfig,
  documentParser: Parser<T, U>,
  streamer: Streamer,
): Promise<void> => {
  const firestore = createFirestoreClient({ projectId, databaseId });
  const collectionRef = firestore.collection(collectionName);

  let lastDoc: DocumentSnapshot | undefined;
  let hasMore = true;

  while (hasMore) {
    const query = lastDoc
      ? collectionRef.orderBy('__name__').startAfter(lastDoc).limit(PAGE_SIZE)
      : collectionRef.orderBy('__name__').limit(PAGE_SIZE);

    const snapshot = await query.get();

    snapshot.docs.forEach((doc) => {
      streamer.write(
        documentParser({
          ...doc.data(),
          documentId: doc.id,
        } as T),
      );
    });

    hasMore = snapshot.size === PAGE_SIZE;
    lastDoc = snapshot.docs[snapshot.size - 1];
  }
};

export const FirestoreService = {
  fetchDocs,
  streamDocs,
};
