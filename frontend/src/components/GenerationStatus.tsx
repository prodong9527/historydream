import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type Step = "idle" | "generating" | "done";

interface GenerationStatusProps {
  status: Step;
}

export default function GenerationStatus({ status }: GenerationStatusProps) {
  const [dots, setDots] = useState("");
  const [stepIndex, setStepIndex] = useState(0);

  const steps = ["追溯时光", "编织故事", "描绘画卷"];

  useEffect(() => {
    if (status !== "generating") return;
    const dotInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "·"));
    }, 500);
    return () => clearInterval(dotInterval);
  }, [status]);

  useEffect(() => {
    if (status !== "generating") return;
    // 模拟三步进度，每步约5秒
    const stepInterval = setInterval(() => {
      setStepIndex((i) => (i < 2 ? i + 1 : i));
    }, 5000);
    return () => clearInterval(stepInterval);
  }, [status]);

  if (status === "idle" || status === "done") return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem",
        padding: "1rem",
      }}
    >
      {/* Step dots */}
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        {steps.map((step, idx) => {
          const isCompleted = idx < stepIndex;
          const isCurrent = idx === stepIndex;

          return (
            <div key={step} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  width: isCurrent ? 28 : 20,
                  height: isCurrent ? 28 : 20,
                  borderRadius: "50%",
                  background: isCompleted
                    ? "rgba(201, 169, 110, 0.8)"
                    : isCurrent
                    ? "rgba(201, 169, 110, 0.6)"
                    : "rgba(201, 169, 110, 0.2)",
                  border: `1px solid ${
                    isCompleted || isCurrent
                      ? "rgba(201, 169, 110, 0.8)"
                      : "rgba(201, 169, 110, 0.3)"
                  }`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isCurrent ? "0.65rem" : "0.55rem",
                  color: isCompleted || isCurrent ? "#1a1a2e" : "rgba(201, 169, 110, 0.5)",
                  fontFamily: "'Noto Serif SC', serif",
                  transition: "all 0.5s ease",
                }}
              >
                {isCompleted ? "✓" : idx + 1}
              </motion.div>
              {idx < steps.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isCompleted ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    width: 24,
                    height: 1,
                    background: "rgba(201, 169, 110, 0.4)",
                    transformOrigin: "left",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Current step info */}
      <motion.div
        key={stepIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: "center" }}
      >
        <div
          style={{
            color: "#c9a96e",
            fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif",
            fontSize: "1.1rem",
            letterSpacing: "0.2em",
            marginBottom: "0.5rem",
          }}
        >
          {steps[stepIndex]}
        </div>
        <div
          style={{
            color: "rgba(232, 213, 183, 0.5)",
            fontFamily: "'Noto Serif SC', serif",
            fontSize: "0.75rem",
            letterSpacing: "0.1em",
          }}
        >
          {stepIndex === 0 && "在历史长河中寻找今日的印记"}
          {stepIndex === 1 && "以主题为线，织就一段往事"}
          {stepIndex === 2 && "用AI之笔，绘出那一幕"}
          <span style={{ opacity: 0.4 }}>{dots}</span>
        </div>
      </motion.div>

      {/* Animated particles */}
      <div style={{ display: "flex", gap: "1rem" }}>
        {["✦", "◈", "◇"].map((p, i) => (
          <motion.div
            key={i}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              y: [0, -8, 0],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: 1.5 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            style={{
              color: "rgba(201, 169, 110, 0.5)",
              fontSize: "0.9rem",
            }}
          >
            {p}
          </motion.div>
        ))}
      </div>
    </div>
  );
}