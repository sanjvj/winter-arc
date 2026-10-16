'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/contexts/auth-context';
import { z } from 'zod';
import { toast } from '@/components/ui/toast';

interface UseDocResult<T> {
  data: T | null;
  rawData: DocumentData | null;
  loading: boolean;
  error: Error | null;
  exists: boolean;
}

export function useDoc<T>(
  collectionName: string,
  docId: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
): UseDocResult<T> {
  const { user } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [rawData, setRawData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [exists, setExists] = useState<boolean>(false);

  useEffect(() => {
    if (!user?.uid || !docId) {
      setLoading(false);
      setData(null);
      setExists(false);
      return;
    }

    setLoading(true);
    const docRef = doc(db, 'users', user.uid, collectionName, docId);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        setExists(snapshot.exists());
        if (!snapshot.exists()) {
          setData(null);
          setRawData(null);
          setLoading(false);
          return;
        }

        const raw = snapshot.data();
        setRawData(raw);

        // Boundary Validation with Zod
        const parsed = schema.safeParse(raw);
        if (parsed.success) {
          setData(parsed.data);
          setError(null);
        } else {
          console.warn(
            `[Data Validation Warning] Document /users/${user.uid}/${collectionName}/${docId} failed schema validation:`,
            parsed.error.format(),
          );
          // Do not crash the application; report error state
          setError(new Error(`Schema validation failed for ${collectionName}/${docId}`));
          toast.error(
            'Data Validation Issue',
            `Document ${collectionName}/${docId} has an unexpected format.`,
          );
        }
        setLoading(false);
      },
      (err) => {
        console.error(`[Firestore Error] Failed to read ${collectionName}/${docId}:`, err);
        setError(err);
        setLoading(false);
        toast.error('Firestore Read Failed', err.message);
      },
    );

    return () => unsubscribe();
  }, [user?.uid, collectionName, docId, schema]);

  return { data, rawData, loading, error, exists };
}
