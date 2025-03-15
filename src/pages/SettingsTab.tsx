
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import LanguageSelector from "@/components/LanguageSelector";
import GroqApiKeyInput from "@/components/GroqApiKeyInput";
import { usePractice } from "@/context/PracticeContext";

const SettingsTab: React.FC = () => {
  const { 
    practiceLanguage, 
    feedbackLanguage, 
    setPracticeLanguage,
    setFeedbackLanguage 
  } = usePractice();
  
  const [notifications, setNotifications] = React.useState(true);
  const [autoPlayAudio, setAutoPlayAudio] = React.useState(true);

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear all your practice data?")) {
      localStorage.clear();
      toast.success("All practice data has been cleared. Refresh the page to start fresh.");
    }
  };

  const handlePracticeLanguageChange = (code: string) => {
    setPracticeLanguage(code);
    toast.success(`Practice language changed to ${code.split('-')[0].toUpperCase()}`);
  };

  const handleFeedbackLanguageChange = (code: string) => {
    setFeedbackLanguage(code);
    toast.success(`Feedback language changed to ${code.split('-')[0].toUpperCase()}`);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Settings</h2>
      
      <GroqApiKeyInput />
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Language Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <LanguageSelector
            selectedLanguage={practiceLanguage}
            onLanguageChange={handlePracticeLanguageChange}
            title="Practice Language"
          />
          
          <LanguageSelector
            selectedLanguage={feedbackLanguage}
            onLanguageChange={handleFeedbackLanguageChange}
            title="Feedback Language" 
          />
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Application Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Daily Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Receive daily reminders to practice
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoplay">Auto-play Audio</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically play phrase audio
                </p>
              </div>
              <Switch
                id="autoplay"
                checked={autoPlayAudio}
                onCheckedChange={setAutoPlayAudio}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Clear your practice history and progress data.
          </p>
          <Button variant="destructive" onClick={handleClearData}>
            Clear All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
