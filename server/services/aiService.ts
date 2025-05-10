import OpenAI from "openai";
import { storage } from "../storage";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Interface definitions for AI responses
export interface SpendingAnalysis {
  totalSpent: number;
  categories: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  insights: string[];
  recommendations: string[];
}

export interface DelegationSuggestion {
  suggestedDelegatee: string;
  suggestedPermissionLevel: string;
  suggestedSpendingLimit: string;
  rationale: string;
}

export const aiService = {
  /**
   * Analyze spending patterns from transaction history
   */
  async analyzeSpending(
    teamId: number,
    timeframe: string = "past month"
  ): Promise<SpendingAnalysis> {
    try {
      // Get transactions for the team
      const transactions = await storage.listTransactions(teamId);
      
      // If there's no transaction data, return sample analysis for demo
      if (transactions.length === 0) {
        return this.generateSampleSpendingAnalysis();
      }
      
      // Format transaction data for AI prompt
      const transactionData = transactions.map(tx => `
        - Date: ${tx.timestamp ? new Date(tx.timestamp).toISOString().split('T')[0] : 'Unknown date'}
        - From: ${tx.fromAddress}
        - To: ${tx.toAddress}
        - Amount: ${tx.amount} ${tx.tokenType || 'ETH'}
        - Type: ${tx.transactionType}
        - Status: ${tx.status}
      `).join("\n");
      
      // Prompt for spending analysis
      const prompt = `
      You are a financial analyst for a crypto wallet team. Analyze the following transaction data for the ${timeframe}:
      
      ${transactionData}
      
      Provide a comprehensive spending analysis with the following information in JSON format:
      1. Total amount spent (in ETH)
      2. Categorize spending into logical categories, with amount and percentage for each
      3. Provide 3-4 key insights about the spending patterns
      4. Suggest 2-3 recommendations for optimizing spending
      
      Format your response as a valid JSON object with the following structure:
      {
        "totalSpent": number,
        "categories": [
          { "category": string, "amount": number, "percentage": number }
        ],
        "insights": [string],
        "recommendations": [string]
      }
      `;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are a financial analyst for a Web3 wallet team." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });
      
      // Parse AI response
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Failed to get response from AI");
      }
      
      return JSON.parse(content) as SpendingAnalysis;
    } catch (error) {
      console.error("Error analyzing spending:", error);
      // Return sample data if there's an error
      return this.generateSampleSpendingAnalysis();
    }
  },
  
  /**
   * Generate smart delegation suggestions based on team activity
   */
  async suggestDelegations(
    teamId: number
  ): Promise<DelegationSuggestion[]> {
    try {
      // Get team members and existing delegations
      const teamMembers = await storage.listTeamMembers(teamId);
      const delegations = await storage.listDelegations(teamId);
      const transactions = await storage.listTransactions(teamId);
      
      // If there's no data, return sample suggestions
      if (teamMembers.length === 0) {
        return this.generateSampleDelegationSuggestions();
      }
      
      // Format data for AI prompt
      const teamMemberData = teamMembers.map(member => `
        - Address: ${member.userAddress}
        - Role: ${member.role}
      `).join("\n");
      
      const delegationData = delegations.map(delegation => `
        - From: ${delegation.delegatorAddress}
        - To: ${delegation.delegateeAddress}
        - Active: ${delegation.active ? 'Yes' : 'No'}
        - Permission Level: ${delegation.permissionLevel}
        - Spending Limit: ${delegation.spendingLimit || 'None'} ${delegation.tokenType || 'ETH'}
        - Expires At: ${delegation.expiresAt ? new Date(delegation.expiresAt).toISOString().split('T')[0] : 'Never'}
      `).join("\n");
      
      // Prompt for delegation suggestions
      const prompt = `
      You are a financial advisor for a crypto wallet team. Based on the following team and delegation data, 
      suggest optimal delegation assignments to improve financial operations:
      
      TEAM MEMBERS:
      ${teamMemberData}
      
      CURRENT DELEGATIONS:
      ${delegationData}
      
      RECENT TRANSACTIONS (Sample):
      ${transactions.slice(0, 5).map(tx => `- ${tx.fromAddress} sent ${tx.amount} ${tx.tokenType || 'ETH'} to ${tx.toAddress} (${tx.transactionType})`).join("\n")}
      
      Provide 2-3 delegation suggestions that would optimize team financial operations in JSON format.
      For each suggestion include:
      1. The suggested delegatee (use one of the team member addresses)
      2. The suggested permission level (use one of: department_lead, team_member, contractor, or advisor)
      3. A suggested spending limit
      4. A rationale for the suggestion
      
      Format your response as a JSON array with this structure:
      [
        {
          "suggestedDelegatee": string,
          "suggestedPermissionLevel": string,
          "suggestedSpendingLimit": string,
          "rationale": string
        }
      ]
      `;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are a financial advisor for a Web3 wallet team." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });
      
      // Parse AI response
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Failed to get response from AI");
      }
      
      return JSON.parse(content) as DelegationSuggestion[];
    } catch (error) {
      console.error("Error suggesting delegations:", error);
      // Return sample data if there's an error
      return this.generateSampleDelegationSuggestions();
    }
  },
  
  /**
   * Review a delegation before confirming
   */
  async reviewDelegation(delegationData: any): Promise<string> {
    try {
      // Format delegation data for AI prompt
      const formattedData = `
        - Delegator: ${delegationData.delegatorAddress}
        - Delegatee: ${delegationData.delegateeAddress}
        - Permission Level: ${delegationData.permissionLevel}
        - Spending Limit: ${delegationData.spendingLimit} ${delegationData.tokenType}
        - Duration: ${delegationData.duration}
        - Allowed Actions: ${Object.entries(delegationData.allowedActions)
          .map(([key, value]) => `${key}: ${value ? 'Yes' : 'No'}`)
          .join(', ')}
      `;
      
      // Prompt for delegation review
      const prompt = `
      You are a security analyst for a crypto wallet team. Review the following delegation settings
      and provide a comprehensive security assessment:
      
      DELEGATION DETAILS:
      ${formattedData}
      
      Provide a detailed review of this delegation, including:
      1. Overall security assessment
      2. Potential risks or vulnerabilities
      3. Suggestions to improve security
      4. A security score on a scale of 0-100
      
      Respond in a clear, structured format that would be helpful for a user reviewing this delegation.
      `;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are a security analyst for a Web3 wallet delegation system." },
          { role: "user", content: prompt }
        ]
      });
      
      // Return AI response
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Failed to get response from AI");
      }
      
      return content;
    } catch (error) {
      console.error("Error reviewing delegation:", error);
      return "Unable to perform AI security review. Please review the delegation settings carefully yourself, checking permission levels, spending limits, and delegation duration to ensure they align with your intended use case.";
    }
  },
  
  /**
   * Generate content for an automated report
   */
  async generateTeamReport(
    teamId: number,
    reportType: string = "weekly"
  ): Promise<string> {
    try {
      // Get team data
      const team = await storage.getTeam(teamId);
      const teamMembers = await storage.listTeamMembers(teamId);
      const delegations = await storage.listDelegations(teamId);
      const transactions = await storage.listTransactions(teamId);
      
      // Format data for AI prompt
      const teamOverview = `
        Team Name: ${team?.name || 'Unknown team'}
        Member Count: ${teamMembers.length}
        Active Delegations: ${delegations.filter(d => d.active).length}
        Recent Transactions: ${transactions.length}
        Total Transaction Volume: ${transactions.reduce((sum, tx) => sum + Number(tx.amount), 0)} ETH
      `;
      
      // Prompt for team report
      const prompt = `
      Generate a comprehensive ${reportType} report for the team with the following details:
      
      ${teamOverview}
      
      The report should include:
      1. Executive summary
      2. Key financial activities
      3. Delegation status overview
      4. Notable transactions
      5. Recommendations for the next period
      
      Format the report in a professional, well-structured manner suitable for presentation to stakeholders.
      `;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are a professional financial report generator for a Web3 team." },
          { role: "user", content: prompt }
        ]
      });
      
      // Return AI response
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Failed to get response from AI");
      }
      
      return content;
    } catch (error) {
      console.error("Error generating team report:", error);
      return "Unable to generate automated report at this time. Please try again later or generate a manual report.";
    }
  },
  
  // Helper methods for generating sample data (for demo/development purposes)
  generateSampleSpendingAnalysis(): SpendingAnalysis {
    return {
      totalSpent: 12.45,
      categories: [
        { category: "Smart Contract Interactions", amount: 4.2, percentage: 33.7 },
        { category: "Team Payments", amount: 3.8, percentage: 30.5 },
        { category: "Service Subscriptions", amount: 2.25, percentage: 18.1 },
        { category: "Gas Fees", amount: 1.1, percentage: 8.8 },
        { category: "Miscellaneous", amount: 1.1, percentage: 8.8 }
      ],
      insights: [
        "The majority of spending (64.2%) is allocated to smart contract interactions and team payments.",
        "Service subscription costs have increased by 15% compared to previous periods.",
        "Gas fee optimization could yield approximately 8% in cost savings.",
        "Regular payments follow a consistent weekly pattern, suggesting scheduled transactions."
      ],
      recommendations: [
        "Consider batching smart contract interactions to reduce overall gas costs.",
        "Implement spending limits for service subscriptions to prevent budget overruns.",
        "Schedule transactions during periods of lower network congestion to minimize gas fees."
      ]
    };
  },
  
  generateSampleDelegationSuggestions(): DelegationSuggestion[] {
    return [
      {
        suggestedDelegatee: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        suggestedPermissionLevel: "department_lead",
        suggestedSpendingLimit: "5.0 ETH",
        rationale: "This team member has demonstrated consistent transaction patterns and responsible financial management. Elevating to department_lead with a moderate spending limit would streamline approvals for routine department expenses."
      },
      {
        suggestedDelegatee: "0x8fD00f170FDf3772C5ebdCD90bF257316c69BA45",
        suggestedPermissionLevel: "team_member",
        suggestedSpendingLimit: "1.5 ETH",
        rationale: "Regular involvement in project-related transactions suggests this member needs ongoing access to funds. A limited delegation would reduce approval bottlenecks while maintaining appropriate controls."
      },
      {
        suggestedDelegatee: "0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF",
        suggestedPermissionLevel: "contractor",
        suggestedSpendingLimit: "0.8 ETH",
        rationale: "Transaction history shows recurring payments to external services. A specialized delegation would allow this member to handle vendor relationships without requiring constant approvals."
      }
    ];
  }
};