import { ethers } from "ethers";

// Interface for the ERC-7715 delegation
export interface Delegation {
  delegator: string;
  delegatee: string;
  permissions: Permission[];
  caveats: Caveat[];
  signature: string;
  validity: {
    validFrom: number;
    validUntil: number;
  };
}

export interface Permission {
  type: string;
  value: any;
}

export interface Caveat {
  type: string;
  value: any;
}

// These are mocked since actual ERC-7715 implementation would depend on MetaMask's SDK
const ERC7715_TYPES = {
  Delegation: [
    { name: 'delegator', type: 'address' },
    { name: 'delegatee', type: 'address' },
    { name: 'permissions', type: 'Permission[]' },
    { name: 'caveats', type: 'Caveat[]' },
    { name: 'validity', type: 'Validity' },
    { name: 'nonce', type: 'uint256' },
  ],
  Permission: [
    { name: 'type', type: 'string' },
    { name: 'value', type: 'string' },
  ],
  Caveat: [
    { name: 'type', type: 'string' },
    { name: 'value', type: 'string' },
  ],
  Validity: [
    { name: 'validFrom', type: 'uint256' },
    { name: 'validUntil', type: 'uint256' },
  ],
};

export const PERMISSION_TYPES = {
  SEND_TOKEN: 'sendToken',
  CONTRACT_INTERACTION: 'contractInteraction',
  SUB_DELEGATION: 'subDelegation',
};

export const CAVEAT_TYPES = {
  SPENDING_LIMIT: 'spendingLimit',
  ALLOWED_CONTRACTS: 'allowedContracts',
  MAX_DELEGATIONS: 'maxDelegations',
};

export async function createDelegation(
  signer: ethers.JsonRpcSigner,
  delegatee: string, 
  permissions: Permission[],
  caveats: Caveat[],
  validUntil: number
): Promise<Delegation | null> {
  try {
    const delegator = await signer.getAddress();
    const validFrom = Math.floor(Date.now() / 1000);
    const nonce = Math.floor(Math.random() * 1000000); // In a real implementation, we would get the nonce from the contract
    
    const delegationData = {
      delegator,
      delegatee,
      permissions,
      caveats,
      validity: {
        validFrom,
        validUntil,
      },
      nonce,
    };
    
    // This is a simplification - in a real implementation, we would use EIP-712 typed signing
    // with MetaMask's Delegation Toolkit
    const message = JSON.stringify(delegationData);
    const signature = await signer.signMessage(message);
    
    return {
      ...delegationData,
      signature,
    };
  } catch (error) {
    console.error("Error creating delegation:", error);
    return null;
  }
}

export function buildSpendingLimitCaveat(amount: string, token: string = 'ETH'): Caveat {
  return {
    type: CAVEAT_TYPES.SPENDING_LIMIT,
    value: JSON.stringify({ amount, token }),
  };
}

export function buildAllowedContractsCaveat(contractAddresses: string[]): Caveat {
  return {
    type: CAVEAT_TYPES.ALLOWED_CONTRACTS,
    value: JSON.stringify({ contractAddresses }),
  };
}

export function buildMaxDelegationsCaveat(maxDelegations: number): Caveat {
  return {
    type: CAVEAT_TYPES.MAX_DELEGATIONS,
    value: JSON.stringify({ maxDelegations }),
  };
}

export function getDurationDate(duration: string): number {
  const now = Math.floor(Date.now() / 1000);
  
  switch (duration) {
    case '24h':
      return now + 24 * 60 * 60;
    case '1w':
      return now + 7 * 24 * 60 * 60;
    case '1m':
      return now + 30 * 24 * 60 * 60;
    case 'permanent':
      return now + 365 * 24 * 60 * 60; // 1 year as "permanent"
    default:
      if (duration.startsWith('custom:')) {
        const timestamp = parseInt(duration.substring(7));
        return isNaN(timestamp) ? now : timestamp;
      }
      return now;
  }
}

// This would be a call to MetaMask's Delegation Toolkit in a real implementation
export function verifyDelegation(delegation: Delegation): boolean {
  // In a real implementation, we would verify the signature
  return true;
}
