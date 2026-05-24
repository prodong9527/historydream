import { useState } from "react";
import type { HistoricalEvent } from "../types";

const API_BASE = "http://localhost:8000/api";

export function useRandomStory() {
  const [story, setStory] = useState<HistoricalEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRandom = async (theme?: string): Promise<HistoricalEvent | null> => {
    setLoading(true);
    setError(null);
    try {
      const url = theme ? `${API_BASE}/generate?theme=${encodeURIComponent(theme)}` : `${API_BASE}/generate`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("生成失败");
      const data = await res.json();
      setStory(data);
      return data;
    } catch (e) {
      setError("生成故事失败，请稍后再试");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveStory = async (eventId: number) => {
    const res = await fetch(`${API_BASE}/stories/${eventId}/save`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to save");
    return res.json();
  };

  return { story, loading, error, fetchRandom, saveStory };
}