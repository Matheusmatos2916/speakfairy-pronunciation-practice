
import React from "react";
import PhraseCard from "@/components/PhraseCard";
import RecordingButton from "@/components/RecordingButton";
import PracticeResult from "@/components/PracticeResult";
import UserProgressCard from "@/components/UserProgressCard";
import { usePractice } from "@/context/PracticeContext";
import { languages } from "@/types";

const PracticeTab: React.FC = () => {
  const { practiceLanguage, isRecording, isProcessing } = usePractice();
  
  // Find the current language object
  const currentLanguage = languages.find(lang => lang.code === practiceLanguage);
  
  return (
    <div>
      <UserProgressCard />
      
      <div className="mb-4 flex items-center">
        <div className="text-2xl mr-2">{currentLanguage?.flag || "🌐"}</div>
        <h2 className="text-xl font-semibold">
          {currentLanguage?.name || "Language"} Practice
        </h2>
      </div>
      
      <PhraseCard />
      
      <div className="flex flex-col items-center justify-center my-8">
        <RecordingButton />
        <p className="mt-4 text-sm text-muted-foreground">
          {isRecording 
            ? "Recording... Tap to stop" 
            : isProcessing 
              ? "Processing your speech..." 
              : "Tap to start recording"}
        </p>
      </div>
      
      <PracticeResult />
    </div>
  );
};

export default PracticeTab;
