
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { usePractice } from "@/context/PracticeContext";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle, XCircle } from "lucide-react";

const HistoryAccordion: React.FC = () => {
  const { practiceHistory, clearHistory } = usePractice();

  if (practiceHistory.length === 0) {
    return (
      <div className="mt-6 text-center text-muted-foreground">
        <p>No practice history yet. Start practicing to see your results here!</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Practice History</h3>
        <button
          onClick={clearHistory}
          className="text-sm text-red-500 hover:text-red-600"
        >
          Clear History
        </button>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {practiceHistory.map((result, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex justify-between items-center w-full pr-4">
                <div className="flex items-center">
                  {result.similarity >= 70 ? (
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2 text-red-500" />
                  )}
                  <span className="text-sm font-medium truncate max-w-[180px]">
                    {result.phrase}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-muted-foreground mr-2">
                    {formatDistanceToNow(new Date(result.timestamp), { addSuffix: true })}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      result.similarity >= 90
                        ? "bg-green-100 text-green-800"
                        : result.similarity >= 70
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {result.similarity}%
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="p-4 text-sm">
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <p className="font-medium">Original Phrase:</p>
                      <p>{result.phrase}</p>
                    </div>
                    <div>
                      <p className="font-medium">Your Pronunciation:</p>
                      <p>{result.spoken}</p>
                    </div>
                    <div>
                      <p className="font-medium">Feedback:</p>
                      <p>{result.feedback}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default HistoryAccordion;
