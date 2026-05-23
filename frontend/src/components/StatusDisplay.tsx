import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const PHRASES = [
  "正在穿越时空，历史的齿轮在转动…",
  "正在打捞岁月的碎片…",
  "正在聆听时光的低语…",
  "正在唤醒沉睡的记忆…",
  "正在续写尘封的篇章…",
];

export default function StatusDisplay({ phase }: { phase: "generating" | "searching" | "idle" }) {
  const [text, setText] = useState(PHRASES[0]);
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (phase !== "generating" && phase !== "searching") return;

    const textInterval = setInterval(() => {
      setText(PHRASES[Math.floor(Math.random() * PHRASES.length)]);
    }, 4000);

    const dotInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "·"));
    }, 500);

    return () => {
      clearInterval(textInterval);
      clearInterval(dotInterval);
    };
  }, [phase]);

  if (phase === "idle") return null;

  return (
    <motion.div
      key={text}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{
        textAlign: "center",
        padding: "1.5rem 1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "rgba(201, 169, 110, 0.6)",
            }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
      <div
        style={{
          color: "rgba(232, 213, 183, 0.6)",
          fontFamily: "'Noto Serif SC', serif",
          fontSize: "0.85rem",
          letterSpacing: "0.1em",
        }}
      >
        {text}
        <span style={{ opacity: 0.5 }}>{dots}</span>
      </div>
    </motion.div>
  );
}