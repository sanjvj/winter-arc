import {
  collection,
  query,
  limit,
  startAfter,
  getDocs,
  DocumentSnapshot,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { z } from 'zod';

export interface PaginationState<T> {
  items: T[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
  loading: boolean;
}

export async function fetchPaginatedCollection<T>(
  uid: string,
  collectionName: string,
  schema: z.ZodType<T>,
  pageSize: number = 20,
  cursor: DocumentSnapshot | null = null,
  additionalConstraints: QueryConstraint[] = [],
): Promise<{ items: T[]; lastDoc: DocumentSnapshot | null; hasMore: boolean }> {
  const colRef = collection(db, 'users', uid, collectionName);
  const constraints: QueryConstraint[] = [...additionalConstraints, limit(pageSize + 1)];

  if (cursor) {
    constraints.push(startAfter(cursor));
  }

  const q = query(colRef, ...constraints);
  const snapshot = await getDocs(q);

  const docs = snapshot.docs;
  const hasMore = docs.length > pageSize;
  const pageDocs = hasMore ? docs.slice(0, pageSize) : docs;
  const newLastDoc = pageDocs.length > 0 ? (pageDocs[pageDocs.length - 1] ?? null) : null;

  const items: T[] = [];
  for (const docSnap of pageDocs) {
    const parsed = schema.safeParse({ ...docSnap.data(), id: docSnap.id });
    if (parsed.success) {
      items.push(parsed.data);
    }
  }

  return {
    items,
    lastDoc: newLastDoc,
    hasMore,
  };
}
