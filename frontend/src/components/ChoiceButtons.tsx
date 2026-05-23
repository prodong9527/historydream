import { motion } from "framer-motion";

interface ChoiceButtonsProps {
  onBurn: () => void;
  onSave: () => void;
}

export default function ChoiceButtons({ onBurn, onSave }: ChoiceButtonsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      style={{
        display: "flex",
        gap: "1.5rem",
        justifyContent: "center",
        marginTop: "2.5rem",
        flexWrap: "wrap",
      }}
    >
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onBurn}
        style={{
          padding: "0.8rem 2rem",
          fontSize: "0.95rem",
          fontFamily: "'Noto Serif SC', serif",
          letterSpacing: "0.15em",
          color: "#8b4513",
          background: "transparent",
          border: "1px solid rgba(139, 69, 19, 0.4)",
          borderRadius: 4,
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
      >
        阅后即焚
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
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
          transition: "all 0.3s ease",
        }}
      >
        保存到历史
      </motion.button>
    </motion.div>
  );
}