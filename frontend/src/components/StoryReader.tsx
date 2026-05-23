import { motion } from "framer-motion";
import type { HistoricalEvent } from "../types";
import Illustration from "./Illustration";
import GoldenSentence from "./GoldenSentence";
import ChoiceButtons from "./ChoiceButtons";

interface StoryReaderProps {
  event: HistoricalEvent;
  onBurn: () => void;
  onSave: () => void;
  isBuiltin?: boolean;
}

export default function StoryReader({ event, onBurn, onSave, isBuiltin }: StoryReaderProps) {
  const paragraphs = event.content.split("\n\n").filter((p) => p.trim());

  const firstPart = paragraphs.slice(0, Math.ceil(paragraphs.length / 2));
  const secondPart = paragraphs.slice(Math.ceil(paragraphs.length / 2));

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
        paddingBottom: "3rem",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{
          textAlign: "center",
          padding: "2.5rem 1rem 1.5rem",
        }}
      >
        <div
          style={{
            color: "#c9a96e",
            fontSize: "0.8rem",
            letterSpacing: "0.25em",
            fontFamily: "'Noto Serif SC', serif",
            marginBottom: "0.5rem",
          }}
        >
          {event.year}年{event.month}月{event.day}日 · {event.location}
        </div>
        <h1
          style={{
            color: "#e8d5b7",
            fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif",
            fontSize: "1.2rem",
            fontWeight: "normal",
            margin: 0,
            letterSpacing: "0.1em",
          }}
        >
          {event.title}
        </h1>
      </motion.div>

      <div
        style={{
          color: "rgba(232, 213, 183, 0.4)",
          textAlign: "center",
          fontSize: "0.7rem",
          letterSpacing: "0.15em",
          fontFamily: "'Noto Serif SC', serif",
          marginBottom: "0.5rem",
        }}
      >
        叙述者：{event.narrator}
      </div>

      <div style={{ padding: "0 1rem" }}>
        <LetterUnfoldWrapper>
          <Illustration imageUrls={event.image_urls} index={0} />

          <div
            style={{
              color: "#3d3020",
              fontFamily: "'Noto Serif SC', serif",
              fontSize: "1.05rem",
              lineHeight: 2.2,
              letterSpacing: "0.05em",
            }}
          >
            {firstPart.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.15 }}
                style={{
                  margin: "0 0 1.2rem 0",
                  textIndent: "2em",
                }}
              >
                {p}
              </motion.p>
            ))}
          </div>

          <div
            style={{
              color: "#3d3020",
              fontFamily: "'Noto Serif SC', serif",
              fontSize: "1.05rem",
              lineHeight: 2.2,
              letterSpacing: "0.05em",
            }}
          >
            {secondPart.slice(0, Math.ceil(secondPart.length / 2)).map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.15 }}
                style={{
                  margin: "0 0 1.2rem 0",
                  textIndent: "2em",
                }}
              >
                {p}
              </motion.p>
            ))}
          </div>

          <div
            style={{
              color: "#3d3020",
              fontFamily: "'Noto Serif SC', serif",
              fontSize: "1.05rem",
              lineHeight: 2.2,
              letterSpacing: "0.05em",
            }}
          >
            {secondPart.slice(Math.ceil(secondPart.length / 2)).map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.15 }}
                style={{
                  margin: "0 0 1.2rem 0",
                  textIndent: "2em",
                }}
              >
                {p}
              </motion.p>
            ))}
          </div>

          <GoldenSentence text={event.golden_sentence} />

          {!isBuiltin && <ChoiceButtons onBurn={onBurn} onSave={onSave} />}
          {isBuiltin && (
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <button
                onClick={onSave}
                style={{
                  padding: "0.8rem 2rem",
                  fontSize: "0.95rem",
                  fontFamily: "'Noto Serif SC', serif",
                  letterSpacing: "0.15em",
                  color: "#4a3728",
                  background: "rgba(201, 169, 110, 0.15)",
                  border: "1px solid rgba(201, 169, 110, 0.5)",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                返回首页
              </button>
            </div>
          )}
        </LetterUnfoldWrapper>
      </div>
    </div>
  );
}

function LetterUnfoldWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: "linear-gradient(180deg, #f5f0e8 0%, #ede5d8 100%)",
          borderRadius: "4px 4px 6px 6px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          width: "100%",
          maxWidth: 680,
          transformOrigin: "top center",
          padding: "2rem 2.5rem",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background:
              "repeating-linear-gradient(90deg, #c9a96e 0px, #c9a96e 1px, transparent 1px, transparent 8px)",
            opacity: 0.4,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background:
              "repeating-linear-gradient(90deg, #c9a96e 0px, #c9a96e 1px, transparent 1px, transparent 8px)",
            opacity: 0.4,
          }}
        />
        {children}
      </motion.div>
    </div>
  );
}