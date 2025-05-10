import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useWallet } from "@/providers/WalletProvider";
import { shortenAddress } from "@/lib/wallet";
import { 
  Clock, 
  Copy, 
  MoreVertical, 
  RefreshCw, 
  Shield, 
  TimerOff, 
  Trash, 
  User
} from "lucide-react";

interface DelegationCardProps {
  delegation: any;
  type: "active" | "received" | "sent" | "expired";
}

export function DelegationCard({ delegation, type }: DelegationCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { address } = useWallet();
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  
  const { 
    id, 
    permissionLevel, 
    delegatorAddress, 
    delegateeAddress, 
    spendingLimit, 
    tokenType, 
    createdAt, 
    expiresAt, 
    allowedActions 
  } = delegation;
  
  const isOwner = delegatorAddress === address;
  const createdDate = new Date(createdAt);
  const expiryDate = expiresAt ? new Date(expiresAt) : null;
  
  // Generate colors and icons based on permission level
  const getPermissionData = () => {
    switch (permissionLevel) {
      case 'admin':
        return { 
          color: 'green', 
          icon: <Shield className="h-5 w-5 text-green-500 mt-0.5" />,
          title: 'Admin Access'
        };
      case 'department_lead':
        return { 
          color: 'blue', 
          icon: <Shield className="h-5 w-5 text-blue-500 mt-0.5" />,
          title: 'Department Lead'
        };
      default:
        return { 
          color: 'yellow', 
          icon: <Shield className="h-5 w-5 text-yellow-500 mt-0.5" />,
          title: 'Team Member'
        };
    }
  };
  
  const permissionData = getPermissionData();
  
  const revokeDelegationMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PATCH", `/api/delegations/${id}`, {
        active: false
      });
    },
    onSuccess: () => {
      toast({
        title: "Delegation Revoked",
        description: "The delegation has been successfully revoked.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/delegations'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to revoke delegation",
      });
    }
  });
  
  const handleRevokeDelegation = () => {
    revokeDelegationMutation.mutate(id);
    setShowRevokeDialog(false);
  };
  
  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address Copied",
      description: "Address copied to clipboard.",
    });
  };

  return (
    <>
      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              {permissionData.icon}
              <div className="ml-2">
                <h3 className={`font-medium text-${permissionData.color}-400`}>{permissionData.title}</h3>
                <p className="text-muted-foreground text-sm">Created {createdDate.toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {type !== "expired" && (
                <Badge variant="outline" className="bg-green-900/30 text-green-400 border-green-800/30">
                  Active
                </Badge>
              )}
              {type === "expired" && (
                <Badge variant="outline" className="bg-red-900/30 text-red-400 border-red-800/30">
                  Expired
                </Badge>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Delegation Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleCopyAddress(delegatorAddress)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Delegator Address
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCopyAddress(delegateeAddress)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Delegatee Address
                  </DropdownMenuItem>
                  {type !== "expired" && isOwner && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setShowRevokeDialog(true)}>
                        <TimerOff className="h-4 w-4 mr-2" />
                        Revoke Delegation
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">From</span>
              <div className="flex items-center">
                <Avatar className="h-6 w-6 mr-2 bg-blue-800">
                  <AvatarFallback>
                    <User className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{shortenAddress(delegatorAddress)}</span>
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">To</span>
              <div className="flex items-center">
                <Avatar className="h-6 w-6 mr-2 bg-purple-800">
                  <AvatarFallback>
                    <User className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{shortenAddress(delegateeAddress)}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-xs text-muted-foreground block mb-1">Spending Limit</span>
              <span className="font-medium">{spendingLimit} {tokenType}</span>
            </div>
            
            <div>
              <span className="text-xs text-muted-foreground block mb-1">Expires</span>
              <span className="font-medium flex items-center">
                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                {expiryDate 
                  ? expiryDate.toLocaleDateString() 
                  : 'Never'}
              </span>
            </div>
          </div>
          
          <div className="border-t border-border pt-4">
            <span className="text-xs text-muted-foreground block mb-2">Allowed Actions</span>
            <div className="flex flex-wrap gap-2">
              {allowedActions.tokenTransfers && (
                <Badge variant="outline" className="border-muted bg-background">
                  Token Transfers
                </Badge>
              )}
              {allowedActions.contractInteractions && (
                <Badge variant="outline" className="border-muted bg-background">
                  Contract Interactions
                </Badge>
              )}
              {allowedActions.subDelegation && (
                <Badge variant="outline" className="border-muted bg-background">
                  Sub-delegation
                </Badge>
              )}
            </div>
          </div>
          
          {type !== "expired" && isOwner && (
            <div className="mt-4 flex justify-end">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setShowRevokeDialog(true)}
              >
                <TimerOff className="h-4 w-4 mr-2" />
                Revoke
              </Button>
            </div>
          )}
          
          {type === "expired" && isOwner && (
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recreate
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Delegation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke this delegation? This action cannot be undone, and the delegatee will lose all permissions granted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground"
              onClick={handleRevokeDelegation}
            >
              <Trash className="h-4 w-4 mr-2" />
              Revoke Delegation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
