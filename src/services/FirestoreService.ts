import type { FirestoreConfig, Parser } from '../types';
import { Firestore } from '@google-cloud/firestore';

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

  const docs: T[] = snapshot.docs.map(
    (doc) =>
      ({
        ...doc.data(),
        documentId: doc.id,
      }) as T,
  );

  return docs.map(documentParser);
};

export const FirestoreService = {
  fetchDocs,
};
