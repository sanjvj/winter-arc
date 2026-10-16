import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  serverTimestamp,
  UpdateData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { z } from 'zod';
import { toast } from '@/components/ui/toast';

export async function setDocument<T>(
  uid: string,
  collectionName: string,
  docId: string,
  data: T,
  schema?: z.ZodType<T, z.ZodTypeDef, unknown>,
): Promise<boolean> {
  try {
    if (schema) {
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        const errorMsg = parsed.error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ');
        toast.error('Validation Error', errorMsg);
        return false;
      }
    }

    const docRef = doc(db, 'users', uid, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown write failure';
    console.error(`[Mutation Error] setDocument failed at ${collectionName}/${docId}:`, err);
    toast.error('Save Failed', message);
    return false;
  }
}

export async function updateDocument(
  uid: string,
  collectionName: string,
  docId: string,
  data: Record<string, unknown>,
): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', uid, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    } as UpdateData<Record<string, unknown>>);
    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown update failure';
    console.error(`[Mutation Error] updateDocument failed at ${collectionName}/${docId}:`, err);
    toast.error('Update Failed', message);
    return false;
  }
}

export async function deleteDocument(
  uid: string,
  collectionName: string,
  docId: string,
): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', uid, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown deletion failure';
    console.error(`[Mutation Error] deleteDocument failed at ${collectionName}/${docId}:`, err);
    toast.error('Delete Failed', message);
    return false;
  }
}

export async function addDocument<T>(
  uid: string,
  collectionName: string,
  data: T,
  schema?: z.ZodType<T, z.ZodTypeDef, unknown>,
): Promise<string | null> {
  try {
    if (schema) {
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        const errorMsg = parsed.error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ');
        toast.error('Validation Error', errorMsg);
        return null;
      }
    }

    const colRef = collection(db, 'users', uid, collectionName);
    const docRef = await addDoc(colRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown insert failure';
    console.error(`[Mutation Error] addDocument failed at ${collectionName}:`, err);
    toast.error('Creation Failed', message);
    return null;
  }
}
