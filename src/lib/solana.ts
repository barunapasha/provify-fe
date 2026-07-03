import { Connection, clusterApiUrl } from "@solana/web3.js";

export const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC ?? clusterApiUrl("devnet"),
  "confirmed"
);
