import { ContractStatus, NetworkType, SignatureStatus } from './enums';

export interface ContractSchema {
  id: string;
  name: string;
  address?: string;
  status: ContractStatus;
  network: NetworkType;
  abi?: any[];
  bytecode?: string;
  signature?: SignatureSchema;
}

export interface SignatureSchema {
  publicKey: string;
  signature: string;
  leafIdx: number;
  authPath: string[];
  status: SignatureStatus;
  timestamp: number;
}

export interface DeploymentSchema {
  contractId: string;
  transactionHash: string;
  blockNumber: number;
  gasUsed: string;
  deployedAt: number;
}