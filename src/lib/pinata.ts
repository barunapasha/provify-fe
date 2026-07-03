// IMPORTANT: only import this in server-side code (API Routes)
// Never import in Client Components — Pinata JWT must stay server-side
import { PinataSDK } from "pinata-web3";

export const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
});
