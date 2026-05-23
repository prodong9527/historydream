import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HistoricalEvent } from "../types";
import { useSavedStories } from "../hooks/useSavedStories";
import { useRandomStory } from "../hooks/useRandomStory";
import OpeningAnimation from "../components/OpeningAnimation";
import GenerationStatus from "../components/GenerationStatus";
import StoryReader from "../components/StoryReader";
import BurnAnimation from "../components/BurnAnimation";

type Phase = "opening" | "home" | "reading" | "burning";
type GenStatus = "idle" | "generating" | "done";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("opening");
  const [genStatus, setGenStatus] = useState<GenStatus>("idle");
  const [dailyTheme, setDailyTheme] = useState<string>("");
  const [readingEvent, setReadingEvent] = useState<HistoricalEvent | null>(null);
  const [readingSource, setReadingSource] = useState<"new" | "builtin" | "saved">("new");
  const [newStory, setNewStory] = useState<HistoricalEvent | null>(null);
  const [showNewStory, setShowNewStory] = useState(false); // 控制是否显示新故事
  const [todaySaved, setTodaySaved] = useState(() => {
    const stored = localStorage.getItem("todaySaved");
    if (stored) {
      const { date, saved } = JSON.parse(stored);
      const today = new Date().toDateString();
      if (date === today) return saved;
    }
    return false;
  });

  // 记录已打开过的故事标题
  const [openedStories, setOpenedStories] = useState<Set<string>>(() => {
    const stored = localStorage.getItem("openedStories");
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  // 完成提醒声音 ref
  const completeSoundRef = useRef<HTMLAudioElement | null>(null);
  // 生成完成时的提示状态
  const [showCompleteNotice, setShowCompleteNotice] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      "todaySaved",
      JSON.stringify({ date: new Date().toDateString(), saved: todaySaved })
    );
  }, [todaySaved]);

  useEffect(() => {
    localStorage.setItem("openedStories", JSON.stringify([...openedStories]));
  }, [openedStories]);

  const { saved, builtin, refetch, deleteStory } = useSavedStories();
  const { story: fetchedStory, loading: generating, fetchRandom, saveStory } = useRandomStory();

  // 当 fetchRandom 返回新故事时，播放完成声音，但不立即显示
  useEffect(() => {
    if (fetchedStory && !todaySaved && genStatus === "generating") {
      setNewStory(fetchedStory);
      setGenStatus("done");
      setShowCompleteNotice(true); // 显示完成提示
      // 播放完成提醒声音
      if (completeSoundRef.current) {
        completeSoundRef.current.currentTime = 0;
        completeSoundRef.current.play().catch(() => {});
      }
      // 3秒后隐藏提示，显示故事
      setTimeout(() => {
        setShowCompleteNotice(false);
        setShowNewStory(true);
      }, 3000);
    }
  }, [fetchedStory, todaySaved, genStatus]);

  // 初次进入 home 时触发生成（生成继续进行，不受阅读影响）
  useEffect(() => {
    if (phase === "home" && !todaySaved && dailyTheme && !newStory && genStatus === "idle") {
      setGenStatus("generating");
      fetchRandom(dailyTheme);
    }
  }, [phase, todaySaved, dailyTheme, newStory, genStatus, fetchRandom]);

  const handleOpeningComplete = (theme: string) => {
    // 清除 todaySaved，确保可以生成
    localStorage.removeItem("todaySaved");
    setTodaySaved(false);
    setShowNewStory(false);
    setNewStory(null);
    setGenStatus("idle");
    setDailyTheme(theme);
    setPhase("home");
  };

  const openStory = (event: HistoricalEvent, source: "new" | "builtin" | "saved") => {
    setReadingEvent(event);
    setReadingSource(source);
    setPhase("reading");
    // 记录已打开
    setOpenedStories((prev) => new Set([...prev, event.title]));
  };

  const handleSave = async () => {
    if (!readingEvent) return;
    if (readingSource === "saved" || readingSource === "new") {
      if (readingEvent.id !== -1) {
        try {
          await saveStory(readingEvent.id);
          refetch();
        } catch (e) {
          console.error("Save failed", e);
        }
      }
    }
    setTodaySaved(true);
    setNewStory(null);
    setPhase("home");
  };

  const handleBurn = () => {
    if (readingSource === "saved" && readingEvent) {
      const savedStory = saved.find(
        (s) => JSON.parse(s.content_snapshot).title === readingEvent.title
      );
      if (savedStory) {
        deleteStory(savedStory.id);
        refetch();
      }
    }
    // 清空当前故事，允许重新生成
    setNewStory(null);
    setGenStatus("idle");
    setPhase("burning");
  };

  const renderHome = () => (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
        padding: "2rem 1rem",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center", marginBottom: "2rem" }}
      >
        <h1
          style={{
            color: "#c9a96e",
            fontFamily: "'ZCOOL XiaoWei', serif",
            fontSize: "1.6rem",
            letterSpacing: "0.3em",
            margin: 0,
            fontWeight: "normal",
          }}
        >
          星河予梦
        </h1>
        <p
          style={{
            color: "rgba(201, 169, 110, 0.5)",
            fontFamily: "'Noto Serif SC', serif",
            fontSize: "0.75rem",
            letterSpacing: "0.2em",
            marginTop: "0.5rem",
          }}
        >
          历史长河中的温暖时刻
        </p>
        {dailyTheme && (
          <p
            style={{
              color: "rgba(201, 169, 110, 0.35)",
              fontFamily: "'Noto Serif SC', serif",
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
              marginTop: "0.3rem",
            }}
          >
            今夜 · {dailyTheme}
          </p>
        )}
      </motion.div>

      {/* 完成提醒声音 */}
      <audio ref={completeSoundRef} preload="auto">
        <source src="/bird.mp3" type="audio/mpeg" />
      </audio>

      {/* 生成进度（只在生成中显示） */}
      <GenerationStatus status={generating ? "generating" : "idle"} />

      {generating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: "center",
            padding: "1rem",
            color: "rgba(232, 213, 183, 0.4)",
            fontFamily: "'Noto Serif SC', serif",
            fontSize: "0.8rem",
            letterSpacing: "0.1em",
          }}
        >
          生成中，您可以先阅读其他故事…
        </motion.div>
      )}

      {/* 完成提示 overlay */}
      <AnimatePresence>
        {showCompleteNotice && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: "fixed",
              bottom: 100,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(201, 169, 110, 0.95)",
              color: "#1a1a2e",
              padding: "0.8rem 1.5rem",
              borderRadius: 8,
              fontFamily: "'Noto Serif SC', serif",
              fontSize: "0.9rem",
              letterSpacing: "0.15em",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              zIndex: 1000,
            }}
          >
            ✦ 今夜新故事已生成 ✦
          </motion.div>
        )}
      </AnimatePresence>

      {/* 新故事（生成完成且显示时才显示） */}
      {showNewStory && newStory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: 600, margin: "0 auto 2rem" }}
        >
          <div
            style={{
              color: "rgba(201, 169, 110, 0.7)",
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              fontFamily: "'Noto Serif SC', serif",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            ✦ 今夜新故事 ✦
          </div>
          <StoryCard
            title={newStory.title}
            subtitle={`${newStory.year}年 · ${newStory.location}`}
            isNew
            isUnopened={!openedStories.has(newStory.title)}
            onClick={() => openStory(newStory, "new")}
          />
        </motion.div>
      )}

      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        {/* 已保存的故事（按时间倒序） */}
        {saved.length > 0 && (
          <div style={{ marginBottom: "2rem" }}>
            <div
              style={{
                color: "rgba(201, 169, 110, 0.5)",
                fontSize: "0.7rem",
                letterSpacing: "0.2em",
                fontFamily: "'Noto Serif SC', serif",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              收藏的故事
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {saved
                .sort((a, b) => b.saved_at - a.saved_at) // 按时间倒序
                .map((s) => {
                  const ev = JSON.parse(s.content_snapshot);
                  return (
                    <div key={s.id} style={{ display: "flex", gap: "0.5rem", alignItems: "stretch" }}>
                      <div style={{ flex: 1 }}>
                        <StoryCard
                          title={ev.title}
                          subtitle={`${ev.year}年 · ${ev.location}`}
                          isUnopened={!openedStories.has(ev.title)}
                          onClick={() => openStory(ev, "saved")}
                        />
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => deleteStory(s.id)}
                        style={{
                          padding: "0.4rem 0.6rem",
                          fontSize: "0.7rem",
                          color: "rgba(201, 169, 110, 0.6)",
                          background: "transparent",
                          border: "1px solid rgba(201, 169, 110, 0.3)",
                          borderRadius: 4,
                          cursor: "pointer",
                          fontFamily: "'Noto Serif SC', serif",
                        }}
                      >
                        删除
                      </motion.button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* 内置故事 */}
        {builtin.length > 0 && (
          <div style={{ marginBottom: "2rem" }}>
            <div
              style={{
                color: "rgba(201, 169, 110, 0.5)",
                fontSize: "0.7rem",
                letterSpacing: "0.2em",
                fontFamily: "'Noto Serif SC', serif",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              经典故事
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {builtin.map((event) => (
                <StoryCard
                  key={event.id}
                  title={event.title}
                  subtitle={`${event.year}年 · ${event.location}`}
                  isUnopened={!openedStories.has(event.title)}
                  onClick={() => openStory(event, "builtin")}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {phase === "opening" && (
          <OpeningAnimation onEnter={handleOpeningComplete} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "home" && renderHome()}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "reading" && readingEvent && (
          <StoryReader
            event={readingEvent}
            onBurn={handleBurn}
            onSave={handleSave}
            isBuiltin={readingSource === "builtin"}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "burning" && (
        <BurnAnimation
          onComplete={() => {
            setPhase("home");
            // 焚毁后重置状态，触发重新生成
            setGenStatus("idle");
            setNewStory(null);
          }}
        />
      )}
      </AnimatePresence>
    </>
  );
}

function StoryCard({
  title,
  subtitle,
  isNew,
  isUnopened,
  onClick,
}: {
  title: string;
  subtitle: string;
  isNew?: boolean;
  isUnopened?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.01, x: 4 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      style={{
        background: isNew ? "rgba(201, 169, 110, 0.15)" : "rgba(245, 240, 232, 0.08)",
        border: `1px solid ${isNew ? "rgba(201, 169, 110, 0.5)" : "rgba(201, 169, 110, 0.2)"}`,
        borderRadius: 6,
        padding: "1rem 1.25rem",
        cursor: "pointer",
        transition: "all 0.3s ease",
        position: "relative",
      }}
    >
      {/* 未打开标记 */}
      {isUnopened && !isNew && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "rgba(201, 169, 110, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.5rem",
            color: "#1a1a2e",
          }}
        >
          ✦
        </motion.div>
      )}
      <div
        style={{
          color: "#e8d5b7",
          fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif",
          fontSize: "1rem",
          letterSpacing: "0.08em",
          marginBottom: "0.3rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        {isUnopened && !isNew && <span style={{ color: "rgba(201, 169, 110, 0.8)", fontSize: "0.8rem" }}>✦</span>}
        {title}
      </div>
      <div
        style={{
          color: "rgba(201, 169, 110, 0.5)",
          fontFamily: "'Noto Serif SC', serif",
          fontSize: "0.75rem",
          letterSpacing: "0.1em",
        }}
      >
        {subtitle}
      </div>
    </motion.div>
  );
}