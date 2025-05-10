import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/providers/WalletProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function PermissionLevelsCard() {
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

  // Permission levels with member assignments
  const permissionLevels = [
    {
      level: "Admin Access",
      description: "Full control with unlimited spending and delegation authority",
      badge: "Highest",
      badgeClass: "bg-green-900/30 text-green-400",
      cardClass: "bg-gradient-to-r from-green-900/20 to-green-900/5 border-green-900/30",
      titleClass: "text-green-400",
      members: [
        { initials: "SK", color: "bg-purple-700" },
        { initials: "DP", color: "bg-blue-700" },
      ],
    },
    {
      level: "Department Lead",
      description: "Can spend up to 10 ETH monthly with approval rights",
      badge: "Medium",
      badgeClass: "bg-blue-900/30 text-blue-400",
      cardClass: "bg-gradient-to-r from-blue-900/20 to-blue-900/5 border-blue-900/30",
      titleClass: "text-blue-400",
      members: [
        { initials: "TM", color: "bg-yellow-700" },
        { initials: "JL", color: "bg-green-700" },
        { initials: "AC", color: "bg-red-700" },
      ],
    },
    {
      level: "Team Member",
      description: "Up to 2 ETH monthly for approved vendors only",
      badge: "Limited",
      badgeClass: "bg-yellow-900/30 text-yellow-400",
      cardClass: "bg-gradient-to-r from-yellow-900/20 to-yellow-900/5 border-yellow-900/30",
      titleClass: "text-yellow-400",
      members: [
        { initials: "MH", color: "bg-pink-700" },
        { initials: "LW", color: "bg-indigo-700" },
      ],
      extraMembers: 4,
    },
  ];

  return (
    <Card className="bg-card rounded-xl border border-border">
      <CardHeader className="flex items-center justify-between py-5 px-5 border-b border-border">
        <h3 className="font-semibold">Permission Levels</h3>
        <button className="text-xs text-muted-foreground hover:text-foreground">Edit</button>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-4">
          {permissionLevels.map((permission, index) => (
            <div 
              key={index} 
              className={`rounded-lg p-4 border ${permission.cardClass}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-medium ${permission.titleClass}`}>{permission.level}</h4>
                <Badge variant="outline" className={permission.badgeClass}>
                  {permission.badge}
                </Badge>
              </div>
              <p className="text-sm text-gray-300 mb-3">{permission.description}</p>
              <div className="flex -space-x-2 overflow-hidden">
                {permission.members.map((member, i) => (
                  <Avatar 
                    key={i} 
                    className={`w-8 h-8 ${member.color} border-2 border-card flex items-center justify-center text-xs font-medium`}
                  >
                    <AvatarFallback>{member.initials}</AvatarFallback>
                  </Avatar>
                ))}
                
                {permission.extraMembers && (
                  <div className="w-8 h-8 rounded-full bg-card border-2 border-card flex items-center justify-center text-xs">
                    +{permission.extraMembers}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
