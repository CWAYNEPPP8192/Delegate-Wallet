import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { useWallet } from "@/providers/WalletProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TeamMembersCard() {
  const { address } = useWallet();
  
  const { data: teams } = useQuery({
    queryKey: ['/api/teams', { userAddress: address }],
    enabled: !!address,
  });
  
  const teamId = teams?.[0]?.id;
  
  const { data: members, isLoading } = useQuery({
    queryKey: [`/api/teams/${teamId}/members`],
    enabled: !!teamId,
  });

  // Generate avatar initials and colors for team members
  const memberAvatars = [
    { initials: "SK", color: "bg-purple-700" },
    { initials: "JL", color: "bg-green-700" },
    { initials: "TM", color: "bg-yellow-700" },
    { initials: "DP", color: "bg-blue-700" },
  ];

  const displayedMembers = memberAvatars.slice(0, 4);
  const remainingCount = (members?.length || 0) - displayedMembers.length;

  return (
    <Card className="bg-card rounded-xl p-5 border border-border">
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-muted-foreground text-sm font-medium">Team Members</h3>
          <button className="text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-4">
          {isLoading ? (
            <div className="h-8 w-12 bg-muted animate-pulse rounded"></div>
          ) : (
            <>
              <p className="text-3xl font-bold">{members?.length || 12}</p>
              <p className="text-muted-foreground text-sm">Active Contributors</p>
            </>
          )}
        </div>
        <div className="flex -space-x-2 overflow-hidden">
          {displayedMembers.map((member, index) => (
            <Avatar
              key={index}
              className={`w-8 h-8 ${member.color} border-2 border-card flex items-center justify-center text-xs font-medium`}
            >
              <AvatarFallback>{member.initials}</AvatarFallback>
            </Avatar>
          ))}
          
          {remainingCount > 0 && (
            <div className="w-8 h-8 rounded-full bg-card border-2 border-card flex items-center justify-center text-xs">
              +{remainingCount}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
