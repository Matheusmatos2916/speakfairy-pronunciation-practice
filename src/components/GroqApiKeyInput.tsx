
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { usePractice } from "@/context/PracticeContext";
import { LucideKeyRound } from "lucide-react";

const GroqApiKeyInput: React.FC = () => {
  const { groqApiKey, setGroqApiKey } = usePractice();
  const [inputKey, setInputKey] = useState(groqApiKey);
  const [showKey, setShowKey] = useState(false);

  const handleSaveKey = () => {
    setGroqApiKey(inputKey);
    toast.success("Groq API key saved. You can now use AI-generated phrases and feedback!");
  };

  if (groqApiKey) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <LucideKeyRound className="h-4 w-4 mr-2" />
            Groq API Key
          </CardTitle>
          <CardDescription>Groq API key is configured</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input 
              type={showKey ? "text" : "password"} 
              value={groqApiKey} 
              disabled 
              className="flex-1" 
            />
            <Button variant="outline" onClick={() => setShowKey(!showKey)}>
              {showKey ? "Hide" : "Show"}
            </Button>
            <Button variant="destructive" onClick={() => setGroqApiKey("")}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <LucideKeyRound className="h-4 w-4 mr-2" />
          Set Groq API Key
        </CardTitle>
        <CardDescription>
          Add your Groq API key to enable AI-generated phrases and feedback
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Input 
            type={showKey ? "text" : "password"} 
            placeholder="Enter your Groq API key"
            value={inputKey} 
            onChange={(e) => setInputKey(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline" onClick={() => setShowKey(!showKey)}>
            {showKey ? "Hide" : "Show"}
          </Button>
          <Button variant="default" onClick={handleSaveKey} disabled={!inputKey}>
            Save
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          You can get a Groq API key by signing up at{" "}
          <a 
            href="https://console.groq.com/keys" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-fairy-500 hover:underline"
          >
            console.groq.com
          </a>
        </p>
      </CardContent>
    </Card>
  );
};

export default GroqApiKeyInput;
