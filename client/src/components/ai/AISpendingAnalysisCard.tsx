import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart, 
  BrainCircuit, 
  Download,
  Sparkles,
  AreaChart,
  RefreshCw,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  BarChart as RechartBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

interface SpendingCategory {
  category: string;
  amount: number;
  percentage: number;
}

interface SpendingAnalysis {
  totalSpent: number;
  categories: SpendingCategory[];
  insights: string[];
  recommendations: string[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// Helper function to convert categories to chart data
const categoriesToChartData = (categories: SpendingCategory[]) => {
  return categories.map(cat => ({
    name: cat.category,
    value: cat.amount,
    percentage: cat.percentage
  }));
};

// Custom tooltip for pie chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-md shadow-md">
        <p className="font-medium">{payload[0].name}</p>
        <p className="text-sm">{payload[0].value.toFixed(3)} ETH</p>
        <p className="text-xs text-muted-foreground">{payload[0].payload.percentage}%</p>
      </div>
    );
  }
  return null;
};

export function AISpendingAnalysisCard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [analysis, setAnalysis] = useState<SpendingAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeframe, setTimeframe] = useState("week");
  
  // AI Analysis mutation
  const analysisMutation = useMutation<SpendingAnalysis, Error, { teamId: number; timeframe: string }>({
    mutationFn: async (params) => {
      const response = await apiRequest("POST", "/api/ai/analyze-spending", params);
      return await response.json() as SpendingAnalysis;
    },
    onSuccess: (data) => {
      setIsLoading(false);
      setAnalysis(data);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error.message || "Failed to analyze spending patterns",
      });
      setIsLoading(false);
    },
  });

  // Load analysis when component mounts or timeframe changes
  useEffect(() => {
    const fetchAnalysis = () => {
      setIsLoading(true);
      analysisMutation.mutate({ 
        teamId: 1, // Should come from selected team
        timeframe: timeframe === "week" 
          ? "past week" 
          : timeframe === "month" 
            ? "past month" 
            : "past year"
      });
    };
    
    fetchAnalysis();
  }, [timeframe]);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="border-b border-border py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500/10 rounded-md mr-3">
              <BarChart className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold">Spending Analysis</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered spending insights
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30">
            <BrainCircuit className="h-3 w-3 mr-1" /> AI Powered
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <Tabs defaultValue="week" value={timeframe} onValueChange={setTimeframe}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => analysisMutation.mutate({ 
                teamId: 1, 
                timeframe: timeframe === "week" 
                  ? "past week" 
                  : timeframe === "month" 
                    ? "past month" 
                    : "past year"
              })}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          {/* Spending Analysis Content */}
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full border-4 border-t-blue-500 border-r-blue-500/50 border-b-blue-500/30 border-l-blue-500/10 animate-spin mb-3"></div>
                <p className="text-sm font-medium">Analyzing spending patterns...</p>
                <p className="text-xs text-muted-foreground mt-1">This may take a moment</p>
              </div>
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              {/* Top Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 border border-border flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold">{analysis.totalSpent.toFixed(2)} ETH</p>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-full">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  </div>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4 border border-border flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Top Category</p>
                    <p className="text-2xl font-bold">
                      {analysis.categories.length > 0 ? analysis.categories[0].category : "None"}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-full">
                    <AreaChart className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </div>
              
              {/* Charts Row */}
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="font-medium mb-4">Spending Distribution</p>
                
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoriesToChartData(analysis.categories)}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        fill="#8884d8"
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        labelLine={false}
                      >
                        {categoriesToChartData(analysis.categories).map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Insights & Recommendations */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="flex items-center mb-3">
                    <div className="p-1.5 bg-blue-500/10 rounded-md mr-2">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                    </div>
                    <p className="font-medium">Insights</p>
                  </div>
                  <ul className="space-y-2">
                    {analysis.insights.map((insight, index) => (
                      <li key={index} className="text-sm flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="flex items-center mb-3">
                    <div className="p-1.5 bg-green-500/10 rounded-md mr-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="font-medium">Recommendations</p>
                  </div>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm flex items-start">
                        <span className="text-green-400 mr-2">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Actions Footer */}
              <div className="flex justify-end">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Analysis
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-3 bg-blue-500/10 rounded-full inline-flex mx-auto mb-3">
                <BarChart className="h-6 w-6 text-blue-500" />
              </div>
              <p className="font-medium">No spending data to analyze</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Start making transactions to see AI-powered insights
              </p>
              <Button
                variant="outline"
                onClick={() => analysisMutation.mutate({ 
                  teamId: 1, 
                  timeframe: "past month" 
                })}
              >
                Generate Sample Analysis
              </Button>
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}