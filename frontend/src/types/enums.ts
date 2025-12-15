export enum ContractStatus {
  PENDING = 'pending',
  DEPLOYED = 'deployed',
  VERIFIED = 'verified',
  FAILED = 'failed'
}

export enum NetworkType {
  MAINNET = 'mainnet',
  SEPOLIA = 'sepolia',
  LOCALHOST = 'localhost'
}

export enum SignatureStatus {
  UNSIGNED = 'unsigned',
  SIGNED = 'signed',
  VERIFIED = 'verified',
  INVALID = 'invalid'
}