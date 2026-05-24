import { useState } from "react";

const API_BASE = "http://localhost:8000/api";

interface ThemeResult {
  themes: string[];
  chosen: string;
}

export function useThemes() {
  const [themes, setThemes] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string>(""); // 初始为空，不自动设置
  const [loading, setLoading] = useState(false);

  const fetchThemes = async (): Promise<ThemeResult | null> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/themes`);
      if (!res.ok) throw new Error("主题生成失败");
      const data = await res.json();
      setThemes(data.themes);
      // 不自动设置 chosen，让用户手动选择
      return data;
    } catch (e) {
      return null;
    } finally {
      setLoading(false);
    }
  };

  const selectTheme = (theme: string) => {
    setChosen(theme);
    localStorage.setItem("dailyTheme", theme);
  };

  return { themes, chosen, loading, fetchThemes, selectTheme };
}