import { Program, AnchorProvider, type Idl } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { IDL } from "@/idl/provify_contract";

export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID ??
    "7px9KgeAgyrx8juwhcHfhzRc6fbkMT1gdMUtQpaDue7W"
);

/**
 * Create an Anchor Program instance using the connected wallet.
 * Call this from client components that have access to AnchorWallet.
 *
 * In Anchor v0.30+, the program ID is read from the IDL's `address` field.
 */
export function getProgram(
  connection: Connection,
  wallet: {
    publicKey: PublicKey;
    signTransaction: (...args: unknown[]) => Promise<unknown>;
    signAllTransactions: (...args: unknown[]) => Promise<unknown>;
  }
): Program {
  const provider = new AnchorProvider(
    connection,
    wallet as never,
    AnchorProvider.defaultOptions()
  );

  return new Program(IDL as Idl, provider);
}
