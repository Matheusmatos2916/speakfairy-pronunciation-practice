
import React from "react";
import { MicVocal } from "lucide-react";

const AppHeader: React.FC = () => {
  return (
    <header className="flex items-center justify-center py-6">
      <div className="flex items-center">
        <div className="bg-fairy-500 p-2 rounded-lg mr-3">
          <MicVocal className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            <span className="text-fairy-700">Speak</span>
            <span className="text-speak-500">Fairy</span>
          </h1>
          <p className="text-xs text-muted-foreground">Pronunciation Practice</p>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
