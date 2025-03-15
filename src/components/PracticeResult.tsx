
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, MessageCircle } from "lucide-react";
import { usePractice } from "@/context/PracticeContext";

const PracticeResult: React.FC = () => {
  const { spokenText, practiceHistory } = usePractice();
  
  // Get the most recent result if available
  const latestResult = practiceHistory.length > 0 ? practiceHistory[0] : null;
  
  if (!spokenText && !latestResult) {
    return null;
  }
  
  // Calculate a color based on similarity
  const getColorClass = (similarity: number) => {
    if (similarity >= 90) return "text-green-500";
    if (similarity >= 70) return "text-amber-500";
    return "text-red-500";
  };
  
  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center">
            <MessageCircle className="h-4 w-4 mr-1" />
            Your pronunciation:
          </h3>
          <p className="text-lg font-medium mt-1">{latestResult?.spoken || spokenText}</p>
        </div>
        
        {latestResult && (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Accuracy</span>
              <span className={`font-bold ${getColorClass(latestResult.similarity)}`}>
                {latestResult.similarity}%
              </span>
            </div>
            <Progress value={latestResult.similarity} className="h-2 mb-4" />
            
            <div className="p-3 bg-muted rounded-md">
              <h4 className="text-sm font-medium flex items-center mb-1">
                {latestResult.similarity >= 70 ? (
                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 mr-1 text-red-500" />
                )}
                Feedback:
              </h4>
              <p className="text-sm">{latestResult.feedback}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PracticeResult;
