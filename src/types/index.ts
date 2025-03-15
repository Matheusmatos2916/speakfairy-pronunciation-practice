
export interface PracticePhrase {
  text: string;
  language: string;
}

export interface PracticeResult {
  phrase: string;
  spoken: string;
  similarity: number;
  feedback: string;
  timestamp: string;
}

export interface LanguageOption {
  name: string;
  code: string;
  flag: string;
}

export const languages: LanguageOption[] = [
  { name: "Português", code: "pt-BR", flag: "🇧🇷" },
  { name: "English", code: "en-US", flag: "🇺🇸" },
  { name: "Español", code: "es-ES", flag: "🇪🇸" },
  { name: "Français", code: "fr-FR", flag: "🇫🇷" },
  { name: "Italiano", code: "it-IT", flag: "🇮🇹" },
  { name: "Deutsch", code: "de-DE", flag: "🇩🇪" }
];

export interface UserProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  practiced: number;
}
