import { useState, useEffect } from "react";
import type { SavedStory, HistoricalEvent } from "../types";

const API_BASE = "http://localhost:8000/api";

export function useSavedStories() {
  const [saved, setSaved] = useState<SavedStory[]>([]);
  const [builtin, setBuiltin] = useState<HistoricalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    const [savedRes, builtinRes] = await Promise.all([
      fetch(`${API_BASE}/history`),
      fetch(`${API_BASE}/builtin`),
    ]);
    const savedData = await savedRes.json();
    const builtinData = await builtinRes.json();
    setSaved(savedData);
    setBuiltin(builtinData);
    setLoading(false);
  };

  const deleteStory = async (id: number) => {
    await fetch(`${API_BASE}/history/${id}`, { method: "DELETE" });
    setSaved((prev) => prev.filter((s) => s.id !== id));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return { saved, builtin, loading, refetch: fetchAll, deleteStory };
}