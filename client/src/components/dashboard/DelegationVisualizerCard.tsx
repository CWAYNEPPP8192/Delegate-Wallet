import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/providers/WalletProvider";

export function DelegationVisualizerCard() {
  const [viewMode, setViewMode] = useState<"team" | "permission">("permission");
  const { address } = useWallet();
  
  const { data: teams } = useQuery({
    queryKey: ['/api/teams', { userAddress: address }],
    enabled: !!address,
  });
  
  const teamId = teams?.[0]?.id;
  
  const { data: delegations } = useQuery({
    queryKey: [`/api/delegations`, { teamId }],
    enabled: !!teamId,
  });

  return (
    <Card className="bg-card rounded-xl border border-border mb-8">
      <CardHeader className="flex items-center justify-between py-5 px-5 border-b border-border">
        <h3 className="font-semibold">Delegation Flow Visualizer</h3>
        <div className="flex space-x-2">
          <Button 
            variant={viewMode === "team" ? "secondary" : "outline"} 
            className="text-xs px-3 py-1 h-auto"
            onClick={() => setViewMode("team")}
          >
            By Team
          </Button>
          <Button 
            variant={viewMode === "permission" ? "secondary" : "outline"} 
            className="text-xs px-3 py-1 h-auto"
            onClick={() => setViewMode("permission")}
          >
            By Permission
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-5 overflow-x-auto">
        {/* A visual representation of delegation chains */}
        <div className="min-w-[700px] h-[300px] rounded-lg bg-background/50 relative p-4 flex items-center justify-center">
          {/* The SVG Tree Structure for Delegation Visualization */}
          <svg width="650" height="250" viewBox="0 0 650 250" className="mx-auto">
            {/* Main Owner to Level 1 Delegations */}
            <line x1="325" y1="50" x2="175" y2="125" stroke="#3B82F6" strokeWidth="2" strokeDasharray="5,5" />
            <line x1="325" y1="50" x2="325" y2="125" stroke="#3B82F6" strokeWidth="2" strokeDasharray="5,5" />
            <line x1="325" y1="50" x2="475" y2="125" stroke="#3B82F6" strokeWidth="2" strokeDasharray="5,5" />
            
            {/* Level 1 to Level 2 Delegations */}
            <line x1="175" y1="125" x2="100" y2="200" stroke="#10B981" strokeWidth="2" strokeDasharray="5,5" />
            <line x1="175" y1="125" x2="175" y2="200" stroke="#10B981" strokeWidth="2" strokeDasharray="5,5" />
            <line x1="325" y1="125" x2="250" y2="200" stroke="#10B981" strokeWidth="2" strokeDasharray="5,5" />
            <line x1="325" y1="125" x2="325" y2="200" stroke="#10B981" strokeWidth="2" strokeDasharray="5,5" />
            <line x1="475" y1="125" x2="400" y2="200" stroke="#10B981" strokeWidth="2" strokeDasharray="5,5" />
            <line x1="475" y1="125" x2="550" y2="200" stroke="#10B981" strokeWidth="2" strokeDasharray="5,5" />
            
            {/* Root/Owner Node */}
            <circle cx="325" cy="50" r="25" fill="#3B82F6" />
            <text x="325" y="55" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Owner</text>
            
            {/* Level 1 Nodes */}
            <circle cx="175" cy="125" r="20" fill="#10B981" />
            <text x="175" y="130" textAnchor="middle" fill="white" fontSize="11">Dev</text>
            
            <circle cx="325" cy="125" r="20" fill="#10B981" />
            <text x="325" y="130" textAnchor="middle" fill="white" fontSize="11">Finance</text>
            
            <circle cx="475" cy="125" r="20" fill="#10B981" />
            <text x="475" y="130" textAnchor="middle" fill="white" fontSize="11">Marketing</text>
            
            {/* Level 2 Nodes */}
            <circle cx="100" cy="200" r="15" fill="#F59E0B" />
            <text x="100" y="204" textAnchor="middle" fill="white" fontSize="10">Backend</text>
            
            <circle cx="175" cy="200" r="15" fill="#F59E0B" />
            <text x="175" y="204" textAnchor="middle" fill="white" fontSize="10">Frontend</text>
            
            <circle cx="250" cy="200" r="15" fill="#F59E0B" />
            <text x="250" y="204" textAnchor="middle" fill="white" fontSize="10">Payroll</text>
            
            <circle cx="325" cy="200" r="15" fill="#F59E0B" />
            <text x="325" y="204" textAnchor="middle" fill="white" fontSize="10">Vendors</text>
            
            <circle cx="400" cy="200" r="15" fill="#F59E0B" />
            <text x="400" y="204" textAnchor="middle" fill="white" fontSize="10">Social</text>
            
            <circle cx="550" cy="200" r="15" fill="#F59E0B" />
            <text x="550" y="204" textAnchor="middle" fill="white" fontSize="10">Design</text>
          </svg>
          
          <div className="absolute bottom-4 right-4 bg-background/80 p-2 rounded-lg flex items-center space-x-4 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-primary mr-1"></div>
              <span>Owner</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
              <span>Department</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
              <span>Team</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
