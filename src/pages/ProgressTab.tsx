
import React from "react";
import UserProgressCard from "@/components/UserProgressCard";
import HistoryAccordion from "@/components/HistoryAccordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePractice } from "@/context/PracticeContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ProgressTab: React.FC = () => {
  const { practiceHistory } = usePractice();
  
  // Create data for charts based on practice history
  const chartData = React.useMemo(() => {
    const recentHistory = [...practiceHistory].reverse().slice(0, 10);
    return recentHistory.map((entry, index) => ({
      id: index + 1,
      accuracy: entry.similarity,
    }));
  }, [practiceHistory]);
  
  // Calculate statistics
  const stats = React.useMemo(() => {
    if (practiceHistory.length === 0) {
      return {
        totalPracticed: 0,
        averageAccuracy: 0,
        bestAccuracy: 0,
      };
    }
    
    const accuracies = practiceHistory.map(entry => entry.similarity);
    const averageAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    const bestAccuracy = Math.max(...accuracies);
    
    return {
      totalPracticed: practiceHistory.length,
      averageAccuracy: Math.round(averageAccuracy),
      bestAccuracy: Math.round(bestAccuracy),
    };
  }, [practiceHistory]);

  return (
    <div>
      <UserProgressCard />
      
      <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
      
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-fairy-600">{stats.totalPracticed}</p>
            <p className="text-xs text-muted-foreground">Practices</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-speak-600">{stats.averageAccuracy}%</p>
            <p className="text-xs text-muted-foreground">Avg. Accuracy</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.bestAccuracy}%</p>
            <p className="text-xs text-muted-foreground">Best Score</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="chart">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chart">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-lg">Accuracy Trend</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {chartData.length > 1 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="id" label={{ value: 'Practice #', position: 'insideBottom', offset: -5 }} />
                      <YAxis domain={[0, 100]} label={{ value: 'Accuracy %', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Accuracy']} />
                      <Line 
                        type="monotone" 
                        dataKey="accuracy" 
                        stroke="#0ea5e9" 
                        strokeWidth={2} 
                        dot={{ r: 4 }} 
                        activeDot={{ r: 6 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Practice more to see your progress chart!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <HistoryAccordion />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressTab;
