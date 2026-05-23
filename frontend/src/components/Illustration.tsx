import { motion } from "framer-motion";

interface IllustrationProps {
  imageUrls: string[] | null;
  index: number;
}

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80",
];

export default function Illustration({ imageUrls, index }: IllustrationProps) {
  const imageUrl = imageUrls?.[index] || PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.3 + 0.5, duration: 1 }}
      style={{
        width: "100%",
        height: 200,
        borderRadius: 8,
        overflow: "hidden",
        margin: "1.5rem 0",
        position: "relative",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      }}
    >
      <img
        src={imageUrl}
        alt={`插画 ${index + 1}`}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "saturate(0.7) sepia(0.15)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, transparent 60%, rgba(245,240,232,0.4) 100%)",
          pointerEvents: "none",
        }}
      />
    </motion.div>
  );
}