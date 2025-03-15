
import React from "react";
import { PracticeProvider } from "@/context/PracticeContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppHeader from "@/components/AppHeader";
import PracticeTab from "@/pages/PracticeTab";
import SettingsTab from "@/pages/SettingsTab";
import ProgressTab from "@/pages/ProgressTab";

const Index = () => {
  return (
    <PracticeProvider>
      <div className="container px-4 max-w-md mx-auto pb-20">
        <AppHeader />
        
        <Tabs defaultValue="practice" className="mt-6">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="practice">Practice</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="practice" className="mt-0">
            <PracticeTab />
          </TabsContent>
          
          <TabsContent value="progress" className="mt-0">
            <ProgressTab />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-0">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </PracticeProvider>
  );
};

export default Index;
