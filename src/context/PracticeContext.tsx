
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { PracticePhrase, PracticeResult, UserProgress, languages, languageMapping } from "@/types";

interface PracticeContextType {
  practiceLanguage: string;
  feedbackLanguage: string;
  currentPhrase: PracticePhrase | null;
  practiceHistory: PracticeResult[];
  userProgress: UserProgress;
  isRecording: boolean;
  isProcessing: boolean;
  spokenText: string;
  groqApiKey: string;
  setGroqApiKey: (key: string) => void;
  setPracticeLanguage: (code: string) => void;
  setFeedbackLanguage: (code: string) => void;
  generateNewPhrase: () => Promise<void>;
  startRecording: () => void;
  stopRecording: () => void;
  clearHistory: () => void;
}

const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

// Mock phrases in case API fails
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

// Groq API for generating phrases and feedback
const generateGroqPhrase = async (language: string, apiKey: string): Promise<string> => {
  try {
    const languageName = languageMapping[language] || 'português';
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `Forneça uma frase curta em ${languageName} para treinar pronúncia.
            A frase deve ter entre 5 e 10 palavras.
            Responda APENAS com a frase em ${languageName}, sem explicações.
            É MUITO IMPORTANTE que a frase seja apenas em ${languageName} e não em qualquer outro idioma.`
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating phrase with Groq:", error);
    throw error;
  }
};

// Generate feedback using Groq
const generateGroqFeedback = async (
  similarity: number,
  incorrectWords: string[],
  originalPhrase: string,
  spokenPhrase: string,
  feedbackLanguage: string,
  apiKey: string
): Promise<string> => {
  try {
    const feedbackLang = languageMapping[feedbackLanguage] || 'inglês';
    const incorrectWordsText = incorrectWords.length > 0 ? incorrectWords.join(", ") : "None";
    
    const promptTemplate = `
    Analise a pronúncia do usuário e forneça feedback específico:
    
    Frase original: "${originalPhrase}"
    Frase falada: "${spokenPhrase}"
    Similaridade: ${similarity.toFixed(2)}%
    Palavras possivelmente problemáticas: ${incorrectWordsText}
    
    Ofereça dicas específicas para melhorar a pronúncia, focando nos erros mais comuns.
    Seja breve e construtivo, máximo de 3 linhas.
    Importante: Forneça o feedback em ${feedbackLang}.
    `;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: promptTemplate
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating feedback with Groq:", error);
    throw error;
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
  const [groqApiKey, setGroqApiKey] = useState("");
  
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
    
    const savedGroqApiKey = localStorage.getItem("groqApiKey");
    if (savedGroqApiKey) {
      setGroqApiKey(savedGroqApiKey);
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
  
  useEffect(() => {
    if (groqApiKey) {
      localStorage.setItem("groqApiKey", groqApiKey);
    }
  }, [groqApiKey]);

  // Generate a new phrase using Groq if API key is available, otherwise use mock phrases
  const generateNewPhrase = async () => {
    try {
      setIsProcessing(true);
      let phrase: string;
      
      if (groqApiKey) {
        // Try to use Groq API
        try {
          phrase = await generateGroqPhrase(practiceLanguage, groqApiKey);
        } catch (error) {
          console.error("Error with Groq API, falling back to mock phrases:", error);
          toast.error("Failed to generate phrase with AI, using backup phrases.");
          // Fallback to mock data if API fails
          const phrases = mockPhrases[practiceLanguage] || mockPhrases["en-US"];
          const randomIndex = Math.floor(Math.random() * phrases.length);
          phrase = phrases[randomIndex];
        }
      } else {
        // Use mock data if no API key
        const phrases = mockPhrases[practiceLanguage] || mockPhrases["en-US"];
        const randomIndex = Math.floor(Math.random() * phrases.length);
        phrase = phrases[randomIndex];
      }
      
      setCurrentPhrase({
        text: phrase,
        language: practiceLanguage
      });
      
      setIsProcessing(false);
    } catch (error) {
      console.error("Error generating phrase:", error);
      toast.error("Failed to generate a new phrase. Please try again.");
      setIsProcessing(false);
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
    
    // Find incorrect words
    const incorrectWords = findIncorrectWords(currentPhrase.text, mockSpoken);
    
    // Generate feedback
    generateFeedback(similarity, incorrectWords, currentPhrase.text, mockSpoken);
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
  
  // Find incorrect words
  const findIncorrectWords = (original: string, spoken: string): string[] => {
    if (!original || !spoken) return [];
    
    const originalWords = original.toLowerCase().split(/\s+/);
    const spokenWords = spoken.toLowerCase().split(/\s+/);
    
    const incorrectWords: string[] = [];
    for (const word of originalWords) {
      if (!spokenWords.includes(word)) {
        incorrectWords.push(word);
      }
    }
    
    return incorrectWords;
  };
  
  // Generate feedback using Groq if available, otherwise use a simple algorithm
  const generateFeedback = async (
    similarity: number, 
    incorrectWords: string[],
    originalPhrase: string,
    spokenPhrase: string
  ) => {
    let feedback: string;
    
    try {
      if (groqApiKey) {
        // Try to use Groq API for feedback
        feedback = await generateGroqFeedback(
          similarity, 
          incorrectWords, 
          originalPhrase,
          spokenPhrase,
          feedbackLanguage,
          groqApiKey
        );
      } else {
        // Fallback to simple feedback
        if (similarity > 90) {
          feedback = feedbackLanguage === "pt-BR" 
            ? "Excelente pronúncia! Continue assim." 
            : "Excellent pronunciation! Keep it up.";
        } else if (similarity > 70) {
          feedback = feedbackLanguage === "pt-BR"
            ? `Boa pronúncia, mas pode melhorar. Preste atenção em: ${incorrectWords.join(', ')}`
            : `Good pronunciation, but it can be improved. Pay attention to: ${incorrectWords.join(', ')}`;
        } else {
          feedback = feedbackLanguage === "pt-BR"
            ? "Tente novamente focando na pronúncia clara de cada palavra."
            : "Try again focusing on clear pronunciation of each word.";
        }
      }
      
      // Create result
      const result: PracticeResult = {
        phrase: originalPhrase,
        spoken: spokenPhrase,
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
    } catch (error) {
      console.error("Error generating feedback:", error);
      
      // Fallback feedback
      const fallbackFeedback = similarity > 70 
        ? "Good pronunciation! Keep practicing." 
        : "Try again and focus on clear pronunciation.";
        
      // Create result with fallback feedback
      const result: PracticeResult = {
        phrase: originalPhrase,
        spoken: spokenPhrase,
        similarity,
        feedback: fallbackFeedback,
        timestamp: new Date().toISOString()
      };
      
      // Add to history
      setPracticeHistory(prev => [result, ...prev.slice(0, 19)]);
      
      // Update progress
      updateProgress(similarity);
      
      setIsProcessing(false);
      
      toast.error("Error generating detailed feedback. Using simplified feedback.");
    }
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
        groqApiKey,
        setGroqApiKey,
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
