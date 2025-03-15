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
  
  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    streak: 0,
    practiced: 0
  });

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

  const generateNewPhrase = async () => {
    try {
      setIsProcessing(true);
      let phrase: string;
      
      if (groqApiKey) {
        try {
          phrase = await generateGroqPhrase(practiceLanguage, groqApiKey);
        } catch (error) {
          console.error("Error with Groq API, falling back to mock phrases:", error);
          toast.error("Failed to generate phrase with AI, using backup phrases.");
          const phrases = mockPhrases[practiceLanguage] || mockPhrases["en-US"];
          const randomIndex = Math.floor(Math.random() * phrases.length);
          phrase = phrases[randomIndex];
        }
      } else {
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
  
  useEffect(() => {
    if (!currentPhrase) {
      generateNewPhrase();
    }
  }, [currentPhrase, practiceLanguage]);

  const startRecording = () => {
    if (!currentPhrase) return;
    
    setIsRecording(true);
    setSpokenText("");
    
    toast.info("Recording started... Speak now!");
    
    setTimeout(() => {
      stopRecording();
    }, 5000);
  };

  const stopRecording = () => {
    if (!isRecording) return;
    
    setIsRecording(false);
    setIsProcessing(true);
    
    setTimeout(() => {
      processMockRecording();
    }, 1500);
  };
  
  const processMockRecording = () => {
    if (!currentPhrase) return;
    
    let mockSpoken = currentPhrase.text;
    
    if (Math.random() > 0.7) {
      const words = mockSpoken.split(" ");
      const randomIndex = Math.floor(Math.random() * words.length);
      words[randomIndex] = words[randomIndex].slice(1);
      mockSpoken = words.join(" ");
    }
    
    setSpokenText(mockSpoken);
    
    const similarity = calculateSimilarity(currentPhrase.text, mockSpoken);
    const incorrectWords = findIncorrectWords(currentPhrase.text, mockSpoken);
    
    generateFeedback(similarity, incorrectWords, currentPhrase.text, mockSpoken);
  };
  
  // Improved similarity calculation using the Levenshtein distance algorithm
  const calculateSimilarity = (original: string, spoken: string): number => {
    if (!original || !spoken) return 0;
    
    // Normalize texts
    const normalizeText = (text: string) => 
      text.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    
    const originalNorm = normalizeText(original);
    const spokenNorm = normalizeText(spoken);
    
    // Calculate Levenshtein distance
    const levenshteinDistance = (str1: string, str2: string): number => {
      const track = Array(str2.length + 1).fill(null).map(() => 
        Array(str1.length + 1).fill(null));
      
      for (let i = 0; i <= str1.length; i += 1) {
        track[0][i] = i;
      }
      
      for (let j = 0; j <= str2.length; j += 1) {
        track[j][0] = j;
      }
      
      for (let j = 1; j <= str2.length; j += 1) {
        for (let i = 1; i <= str1.length; i += 1) {
          const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
          track[j][i] = Math.min(
            track[j][i - 1] + 1, // deletion
            track[j - 1][i] + 1, // insertion
            track[j - 1][i - 1] + indicator, // substitution
          );
        }
      }
      
      return track[str2.length][str1.length];
    };
    
    // Word-by-word matching (existing approach)
    const originalWords = originalNorm.split(/\s+/);
    const spokenWords = spokenNorm.split(/\s+/);
    
    let matches = 0;
    for (const word of spokenWords) {
      if (originalWords.includes(word)) {
        matches++;
      }
    }
    
    const wordMatchScore = Math.min(100, Math.round((matches / Math.max(originalWords.length, spokenWords.length)) * 100));
    
    // Levenshtein-based similarity
    const maxLen = Math.max(originalNorm.length, spokenNorm.length);
    const distance = levenshteinDistance(originalNorm, spokenNorm);
    const levenshteinScore = Math.round(((maxLen - distance) / maxLen) * 100);
    
    // Combine both approaches for a more balanced score
    const finalScore = Math.round((wordMatchScore * 0.6) + (levenshteinScore * 0.4));
    return Math.min(100, finalScore);
  };
  
  const findIncorrectWords = (original: string, spoken: string): string[] => {
    if (!original || !spoken) return [];
    
    // Improved word comparison with fuzzy matching
    const normalizeWord = (word: string) => 
      word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    
    const originalWords = original.split(/\s+/).map(normalizeWord);
    const spokenWords = spoken.split(/\s+/).map(normalizeWord);
    
    // Find words that are not exact matches but might be similar
    const incorrectWords: string[] = [];
    const similarityThreshold = 0.7; // Words with 70% similarity or more are considered close enough
    
    for (const originalWord of originalWords) {
      // Skip very short words (e.g. "a", "the")
      if (originalWord.length <= 2) continue;
      
      let bestMatch = 0;
      for (const spokenWord of spokenWords) {
        // Skip very short words
        if (spokenWord.length <= 2) continue;
        
        // Calculate similarity between the two words
        const maxLen = Math.max(originalWord.length, spokenWord.length);
        let matches = 0;
        
        // Check character matches
        for (let i = 0; i < Math.min(originalWord.length, spokenWord.length); i++) {
          if (originalWord[i] === spokenWord[i]) {
            matches++;
          }
        }
        
        const wordSimilarity = matches / maxLen;
        bestMatch = Math.max(bestMatch, wordSimilarity);
      }
      
      // If the best match is below threshold, mark as incorrect
      if (bestMatch < similarityThreshold) {
        incorrectWords.push(originalWord);
      }
    }
    
    return incorrectWords;
  };
  
  const generateFeedback = async (
    similarity: number, 
    incorrectWords: string[],
    originalPhrase: string,
    spokenPhrase: string
  ) => {
    let feedback: string;
    
    try {
      if (groqApiKey) {
        feedback = await generateGroqFeedback(
          similarity, 
          incorrectWords, 
          originalPhrase,
          spokenPhrase,
          feedbackLanguage,
          groqApiKey
        );
      } else {
        if (similarity > 90) {
          feedback = feedbackLanguage === "pt-BR" 
            ? "Excelente pronúncia! Continue assim." 
            : feedbackLanguage === "es-ES"
              ? "¡Excelente pronunciación! Sigue así."
              : feedbackLanguage === "fr-FR"
                ? "Excellente prononciation ! Continuez comme ça."
                : feedbackLanguage === "it-IT"
                  ? "Pronuncia eccellente! Continua così."
                  : feedbackLanguage === "de-DE"
                    ? "Ausgezeichnete Aussprache! Weiter so."
                    : "Excellent pronunciation! Keep it up.";
        } else if (similarity > 70) {
          const wordList = incorrectWords.join(', ');
          feedback = feedbackLanguage === "pt-BR"
            ? `Boa pronúncia, mas pode melhorar. Preste atenção em: ${wordList}`
            : feedbackLanguage === "es-ES"
              ? `Buena pronunciación, pero puede mejorar. Presta atención a: ${wordList}`
              : feedbackLanguage === "fr-FR"
                ? `Bonne prononciation, mais peut être améliorée. Faites attention à : ${wordList}`
                : feedbackLanguage === "it-IT"
                  ? `Buona pronuncia, ma può essere migliorata. Presta attenzione a: ${wordList}`
                  : feedbackLanguage === "de-DE"
                    ? `Gute Aussprache, aber es kann besser werden. Achte auf: ${wordList}`
                    : `Good pronunciation, but it can be improved. Pay attention to: ${wordList}`;
        } else {
          feedback = feedbackLanguage === "pt-BR"
            ? "Tente novamente focando na pronúncia clara de cada palavra."
            : feedbackLanguage === "es-ES"
              ? "Intenta de nuevo, enfocándote en la pronunciación clara de cada palabra."
              : feedbackLanguage === "fr-FR"
                ? "Essayez à nouveau en vous concentrant sur la prononciation claire de chaque mot."
                : feedbackLanguage === "it-IT"
                  ? "Prova di nuovo concentrandoti sulla pronuncia chiara di ogni parola."
                  : feedbackLanguage === "de-DE"
                    ? "Versuche es noch einmal und konzentriere dich auf die klare Aussprache jedes Wortes."
                    : "Try again focusing on clear pronunciation of each word.";
        }
      }
      
      const result: PracticeResult = {
        phrase: originalPhrase,
        spoken: spokenPhrase,
        similarity,
        feedback,
        timestamp: new Date().toISOString()
      };
      
      setPracticeHistory(prev => [result, ...prev.slice(0, 19)]);
      
      updateProgress(similarity);
      
      setIsProcessing(false);
      
      if (similarity > 90) {
        toast.success("Great job! Your pronunciation was excellent!");
      } else if (similarity > 70) {
        toast.info("Good effort! Keep practicing to improve.");
      } else {
        toast.warning("Let's try that again. Focus on clear pronunciation.");
      }
    } catch (error) {
      console.error("Error generating feedback:", error);
      
      const fallbackFeedback = similarity > 70 
        ? "Good pronunciation! Keep practicing." 
        : "Try again and focus on clear pronunciation.";
        
      const result: PracticeResult = {
        phrase: originalPhrase,
        spoken: spokenPhrase,
        similarity,
        feedback: fallbackFeedback,
        timestamp: new Date().toISOString()
      };
      
      setPracticeHistory(prev => [result, ...prev.slice(0, 19)]);
      
      updateProgress(similarity);
      
      setIsProcessing(false);
      
      toast.error("Error generating detailed feedback. Using simplified feedback.");
    }
  };
  
  const updateProgress = (similarity: number) => {
    const xpGained = similarity >= 90 ? 20 : similarity >= 70 ? 10 : 5;
    
    setUserProgress(prev => {
      const newXp = prev.xp + xpGained;
      let newLevel = prev.level;
      let newXpToNextLevel = prev.xpToNextLevel;
      
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
