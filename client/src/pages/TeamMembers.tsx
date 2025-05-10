import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/providers/WalletProvider";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { PlusCircle, UserPlus, Mail, MoreHorizontal, Shield, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TeamMembers() {
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

  // Mock team members data for display
  const teamMembers = [
    {
      id: 1,
      name: "Sarah Kim",
      initials: "SK",
      role: "Admin",
      address: "0x71C...29eF",
      color: "bg-purple-700",
      permissions: "Full Access",
      status: "active",
    },
    {
      id: 2,
      name: "James Lee",
      initials: "JL",
      role: "Department Lead",
      address: "0x82D...45aB",
      color: "bg-green-700",
      permissions: "Finance Team",
      status: "active",
    },
    {
      id: 3,
      name: "Tom Miller",
      initials: "TM",
      role: "Department Lead",
      address: "0x93E...67cD",
      color: "bg-yellow-700",
      permissions: "Marketing Team",
      status: "active",
    },
    {
      id: 4,
      name: "Diana Parker",
      initials: "DP",
      role: "Admin",
      address: "0x45F...89eF",
      color: "bg-blue-700",
      permissions: "Full Access",
      status: "active",
    },
    {
      id: 5,
      name: "Alex Chen",
      initials: "AC",
      role: "Department Lead",
      address: "0x56G...12hI",
      color: "bg-red-700",
      permissions: "Development Team",
      status: "active",
    },
    {
      id: 6,
      name: "Nikki Chen",
      initials: "NC",
      role: "External Contributor",
      address: "0x78J...34kL",
      color: "bg-pink-700",
      permissions: "Design Access",
      status: "temporary",
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">Manage team members and their permission levels</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b border-border py-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">Team Members</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Invite
              </Button>
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Wallet Address</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <Avatar className={`h-8 w-8 ${member.color}`}>
                        <AvatarFallback>{member.initials}</AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell className="font-mono text-sm">{member.address}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {member.role === "Admin" ? (
                        <ShieldAlert className="h-4 w-4 mr-1 text-yellow-500" />
                      ) : (
                        <Shield className="h-4 w-4 mr-1 text-blue-500" />
                      )}
                      {member.permissions}
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.status === "active" ? (
                      <Badge variant="outline" className="bg-green-900/30 text-green-400 border-green-800/30">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-900/30 text-yellow-400 border-yellow-800/30">
                        Temporary
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
