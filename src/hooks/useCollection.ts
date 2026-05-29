import { useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from "../firebase/config"; 

export function useCollection(collectionName: string) {
  const [loading, setLoading] = useState(false);
  const ref = collection(db, collectionName);

  const getAll = async (filters: any[] = []) => {
    setLoading(true);
    try {
      let q = query(ref);
      
      if (filters.length > 0) {
        filters.forEach(([field, condition, value]) => {
          q = query(q, where(field, condition, value));
        });
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(docItem => ({
        id: docItem.id,
        ...docItem.data()
      }));
      return data;
    } catch (error) {
      console.error(`Error en getAll de la colección ${collectionName}:`, error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const add = async (data: any) => {
    try {
      const docRef = await addDoc(ref, data);
      return docRef.id;
    } catch (error) {
      console.error("Error al agregar documento:", error);
    }
  };

  return { getAll, add, loading };
}