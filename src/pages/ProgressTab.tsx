
import React from "react";
import UserProgressCard from "@/components/UserProgressCard";
import HistoryAccordion from "@/components/HistoryAccordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePractice } from "@/context/PracticeContext";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from "recharts";
import { languages } from "@/types";

const ProgressTab: React.FC = () => {
  const { practiceHistory } = usePractice();
  
  // Create data for timeline chart
  const timelineChartData = React.useMemo(() => {
    const recentHistory = [...practiceHistory].reverse().slice(0, 10);
    return recentHistory.map((entry, index) => ({
      id: index + 1,
      accuracy: entry.similarity,
    }));
  }, [practiceHistory]);
  
  // Create data for language distribution chart
  const languageChartData = React.useMemo(() => {
    if (practiceHistory.length === 0) return [];
    
    const languageCounts: Record<string, number> = {};
    
    practiceHistory.forEach(entry => {
      const langCode = entry.language || "unknown";
      languageCounts[langCode] = (languageCounts[langCode] || 0) + 1;
    });
    
    return Object.entries(languageCounts).map(([code, count]) => {
      const language = languages.find(lang => lang.code === code);
      return {
        name: language ? `${language.flag} ${language.name}` : "Unknown",
        value: count,
        code: code
      };
    });
  }, [practiceHistory]);
  
  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ef4444'];
  
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
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="chart">Accuracy Trend</TabsTrigger>
          <TabsTrigger value="languages">Languages</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chart">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-lg">Accuracy Trend</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {timelineChartData.length > 1 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineChartData}>
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
        
        <TabsContent value="languages">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-lg">Practice by Language</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {languageChartData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={languageChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={(entry) => `${entry.name}: ${entry.value}`}
                      >
                        {languageChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} practices`, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Practice more to see your language distribution!
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
