import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const stageConfig = [
  { name: "Uploading", icon: "📁", threshold: 10, color: "from-blue-400 to-blue-600" },
  { name: "Deep Learning", icon: "🧠", threshold: 40, color: "from-purple-500 to-purple-700" },
  { name: "Forensic Analysis", icon: "🔬", threshold: 70, color: "from-pink-500 to-red-600" },
  { name: "Final Decision", icon: "✅", threshold: 100, color: "from-green-500 to-emerald-600" }
];

const RealTimeAnalysis = ({ file, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("Initializing...");
  const [confidence, setConfidence] = useState(0);
  const [status, setStatus] = useState("running"); // running | success | error
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    if (!file) return;

    const analyzeFile = async () => {
      try {
        setStage("Uploading file...");
        setProgress(5);

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("http://localhost:8000/api/analyze", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        });

        const data = await response.json();

        if (data.session_id) {
          setSessionId(data.session_id);
          const eventSource = new EventSource(
            `http://localhost:8000/api/progress/${data.session_id}`
          );

          eventSource.onmessage = (event) => {
            try {
              const progressData = JSON.parse(event.data);
              setProgress(progressData.progress || 0);
              setStage(progressData.message || "Processing...");
              setConfidence(progressData.confidence || 0);

              if (progressData.progress >= 100) {
                eventSource.close();
                setStatus("success");
                setTimeout(() => onComplete(data), 800);
              }
            } catch (err) {
              console.error("Progress parse error:", err);
            }
          };

          eventSource.onerror = () => {
            setStatus("error");
            eventSource.close();
          };
        } else {
          setProgress(100);
          setStage("Analysis complete!");
          setStatus("success");
          setTimeout(() => onComplete(data), 500);
        }
      } catch (error) {
        console.error("Analysis error:", error);
        setStage("Error occurred");
        setStatus("error");
      }
    };

    analyzeFile();
  }, [file, onComplete]);

  const currentStage = stageConfig.find(
    (s) => progress <= s.threshold
  ) || stageConfig[stageConfig.length - 1];

  return (
    <div className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            AI Deepfake Analysis
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{stage}</p>
        </div>
        <div className="text-right">
          <span
            className={`text-xl font-bold ${
              status === "error"
                ? "text-red-500"
                : status === "success"
                ? "text-green-600"
                : "text-blue-600"
            }`}
          >
            {progress}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`absolute top-0 left-0 h-full bg-gradient-to-r ${currentStage.color} rounded-full`}
        />
        <div className="absolute inset-0 bg-white opacity-10 animate-pulse" />
      </div>

      {/* Confidence Gauge */}
      <div className="flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 150 }}
          className="relative w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 shadow-inner"
        >
          <motion.div
            className="absolute inset-1 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600"
            style={{ clipPath: `inset(${100 - confidence}% 0 0 0)` }}
          ></motion.div>
          <span className="absolute text-lg font-semibold text-gray-800 dark:text-gray-100">
            {confidence.toFixed(1)}%
          </span>
          <span className="absolute -bottom-7 text-xs text-gray-500 dark:text-gray-400">
            Confidence
          </span>
        </motion.div>
      </div>

      {/* Stages */}
      <div className="grid grid-cols-4 gap-3 mt-6">
        {stageConfig.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: progress >= item.threshold ? 1 : 0.5,
              scale: progress >= item.threshold ? 1 : 0.9,
            }}
            transition={{ duration: 0.4 }}
            className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
              progress >= item.threshold
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
            }`}
          >
            <div className="text-2xl mb-1">{item.icon}</div>
            <span
              className={`text-xs font-medium text-center ${
                progress >= item.threshold
                  ? "text-green-700 dark:text-green-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {item.name}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Status */}
      <AnimatePresence>
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex justify-center mt-6"
          >
            <div className="px-4 py-2 rounded-full bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 font-semibold">
              ✅ Analysis Complete — Authenticity Report Ready
            </div>
          </motion.div>
        )}
        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex justify-center mt-6"
          >
            <div className="px-4 py-2 rounded-full bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-100 font-semibold">
              ⚠️ Error: Failed to analyze image
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RealTimeAnalysis;
