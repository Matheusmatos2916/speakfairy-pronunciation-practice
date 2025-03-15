
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { PracticePhrase, PracticeResult, UserProgress, languages } from "@/types";

interface PracticeContextType {
  practiceLanguage: string;
  feedbackLanguage: string;
  currentPhrase: PracticePhrase | null;
  practiceHistory: PracticeResult[];
  userProgress: UserProgress;
  isRecording: boolean;
  isProcessing: boolean;
  spokenText: string;
  setPracticeLanguage: (code: string) => void;
  setFeedbackLanguage: (code: string) => void;
  generateNewPhrase: () => Promise<void>;
  startRecording: () => void;
  stopRecording: () => void;
  clearHistory: () => void;
}

const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

// Mock phrases for different languages (in a real app, these would come from an API)
const mockPhrases: Record<string, string[]> = {
  "pt-BR": [
    "O sol está brilhando hoje.",
    "Eu gosto de aprender novos idiomas.",
    "A comida brasileira é muito saborosa.",
    "O Brasil é um país maravilhoso.",
    "Vamos praticar português juntos?"
  ],
  "en-US": [
    "The sun is shining today.",
    "I like learning new languages.",
    "The weather is really nice outside.",
    "How are you doing today?",
    "Let's practice English together."
  ],
  "es-ES": [
    "El sol está brillando hoy.",
    "Me gusta aprender nuevos idiomas.",
    "La comida española es muy sabrosa.",
    "España es un país maravilloso.",
    "¿Vamos a practicar español juntos?"
  ],
  "fr-FR": [
    "Le soleil brille aujourd'hui.",
    "J'aime apprendre de nouvelles langues.",
    "La cuisine française est très savoureuse.",
    "La France est un pays merveilleux.",
    "Pratiquons le français ensemble."
  ],
  "it-IT": [
    "Il sole splende oggi.",
    "Mi piace imparare nuove lingue.",
    "La cucina italiana è molto gustosa.",
    "L'Italia è un paese meraviglioso.",
    "Pratichiamo l'italiano insieme."
  ],
  "de-DE": [
    "Die Sonne scheint heute.",
    "Ich lerne gerne neue Sprachen.",
    "Das deutsche Essen ist sehr lecker.",
    "Deutschland ist ein wunderbares Land.",
    "Lass uns zusammen Deutsch üben."
  ]
};

// Mock feedback generator
const generateMockFeedback = (
  similarity: number, 
  language: string,
  phrase: string,
  spoken: string
): string => {
  if (similarity > 90) {
    if (language === "pt-BR") return "Excelente pronúncia! Continue assim.";
    return "Excellent pronunciation! Keep it up.";
  } else if (similarity > 70) {
    if (language === "pt-BR") return "Boa pronúncia, mas pode melhorar com mais prática.";
    return "Good pronunciation, but it can be improved with more practice.";
  } else {
    if (language === "pt-BR") return "Tente novamente focando na pronúncia clara de cada palavra.";
    return "Try again focusing on clear pronunciation of each word.";
  }
};

export const PracticeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [practiceLanguage, setPracticeLanguage] = useState("en-US");
  const [feedbackLanguage, setFeedbackLanguage] = useState("en-US");
  const [currentPhrase, setCurrentPhrase] = useState<PracticePhrase | null>(null);
  const [practiceHistory, setPracticeHistory] = useState<PracticeResult[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  
  // User progress state
  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    streak: 0,
    practiced: 0
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("practiceHistory");
    if (savedHistory) {
      setPracticeHistory(JSON.parse(savedHistory));
    }
    
    const savedProgress = localStorage.getItem("userProgress");
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
    
    const savedPracticeLanguage = localStorage.getItem("practiceLanguage");
    if (savedPracticeLanguage) {
      setPracticeLanguage(savedPracticeLanguage);
    }
    
    const savedFeedbackLanguage = localStorage.getItem("feedbackLanguage");
    if (savedFeedbackLanguage) {
      setFeedbackLanguage(savedFeedbackLanguage);
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem("practiceHistory", JSON.stringify(practiceHistory));
  }, [practiceHistory]);
  
  useEffect(() => {
    localStorage.setItem("userProgress", JSON.stringify(userProgress));
  }, [userProgress]);
  
  useEffect(() => {
    localStorage.setItem("practiceLanguage", practiceLanguage);
  }, [practiceLanguage]);
  
  useEffect(() => {
    localStorage.setItem("feedbackLanguage", feedbackLanguage);
  }, [feedbackLanguage]);

  // Generate a new phrase
  const generateNewPhrase = async () => {
    // In a real app, this would make an API call
    try {
      // Get a random phrase from the mock data
      const phrases = mockPhrases[practiceLanguage] || mockPhrases["en-US"];
      const randomIndex = Math.floor(Math.random() * phrases.length);
      
      setCurrentPhrase({
        text: phrases[randomIndex],
        language: practiceLanguage
      });
    } catch (error) {
      console.error("Error generating phrase:", error);
      toast.error("Failed to generate a new phrase. Please try again.");
    }
  };
  
  // Initialize with a phrase if none exists
  useEffect(() => {
    if (!currentPhrase) {
      generateNewPhrase();
    }
  }, [currentPhrase, practiceLanguage]);

  // Record user's speech
  const startRecording = () => {
    if (!currentPhrase) return;
    
    setIsRecording(true);
    setSpokenText("");
    
    // In a real app, this would start actual recording
    toast.info("Recording started... Speak now!");
    
    // Simulate recording delay
    setTimeout(() => {
      stopRecording();
    }, 5000); // Auto-stop after 5 seconds
  };

  const stopRecording = () => {
    if (!isRecording) return;
    
    setIsRecording(false);
    setIsProcessing(true);
    
    // In a real app, this would process the actual recording
    
    // Mock the speech recognition result
    setTimeout(() => {
      processMockRecording();
    }, 1500);
  };
  
  const processMockRecording = () => {
    if (!currentPhrase) return;
    
    // Generate a mock spoken text (in a real app, this would be from speech recognition)
    let mockSpoken = currentPhrase.text;
    
    // Add some random errors to simulate speech recognition
    if (Math.random() > 0.7) {
      const words = mockSpoken.split(" ");
      const randomIndex = Math.floor(Math.random() * words.length);
      words[randomIndex] = words[randomIndex].slice(1); // Remove first letter
      mockSpoken = words.join(" ");
    }
    
    setSpokenText(mockSpoken);
    
    // Calculate similarity (simplified for demonstration)
    const similarity = calculateSimilarity(currentPhrase.text, mockSpoken);
    
    // Generate feedback
    const feedback = generateMockFeedback(similarity, feedbackLanguage, currentPhrase.text, mockSpoken);
    
    // Create result
    const result: PracticeResult = {
      phrase: currentPhrase.text,
      spoken: mockSpoken,
      similarity,
      feedback,
      timestamp: new Date().toISOString()
    };
    
    // Add to history
    setPracticeHistory(prev => [result, ...prev.slice(0, 19)]); // Keep max 20 items
    
    // Update progress
    updateProgress(similarity);
    
    setIsProcessing(false);
    
    // Show feedback
    if (similarity > 90) {
      toast.success("Great job! Your pronunciation was excellent!");
    } else if (similarity > 70) {
      toast.info("Good effort! Keep practicing to improve.");
    } else {
      toast.warning("Let's try that again. Focus on clear pronunciation.");
    }
  };
  
  // Calculate similarity between two strings (simplified)
  const calculateSimilarity = (original: string, spoken: string): number => {
    if (!original || !spoken) return 0;
    
    const originalWords = original.toLowerCase().split(/\s+/);
    const spokenWords = spoken.toLowerCase().split(/\s+/);
    
    let matches = 0;
    for (const word of spokenWords) {
      if (originalWords.includes(word)) {
        matches++;
      }
    }
    
    return Math.min(100, Math.round((matches / Math.max(originalWords.length, spokenWords.length)) * 100));
  };
  
  // Update user progress based on practice results
  const updateProgress = (similarity: number) => {
    const xpGained = similarity >= 90 ? 20 : similarity >= 70 ? 10 : 5;
    
    setUserProgress(prev => {
      const newXp = prev.xp + xpGained;
      let newLevel = prev.level;
      let newXpToNextLevel = prev.xpToNextLevel;
      
      // Level up if enough XP
      if (newXp >= prev.xpToNextLevel) {
        newLevel += 1;
        newXpToNextLevel = Math.round(prev.xpToNextLevel * 1.5);
        toast.success(`🎉 Level up! You're now level ${newLevel}!`);
      }
      
      return {
        level: newLevel,
        xp: newXp % prev.xpToNextLevel,
        xpToNextLevel: newXpToNextLevel,
        streak: prev.streak,
        practiced: prev.practiced + 1
      };
    });
  };
  
  const clearHistory = () => {
    setPracticeHistory([]);
  };

  return (
    <PracticeContext.Provider
      value={{
        practiceLanguage,
        feedbackLanguage,
        currentPhrase,
        practiceHistory,
        userProgress,
        isRecording,
        isProcessing,
        spokenText,
        setPracticeLanguage,
        setFeedbackLanguage,
        generateNewPhrase,
        startRecording,
        stopRecording,
        clearHistory
      }}
    >
      {children}
    </PracticeContext.Provider>
  );
};

export const usePractice = () => {
  const context = useContext(PracticeContext);
  if (context === undefined) {
    throw new Error("usePractice must be used within a PracticeProvider");
  }
  return context;
};
