
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { usePractice } from "@/context/PracticeContext";

const PhraseCard: React.FC = () => {
  const { currentPhrase, generateNewPhrase } = usePractice();

  if (!currentPhrase) {
    return (
      <Card className="phrase-card animate-pulse">
        <CardContent className="p-6 flex justify-center items-center">
          <p className="text-muted-foreground">Loading phrase...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="phrase-card">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Repeat this phrase:
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={generateNewPhrase}
            className="h-8 w-8"
            title="Generate new phrase"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-2xl font-medium text-center my-4">
          {currentPhrase.text}
        </p>
      </CardContent>
    </Card>
  );
};

export default PhraseCard;
