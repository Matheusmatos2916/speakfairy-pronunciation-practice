
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Star, Award } from "lucide-react";
import { usePractice } from "@/context/PracticeContext";

const UserProgressCard: React.FC = () => {
  const { userProgress } = usePractice();
  const { level, xp, xpToNextLevel, streak, practiced } = userProgress;
  
  const progressPercent = Math.round((xp / xpToNextLevel) * 100);
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-speak-500" />
            Level {level}
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            {xp}/{xpToNextLevel} XP
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={progressPercent} className="h-2 mb-4" />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-fairy-100 flex items-center justify-center mr-3">
              <Flame className="h-5 w-5 text-speak-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Streak</p>
              <p className="font-semibold">{streak} days</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-fairy-100 flex items-center justify-center mr-3">
              <Star className="h-5 w-5 text-speak-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Practiced</p>
              <p className="font-semibold">{practiced} times</p>
            </div>
          </div>
        </div>
        
        {level >= 5 && (
          <div className="mt-4 p-3 bg-amber-50 rounded-md flex items-center">
            <Award className="h-5 w-5 text-amber-500 mr-2" />
            <p className="text-sm text-amber-800">
              Achieved "Consistent Learner" badge!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserProgressCard;
