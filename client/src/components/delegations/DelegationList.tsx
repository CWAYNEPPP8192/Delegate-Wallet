import { DelegationCard } from "./DelegationCard";
import { Skeleton } from "@/components/ui/skeleton";

interface DelegationListProps {
  delegations: any[];
  isLoading: boolean;
  type: "active" | "received" | "sent" | "expired";
}

export function DelegationList({ delegations, isLoading, type }: DelegationListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border p-5">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div>
                <Skeleton className="h-4 w-28 mb-2" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (delegations.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <h3 className="text-lg font-medium mb-2">No Delegations Found</h3>
        <p className="text-muted-foreground mb-6">
          {type === "active" && "There are no active delegations at the moment."}
          {type === "received" && "You haven't received any delegations yet."}
          {type === "sent" && "You haven't delegated any permissions yet."}
          {type === "expired" && "There are no expired delegations."}
        </p>
        
        {(type === "received" || type === "sent") && (
          <p className="text-sm text-muted-foreground">
            Delegations allow you to share wallet permissions safely with other users.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {delegations.map((delegation) => (
        <DelegationCard 
          key={delegation.id} 
          delegation={delegation} 
          type={type}
        />
      ))}
    </div>
  );
}
