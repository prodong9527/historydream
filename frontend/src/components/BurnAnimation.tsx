import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function BurnAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"burning" | "ashes">("burning");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("ashes"), 1500);
    const t2 = setTimeout(onComplete, 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20, 15, 10, 0.97)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
      }}
    >
      {phase === "burning" ? (
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{ duration: 0.5, repeat: Infinity }}
          style={{ textAlign: "center" }}
        >
          <div
            style={{
              width: 120,
              height: 160,
              background: "linear-gradient(180deg, #f5f0e8 0%, #e8d5b7 100%)",
              borderRadius: 4,
              margin: "0 auto",
              boxShadow: "0 0 60px rgba(255, 120, 30, 0.6)",
              transformOrigin: "bottom center",
            }}
          />
          <motion.div
            animate={{
              opacity: [0, 1, 0],
              y: [0, -40, -80],
            }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{
              fontSize: "2rem",
              marginTop: "1rem",
            }}
          >
            🔥
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: "center" }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            style={{ fontSize: "3rem", marginBottom: "1rem" }}
          >
            ✦
          </motion.div>
          <p
            style={{
              color: "rgba(201, 169, 110, 0.7)",
              fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif",
              fontSize: "1rem",
              letterSpacing: "0.2em",
            }}
          >
            信件已焚，归于星辰
          </p>
        </motion.div>
      )}
    </div>
  );
}