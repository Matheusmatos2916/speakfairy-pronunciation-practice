
import React, { useEffect, useState } from "react";
import { Mic, Square } from "lucide-react";
import { usePractice } from "@/context/PracticeContext";

const RecordingButton: React.FC = () => {
  const { isRecording, isProcessing, startRecording, stopRecording } = usePractice();
  const [animationClass, setAnimationClass] = useState("");

  useEffect(() => {
    if (isRecording) {
      setAnimationClass("scale-110 bg-red-500");
    } else if (isProcessing) {
      setAnimationClass("bg-amber-500");
    } else {
      setAnimationClass("bg-speak-500 hover:bg-speak-600");
    }
  }, [isRecording, isProcessing]);

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else if (!isProcessing) {
      startRecording();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isProcessing}
      className={`recording-button ${animationClass} transition-all duration-300 disabled:opacity-50`}
      aria-label={isRecording ? "Stop recording" : "Start recording"}
    >
      <div className="relative z-10">
        {isRecording ? (
          <Square className="h-8 w-8 text-white" />
        ) : (
          <Mic className="h-8 w-8 text-white" />
        )}
      </div>
      {isRecording && (
        <div className="absolute inset-0 rounded-full animate-pulse border-4 border-red-500"></div>
      )}
    </button>
  );
};

export default RecordingButton;
