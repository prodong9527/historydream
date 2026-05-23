import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useThemes } from "../hooks/useThemes";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export default function OpeningAnimation({ onEnter }: { onEnter: (theme: string) => void }) {
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }))
  );

  const { themes, chosen, loading, fetchThemes, selectTheme } = useThemes();
  const [phase, setPhase] = useState<"intro" | "themes" | "entering">("intro");
  const [showEnterText, setShowEnterText] = useState(false);
  const enteredRef = useRef(false); // 防止重复触发

  useEffect(() => {
    fetchThemes();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setPhase("themes"), 3000);
    return () => clearTimeout(timer);
  }, []);

  // 选择主题后触发入梦流程
  useEffect(() => {
    if (chosen && phase === "themes" && !enteredRef.current) {
      enteredRef.current = true; // 标记已触发，防止重复
      setShowEnterText(true);

      // 3秒后开始进入动画
      setTimeout(() => {
        setPhase("entering");
      }, 3000);

      // 6秒后完成进入
      setTimeout(() => {
        onEnter(chosen);
      }, 6000);
    }
  }, [chosen, phase, onEnter]);

  const handleSelectTheme = (theme: string) => {
    // 如果已经选择了，不能再切换
    if (chosen) return;
    selectTheme(theme);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        overflow: "hidden",
      }}
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: "rgba(255, 215, 120, 0.6)",
          }}
          animate={{ opacity: [0, 0.8, 0], y: [0, -30, -60], scale: [1, 1.5, 0.5] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeOut" }}
        />
      ))}

      <motion.div
        style={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: "50%",
          border: "1px solid rgba(201, 169, 110, 0.2)",
        }}
        animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <motion.div
        style={{
          position: "absolute",
          width: 120,
          height: 120,
          borderRadius: "50%",
          border: "1px solid rgba(201, 169, 110, 0.3)",
        }}
        animate={{ scale: [1, 1.4, 1.8], opacity: [0.6, 0.3, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={{
          color: "#c9a96e",
          fontFamily: "'Noto Serif SC', serif",
          fontSize: "1.1rem",
          letterSpacing: "0.3em",
          textAlign: "center",
          marginBottom: "1rem",
        }}
      >
        ✦
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 1.5 }}
        style={{
          color: "#e8d5b7",
          fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif",
          fontSize: "1.3rem",
          letterSpacing: "0.15em",
          textAlign: "center",
          maxWidth: 320,
          lineHeight: 1.8,
        }}
      >
        某年某月某日
        <br />
        历史的齿轮悄悄转动……
      </motion.div>

      <AnimatePresence mode="wait">
        {phase === "themes" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1 }}
            style={{
              position: "absolute",
              bottom: 100,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.5rem",
            }}
          >
            <div
              style={{
                color: "rgba(201, 169, 110, 0.6)",
                fontFamily: "'Noto Serif SC', serif",
                fontSize: "0.8rem",
                letterSpacing: "0.2em",
              }}
            >
              选择今夜的主题
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center", maxWidth: 360 }}>
              {loading ? (
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{
                    color: "rgba(232, 213, 183, 0.5)",
                    fontFamily: "'Noto Serif SC', serif",
                    fontSize: "0.85rem",
                    letterSpacing: "0.1em",
                  }}
                >
                  正在聆听时光的低语…
                </motion.div>
              ) : (
                themes.map((t, i) => {
                  const isSelected = chosen === t;
                  const isDisabled = chosen && !isSelected; // 已选择其他主题则禁用
                  return (
                    <motion.button
                      key={t}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: isDisabled ? 0.3 : 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => handleSelectTheme(t)}
                      disabled={isDisabled ? true : undefined}
                      style={{
                        padding: "0.6rem 1.2rem",
                        fontSize: "0.9rem",
                        fontFamily: "'Noto Serif SC', serif",
                        letterSpacing: "0.15em",
                        color: isSelected ? "#1a1a2e" : isDisabled ? "rgba(201, 169, 110, 0.3)" : "rgba(201, 169, 110, 0.85)",
                        background: isSelected ? "rgba(201, 169, 110, 0.95)" : "rgba(201, 169, 110, 0.12)",
                        border: `1px solid ${isSelected ? "rgba(201, 169, 110, 0.95)" : "rgba(201, 169, 110, 0.35)"}`,
                        borderRadius: 24,
                        cursor: isDisabled ? "default" : "pointer",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {t}
                    </motion.button>
                  );
                })
              )}
            </div>

            {/* 选择主题后浮现"入梦"字样 */}
            <AnimatePresence>
              {showEnterText && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{
                    color: "#c9a96e",
                    fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif",
                    fontSize: "1.3rem",
                    letterSpacing: "0.5em",
                    textAlign: "center",
                    marginTop: "1.5rem",
                  }}
                >
                  入梦
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {phase === "entering" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "radial-gradient(circle at center, rgba(201, 169, 110, 0.9) 0%, rgba(26, 26, 46, 1) 70%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 200,
            }}
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              style={{
                color: "#1a1a2e",
                fontFamily: "'ZCOOL XiaoWei', serif",
                fontSize: "2rem",
                letterSpacing: "0.5em",
              }}
            >
              入梦
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}