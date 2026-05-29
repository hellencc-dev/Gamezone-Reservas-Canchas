import { useState, useEffect } from "react";
import { useCollection } from "./useCollection";
export function useCourts() {
  const { getAll, loading: collectionLoading } = useCollection("courts");
  const [courts, setCourts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourts = async () => {
    try {
      setLoading(true);
      const data = await getAll();
      setCourts(data || []);
    } catch (error) {
      console.error("Error al traer las canchas de Firestore:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourts();
  }, []);

  return { 
    courts, 
    loading: loading || collectionLoading, 
    refreshCourts: fetchCourts 
  };
}