import { useWallet } from "@/providers/WalletProvider";
import { WalletBalanceCard } from "@/components/dashboard/WalletBalanceCard";
import { ActiveDelegationsCard } from "@/components/dashboard/ActiveDelegationsCard";
import { TeamMembersCard } from "@/components/dashboard/TeamMembersCard";
import { AutomatedPaymentsCard } from "@/components/dashboard/AutomatedPaymentsCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { PermissionLevelsCard } from "@/components/dashboard/PermissionLevelsCard";
import { DelegationVisualizerCard } from "@/components/dashboard/DelegationVisualizerCard";
import { CreateDelegationForm } from "@/components/forms/CreateDelegationForm";
import { PaymentStreamForm } from "@/components/forms/PaymentStreamForm";
import { AIAssistantCard } from "@/components/ai/AIAssistantCard";
import { AISpendingAnalysisCard } from "@/components/ai/AISpendingAnalysisCard";

export default function Dashboard() {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Please connect your wallet to view the dashboard.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Wallet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <WalletBalanceCard />
        <ActiveDelegationsCard />
        <TeamMembersCard />
        <AutomatedPaymentsCard />
      </div>

      {/* AI Assistant Section */}
      <div className="mb-8">
        <AIAssistantCard />
      </div>

      {/* Recent Activity & Permissions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <RecentActivityCard />
        <PermissionLevelsCard />
      </div>

      {/* AI Spending Analysis & Delegation Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AISpendingAnalysisCard />
        <DelegationVisualizerCard />
      </div>

      {/* Forms Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CreateDelegationForm />
        <PaymentStreamForm />
      </div>
    </div>
  );
}
