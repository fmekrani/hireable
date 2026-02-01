"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import VaporizeTextCycle, { Tag } from "@/components/ui/vaporize-animation-text";

interface VaporizeSplashProps {
  onComplete?: () => void;
}

export default function VaporizeSplash({ onComplete }: VaporizeSplashProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Total time: vaporize (1.2s) + fade in (0.5s) = 1.7s, then 0.3s buffer before splash fade
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onComplete?.();
      }, 800);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-50 bg-black"
    >
      <div className="w-full h-full">
        <VaporizeTextCycle
          texts={["hireable.ai"]}
          font={{
            fontFamily: "Inter, sans-serif",
            fontSize: "100px",
            fontWeight: 700,
          }}
          color="rgb(255, 255, 255)"
          spread={5}
          density={5}
          animation={{
            vaporizeDuration: 1.2,
            fadeInDuration: 0.5,
            waitDuration: 0,
          }}
          direction="left-to-right"
          alignment="center"
          tag={Tag.H1}
        />
      </div>
    </motion.div>
  );
}
