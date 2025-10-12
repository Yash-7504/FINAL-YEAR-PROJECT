export interface PublicKey {
  pub_seed: string;
  root: string;
  n: number;
  h: number;
  d: number;
  w: number;
}

export interface Signature {
  wots_signature: string[];
  auth_path: string[];
  tree_index: number;
  leaf_index: number;
  message_digest: string;
  randomness: string;
}

export interface KeyPair {
  privateKey: {
    sk_seed: string;
    sk_prf: string;
    pub_seed: string;
    n: number;
    h: number;
    d: number;
    w: number;
  };
  publicKey: PublicKey;
}
