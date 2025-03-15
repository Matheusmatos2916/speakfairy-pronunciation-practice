
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageOption, languages } from "@/types";

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (code: string) => void;
  title: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  title
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {languages.map((lang) => (
          <Card
            key={lang.code}
            className={`language-card ${
              selectedLanguage === lang.code ? "selected" : ""
            }`}
            onClick={() => onLanguageChange(lang.code)}
          >
            <CardContent className="p-3 flex flex-col items-center">
              <div className="text-3xl mb-1">{lang.flag}</div>
              <div className="text-sm font-medium">{lang.name}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
