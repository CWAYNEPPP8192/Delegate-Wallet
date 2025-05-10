import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart4, 
  BrainCircuit, 
  Lightbulb, 
  Search, 
  Shield, 
  Sparkles,
  Share2,
  FileText, 
  ArrowRight
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/providers/WalletProvider";

export function AIAssistantCard() {
  const { toast } = useToast();
  const { address } = useWallet();
  const [query, setQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [activeAssistant, setActiveAssistant] = useState<string | null>(null);
  
  // AI Assistant features
  const assistantFeatures = [
    { 
      id: "analyze",
      label: "Spending Analysis", 
      description: "Analyze spending patterns across transactions",
      icon: <BarChart4 className="h-5 w-5 text-blue-400" />,
      endpoint: "/api/ai/analyze-spending"
    },
    { 
      id: "suggest",
      label: "Delegation Suggestions", 
      description: "Get smart delegation recommendations",
      icon: <Share2 className="h-5 w-5 text-green-400" />,
      endpoint: "/api/ai/suggest-delegations"
    },
    { 
      id: "review",
      label: "Security Reviews", 
      description: "Review delegations for security concerns",
      icon: <Shield className="h-5 w-5 text-yellow-400" />,
      endpoint: "/api/ai/review-delegation"
    },
    { 
      id: "report",
      label: "Team Reports", 
      description: "Generate insightful team reports",
      icon: <FileText className="h-5 w-5 text-purple-400" />,
      endpoint: "/api/ai/team-report"
    },
  ];

  // AI Assistant API query
  const assistantMutation = useMutation({
    mutationFn: async (params: { endpoint: string; data: any }) => {
      return apiRequest("POST", params.endpoint, params.data);
    },
    onSuccess: (data) => {
      setIsThinking(false);
      
      // Format the response based on the active assistant
      let formattedResponse = "";
      
      if (activeAssistant === "analyze") {
        formattedResponse = formatSpendingAnalysis(data);
      } else if (activeAssistant === "suggest") {
        formattedResponse = formatDelegationSuggestions(data);
      } else {
        formattedResponse = typeof data === "object" && "review" in data && typeof data.review === "string" 
          ? data.review 
          : JSON.stringify(data, null, 2);
      }
      
      setAiResponse(formattedResponse);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to get AI response",
      });
      setIsThinking(false);
    },
  });

  // Helper formatting functions
  const formatSpendingAnalysis = (data: any) => {
    if (!data.categories || !data.insights) {
      return JSON.stringify(data, null, 2);
    }
    
    const categoriesText = data.categories
      .map((c: any) => `- ${c.category}: ${c.amount} ETH (${c.percentage}%)`)
      .join("\\n");
      
    const insightsText = data.insights
      .map((i: string) => `- ${i}`)
      .join("\\n");
      
    const recommendationsText = data.recommendations
      .map((r: string) => `- ${r}`)
      .join("\\n");
    
    return `## Spending Analysis\\n
Total spent: ${data.totalSpent} ETH\\n
### Categories:\\n${categoriesText}\\n
### Insights:\\n${insightsText}\\n
### Recommendations:\\n${recommendationsText}`;
  };
  
  const formatDelegationSuggestions = (data: any) => {
    if (!Array.isArray(data)) {
      return JSON.stringify(data, null, 2);
    }
    
    return data.map((suggestion, index) => `
### Suggestion ${index + 1}\\n
**Delegatee:** ${suggestion.suggestedDelegatee}\\n
**Permission Level:** ${suggestion.suggestedPermissionLevel}\\n
**Spending Limit:** ${suggestion.suggestedSpendingLimit}\\n
**Rationale:** ${suggestion.rationale}\\n
`).join("\\n");
  };

  // Handle clicking an assistant feature button
  const handleFeatureClick = (featureId: string) => {
    setActiveAssistant(featureId);
    setIsExpanded(true);
    setAiResponse("");
    
    // Provide helpful prompts based on the selected feature
    switch (featureId) {
      case "analyze":
        setQuery("Analyze my team's spending patterns for the past month");
        break;
      case "suggest":
        setQuery("Suggest optimal delegations for my team based on recent activity");
        break;
      case "review":
        setQuery("Review my new delegation to the marketing department for any security concerns");
        break;
      case "report":
        setQuery("Generate a weekly report for my team's wallet activity");
        break;
      default:
        setQuery("");
    }
  };

  // Handle submitting a query to the AI
  const handleSubmit = () => {
    if (!query.trim()) return;
    
    setIsThinking(true);
    setAiResponse("");
    
    const feature = assistantFeatures.find(f => f.id === activeAssistant);
    if (!feature) return;
    
    // Prepare data based on the active assistant
    let data: any = { query };
    
    if (activeAssistant === "analyze") {
      data = { 
        teamId: 1, // Should come from selected team
        timeframe: "past month" 
      };
    } else if (activeAssistant === "suggest") {
      data = { teamId: 1 }; // Should come from selected team
    } else if (activeAssistant === "review") {
      // Mock delegation data for review
      data = {
        delegatorAddress: address,
        delegateeAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        permissionLevel: "department_lead",
        spendingLimit: "5.0",
        tokenType: "ETH",
        duration: "1m",
        allowedActions: {
          tokenTransfers: true,
          contractInteractions: true,
          subDelegation: false,
        }
      };
    }
    
    assistantMutation.mutate({ 
      endpoint: feature.endpoint, 
      data 
    });
  };

  return (
    <Card className="bg-card border-border transition-all duration-300">
      <CardHeader className="border-b border-border py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-500/10 rounded-md mr-3">
              <BrainCircuit className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <h3 className="font-semibold">AI Wallet Assistant</h3>
              <p className="text-sm text-muted-foreground">
                {isExpanded && activeAssistant 
                  ? assistantFeatures.find(f => f.id === activeAssistant)?.description
                  : "Smart insights for your team wallet"}
              </p>
            </div>
          </div>
          <div>
            {isExpanded ? (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                Minimize
              </Button>
            ) : (
              <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30">
                <Sparkles className="h-3 w-3 mr-1" /> AI Powered
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        {!isExpanded ? (
          <div className="grid grid-cols-2 gap-3">
            {assistantFeatures.map((feature) => (
              <Button
                key={feature.id}
                variant="outline"
                className="flex items-center justify-start h-auto p-3 hover:bg-muted"
                onClick={() => handleFeatureClick(feature.id)}
              >
                <div className="mr-3 p-2 rounded-md bg-card">
                  {feature.icon}
                </div>
                <div className="text-left">
                  <p className="font-medium">{feature.label}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {feature.description}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="What would you like to know?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button 
                onClick={handleSubmit}
                disabled={isThinking || !query.trim()}
              >
                {isThinking ? (
                  <>Thinking...</>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Ask
                  </>
                )}
              </Button>
            </div>

            {isThinking && (
              <div className="flex justify-center my-8">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full border-4 border-t-indigo-500 border-r-indigo-500/50 border-b-indigo-500/30 border-l-indigo-500/10 animate-spin mb-3"></div>
                  <p className="text-sm text-muted-foreground">Analyzing data...</p>
                </div>
              </div>
            )}

            {aiResponse && (
              <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="bg-indigo-500/10 p-1.5 rounded-md">
                    <BrainCircuit className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="font-medium">AI Assistant</p>
                    <p className="text-xs text-muted-foreground">Here's what I found:</p>
                  </div>
                </div>
                <div className="pl-10 text-sm whitespace-pre-line">
                  {aiResponse.split("\\n").map((line, i) => {
                    // Format markdown-like headings
                    if (line.startsWith("###")) {
                      return <h4 key={i} className="text-md font-semibold mt-3 mb-1">{line.replace(/^###\s/, '')}</h4>;
                    }
                    if (line.startsWith("##")) {
                      return <h3 key={i} className="text-lg font-semibold mt-4 mb-2">{line.replace(/^##\s/, '')}</h3>;
                    }
                    if (line.startsWith("**") && line.endsWith("**")) {
                      return <p key={i} className="font-semibold">{line.replace(/^\*\*|\*\*$/g, '')}</p>;
                    }
                    if (line.startsWith("-")) {
                      return <p key={i} className="ml-4 pl-2 border-l-2 border-muted-foreground/30 my-1">{line}</p>;
                    }
                    return <p key={i} className="my-1">{line}</p>;
                  })}
                </div>
                
                {/* Additional call-to-action buttons based on the active assistant */}
                {activeAssistant === "analyze" && (
                  <div className="mt-4 pl-10">
                    <Button variant="outline" size="sm" className="mr-2">
                      <FileText className="h-4 w-4 mr-1" />
                      Export Report
                    </Button>
                  </div>
                )}
                
                {activeAssistant === "suggest" && (
                  <div className="mt-4 pl-10">
                    <Button variant="outline" size="sm" className="mr-2">
                      <ArrowRight className="h-4 w-4 mr-1" />
                      Create Delegation
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {/* Feature selection footer */}
            {!isThinking && !aiResponse && (
              <div className="bg-muted/50 rounded-lg p-4 mt-2">
                <div className="flex items-start space-x-3">
                  <div className="bg-yellow-500/10 p-1.5 rounded-md">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="font-medium">Assistant Tips</p>
                    <p className="text-sm text-muted-foreground">Try asking about:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {assistantFeatures.map(feature => (
                        <Badge 
                          key={feature.id}
                          variant="outline" 
                          className="cursor-pointer hover:bg-muted"
                          onClick={() => handleFeatureClick(feature.id)}
                        >
                          {feature.icon}
                          <span className="ml-1">{feature.label}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}