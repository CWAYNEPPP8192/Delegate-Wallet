import { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useWallet } from "@/providers/WalletProvider";
import { useToast } from "@/hooks/use-toast";
import { WalletStatus } from "@/components/wallet/WalletStatus";
import { shortenAddress } from "@/lib/wallet";
import { 
  Bell, 
  Copy, 
  Globe, 
  Key, 
  Lock, 
  Save, 
  Shield, 
  User, 
  Wallet 
} from "lucide-react";

export default function Settings() {
  const { address, balance, disconnectWallet } = useWallet();
  const { toast } = useToast();
  const [username, setUsername] = useState("User Account");
  const [notifications, setNotifications] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleSaveProfile = () => {
    setIsUpdating(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsUpdating(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    }, 1000);
  };
  
  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard.",
      });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and wallet connections</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4">
                  {username.split(' ').map(n => n[0]).join('')}
                </div>
                <h2 className="text-xl font-bold">{username}</h2>
                <p className="text-muted-foreground mb-4">{shortenAddress(address || "")}</p>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyAddress}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Address
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectWallet}
                  >
                    <Wallet className="h-4 w-4 mr-1" />
                    Disconnect
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-3">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="profile" className="flex items-center justify-center">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="wallet" className="flex items-center justify-center">
                <Wallet className="h-4 w-4 mr-2" />
                Wallet
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center justify-center">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center justify-center">
                <Bell className="h-4 w-4 mr-2" />
                Preferences
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium">Profile Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Update your account information
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="your@email.com" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea 
                      id="bio" 
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={isUpdating}>
                    {isUpdating ? "Saving..." : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="wallet">
              <div className="space-y-6">
                <WalletStatus />
                
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-medium">Connected Accounts</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage wallet connections and permissions
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg border border-border flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-md mr-3 flex items-center justify-center text-white text-xs">
                          MM
                        </div>
                        <div>
                          <h4 className="font-medium">MetaMask</h4>
                          <p className="text-sm text-muted-foreground">{shortenAddress(address || "")}</p>
                        </div>
                      </div>
                      <div>
                        <Button variant="outline" size="sm">Disconnect</Button>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg border border-border/50 flex justify-between items-center opacity-70">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-md mr-3 flex items-center justify-center text-white text-xs">
                          WC
                        </div>
                        <div>
                          <h4 className="font-medium">WalletConnect</h4>
                          <p className="text-sm text-muted-foreground">Not connected</p>
                        </div>
                      </div>
                      <div>
                        <Button variant="outline" size="sm">Connect</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium">Security Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure your account security preferences
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex items-center">
                      <Lock className="h-5 w-5 mr-3 text-blue-500" />
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                    </div>
                    <Switch 
                      checked={twoFactorEnabled} 
                      onCheckedChange={setTwoFactorEnabled} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex items-center">
                      <Key className="h-5 w-5 mr-3 text-blue-500" />
                      <div>
                        <h4 className="font-medium">Session Management</h4>
                        <p className="text-sm text-muted-foreground">View and manage your active sessions</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 mr-3 text-blue-500" />
                      <div>
                        <h4 className="font-medium">Delegation Approvals</h4>
                        <p className="text-sm text-muted-foreground">Review and manage your delegation approvals</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium">Notification Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure how you want to be notified
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive email updates about your account</p>
                    </div>
                    <Switch 
                      checked={notifications} 
                      onCheckedChange={setNotifications} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Transaction Alerts</h4>
                      <p className="text-sm text-muted-foreground">Get notified about wallet transactions</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Delegation Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive updates about delegation changes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="theme">Theme Preference</Label>
                        <Select defaultValue={theme} onValueChange={setTheme}>
                          <SelectTrigger className="w-32">
                            <Globe className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Theme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button>Save Preferences</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
