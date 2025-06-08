
import React from "react";
import { Brain } from "lucide-react";

const AppHeader: React.FC = () => {
  return (
    <header className="flex items-center justify-center py-6">
      <div className="flex items-center">
        <div className="bg-fairy-500 p-2 rounded-lg mr-3">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            <span className="text-fairy-700">Pronun</span>
            <span className="text-speak-500">AI</span>
          </h1>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
