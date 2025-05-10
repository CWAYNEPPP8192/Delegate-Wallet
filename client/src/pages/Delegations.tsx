import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/providers/WalletProvider";
import { CreateDelegationForm } from "@/components/forms/CreateDelegationForm";
import { DelegationList } from "@/components/delegations/DelegationList";
import { DelegationVisualizerCard } from "@/components/dashboard/DelegationVisualizerCard";
import { PlusCircle, Users, Shield } from "lucide-react";

export default function Delegations() {
  const { address } = useWallet();
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const { data: teams } = useQuery({
    queryKey: ['/api/teams', { userAddress: address }],
    enabled: !!address,
  });
  
  const teamId = teams?.[0]?.id;
  
  const { data: delegations, isLoading } = useQuery({
    queryKey: [`/api/delegations`, { teamId }],
    enabled: !!teamId,
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Delegations</h1>
          <p className="text-muted-foreground">Manage wallet permissions and authorizations</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? (
            <>
              <Users className="h-4 w-4 mr-2" />
              View Delegations
            </>
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Delegation
            </>
          )}
        </Button>
      </div>

      {/* Delegation Visualizer */}
      {!showCreateForm && <DelegationVisualizerCard />}

      {/* Create Delegation Form or Delegation List */}
      {showCreateForm ? (
        <div className="max-w-2xl mx-auto">
          <CreateDelegationForm />
        </div>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active Delegations</TabsTrigger>
            <TabsTrigger value="received">Received Delegations</TabsTrigger>
            <TabsTrigger value="sent">Sent Delegations</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            <DelegationList 
              delegations={delegations?.filter(d => d.active) || []} 
              isLoading={isLoading} 
              type="active"
            />
          </TabsContent>
          
          <TabsContent value="received">
            <DelegationList 
              delegations={delegations?.filter(d => d.delegateeAddress === address && d.active) || []} 
              isLoading={isLoading} 
              type="received"
            />
          </TabsContent>
          
          <TabsContent value="sent">
            <DelegationList 
              delegations={delegations?.filter(d => d.delegatorAddress === address && d.active) || []} 
              isLoading={isLoading} 
              type="sent"
            />
          </TabsContent>
          
          <TabsContent value="expired">
            <DelegationList 
              delegations={delegations?.filter(d => !d.active) || []} 
              isLoading={isLoading} 
              type="expired"
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Permission Levels Legend */}
      {!showCreateForm && (
        <Card className="mt-8">
          <CardHeader className="border-b border-border">
            <h3 className="font-semibold">Permission Levels Reference</h3>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start p-3 rounded-lg bg-green-900/10 border border-green-900/20">
                <Shield className="h-5 w-5 mr-3 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-400">Admin Access</h4>
                  <p className="text-sm text-muted-foreground">Full control with unlimited spending and delegation authority</p>
                </div>
              </div>
              
              <div className="flex items-start p-3 rounded-lg bg-blue-900/10 border border-blue-900/20">
                <Shield className="h-5 w-5 mr-3 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-400">Department Lead</h4>
                  <p className="text-sm text-muted-foreground">Can spend up to 10 ETH monthly with approval rights</p>
                </div>
              </div>
              
              <div className="flex items-start p-3 rounded-lg bg-yellow-900/10 border border-yellow-900/20">
                <Shield className="h-5 w-5 mr-3 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-400">Team Member</h4>
                  <p className="text-sm text-muted-foreground">Up to 2 ETH monthly for approved vendors only</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
