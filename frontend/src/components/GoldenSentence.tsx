import { motion } from "framer-motion";

export default function GoldenSentence({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      style={{
        borderTop: "1px dashed #c9a96e",
        borderBottom: "1px dashed #c9a96e",
        padding: "1.5rem 1rem",
        margin: "2rem 0 1rem",
        textAlign: "center",
        background: "rgba(201, 169, 110, 0.06)",
        borderRadius: 4,
      }}
    >
      <div
        style={{
          fontSize: "0.75rem",
          color: "#c9a96e",
          letterSpacing: "0.3em",
          marginBottom: "0.75rem",
          fontFamily: "'Noto Serif SC', serif",
        }}
      >
        ✦ 金句
      </div>
      <p
        style={{
          color: "#5a4a2a",
          fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif",
          fontSize: "1.1rem",
          lineHeight: 1.9,
          margin: 0,
          fontStyle: "italic",
        }}
      >
        {text}
      </p>
    </motion.div>
  );
}