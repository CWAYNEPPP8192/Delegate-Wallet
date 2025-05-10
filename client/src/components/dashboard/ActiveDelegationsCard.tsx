import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { useWallet } from "@/providers/WalletProvider";
import { Badge } from "@/components/ui/badge";

export function ActiveDelegationsCard() {
  const { address } = useWallet();
  
  const { data: delegations, isLoading } = useQuery({
    queryKey: ['/api/delegations', { userAddress: address }],
    enabled: !!address,
  });

  const activeDelegations = delegations?.filter(d => d.active) || [];
  const totalDelegations = delegations?.length || 0;

  return (
    <Card className="bg-card rounded-xl p-5 border border-border">
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-muted-foreground text-sm font-medium">Active Delegations</h3>
          <button className="text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-4">
          {isLoading ? (
            <div className="h-8 w-12 bg-muted animate-pulse rounded"></div>
          ) : (
            <>
              <p className="text-3xl font-bold">{activeDelegations.length}</p>
              <p className="text-muted-foreground text-sm">
                Active out of {totalDelegations} total
              </p>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-green-900/30 text-green-400 border-green-800/30">
            Development
          </Badge>
          <Badge variant="outline" className="bg-blue-900/30 text-blue-400 border-blue-800/30">
            Marketing
          </Badge>
          <Badge variant="outline" className="bg-yellow-900/30 text-yellow-400 border-yellow-800/30">
            Operations
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
