import { motion } from "framer-motion";

export default function LetterUnfold({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        perspective: 1000,
        width: "100%",
        padding: "1rem",
      }}
    >
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: "linear-gradient(180deg, #f5f0e8 0%, #ede5d8 100%)",
          borderRadius: "4px 4px 6px 6px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)",
          width: "100%",
          maxWidth: 680,
          minHeight: "80vh",
          transformOrigin: "top center",
          position: "relative",
          overflow: "hidden",
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          style={{ padding: "2rem 2.5rem" }}
        >
          {children}
        </motion.div>

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
      </motion.div>
    </div>
  );
}