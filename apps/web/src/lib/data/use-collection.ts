'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  WhereFilterOp,
  OrderByDirection,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/contexts/auth-context';
import { z } from 'zod';
import { toast } from '@/components/ui/toast';

export interface WhereFilter {
  field: string;
  op: WhereFilterOp;
  value: unknown;
}

export interface CollectionQueryOptions {
  whereFilters?: WhereFilter[];
  orderByField?: {
    field: string;
    direction?: OrderByDirection;
  };
  limitCount?: number;
}

interface UseCollectionResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  count: number;
}

export function useCollection<T>(
  collectionName: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  options?: CollectionQueryOptions,
): UseCollectionResult<T> {
  const { user } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const optionsJson = JSON.stringify(options);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      setData([]);
      return;
    }

    setLoading(true);
    const colRef = collection(db, 'users', user.uid, collectionName);

    const constraints: QueryConstraint[] = [];
    if (options?.whereFilters) {
      for (const f of options.whereFilters) {
        constraints.push(where(f.field, f.op, f.value));
      }
    }
    if (options?.orderByField) {
      constraints.push(
        orderBy(options.orderByField.field, options.orderByField.direction || 'asc'),
      );
    }
    if (options?.limitCount) {
      constraints.push(limit(options.limitCount));
    }

    const q = query(colRef, ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const validItems: T[] = [];
        let invalidCount = 0;

        for (const docSnap of snapshot.docs) {
          const raw = { ...docSnap.data(), id: docSnap.id };
          const parsed = schema.safeParse(raw);
          if (parsed.success) {
            validItems.push(parsed.data);
          } else {
            invalidCount++;
            console.warn(
              `[Data Validation Warning] Document ${collectionName}/${docSnap.id} failed validation:`,
              parsed.error.format(),
            );
          }
        }

        if (invalidCount > 0) {
          toast.error(
            'Corrupted Records Detected',
            `Filtered out ${invalidCount} document(s) in ${collectionName} with invalid schema.`,
          );
        }

        setData(validItems);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error(`[Firestore Error] Failed to read collection ${collectionName}:`, err);
        setError(err);
        setLoading(false);
        toast.error(`Failed to load ${collectionName}`, err.message);
      },
    );

    return () => unsubscribe();
  }, [
    user?.uid,
    collectionName,
    schema,
    optionsJson,
    options?.whereFilters,
    options?.orderByField,
    options?.limitCount,
  ]);

  return { data, loading, error, count: data.length };
}
