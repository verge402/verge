// @verge/express — Express middleware for HTTP 402 micropayments on Base.
//
// Usage:
//
//   import { paywall } from "@verge/express";
//
//   app.use("/api/premium", paywall({
//     amount: 0.001,
//     recipient: process.env.WALLET!,
//     network: "base-mainnet",
//   }));
//
// On first request, returns 402 with a signed challenge.
// On replay with X-Pay-Tx header, verifies the tx on Base and unlocks.

import type { Request, Response, NextFunction, RequestHandler } from "express";
import { randomBytes } from "node:crypto";
import { createPublicClient, http, parseUnits, type Address, type Hash } from "viem";
import { base, baseSepolia } from "viem/chains";

export interface PaywallOptions {
  /** Price in USDC (e.g. 0.001 = $0.001) */
  amount: number;
  /** Base address that receives the payment (0x…) */
  recipient: string;
  /** Network: base-mainnet | base-sepolia */
  network?: "base-mainnet" | "base-sepolia";
  /** RPC endpoint. Defaults to Alchemy if ALCHEMY_API_KEY is set, else public Base RPC. */
  rpcUrl?: string;
  /** Custom verifier — return true to unlock. Overrides default on-chain verification. */
  verify?: (req: Request, tx: string, nonce: string) => Promise<boolean> | boolean;
  /** Realm name advertised in WWW-Authenticate */
  realm?: string;
}

// USDC on Base (6 decimals)
const USDC_MAINNET = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address;
const USDC_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as Address;

// ERC-20 Transfer(address,address,uint256) topic
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

function defaultRpcUrl(network: string): string {
  if (process.env.ALCHEMY_API_KEY) {
    return network === "base-sepolia"
      ? `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
      : `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
  }
  return network === "base-sepolia"
    ? "https://sepolia.base.org"
    : "https://mainnet.base.org";
}

export function paywall(opts: PaywallOptions): RequestHandler {
  const network = opts.network || "base-mainnet";
  const usdcAddress = network === "base-sepolia" ? USDC_SEPOLIA : USDC_MAINNET;
  const rpcUrl = opts.rpcUrl || defaultRpcUrl(network);
  const realm = opts.realm || "verge";

  const client = createPublicClient({
    chain: network === "base-sepolia" ? baseSepolia : base,
    transport: http(rpcUrl),
  });

  return async (req: Request, res: Response, next: NextFunction) => {
    const tx = req.header("x-pay-tx");
    const nonce = req.header("x-pay-nonce") || "";

    // No payment header — issue challenge
    if (!tx) {
      const challengeNonce = randomBytes(6).toString("hex");
      res.status(402);
      res.set({
        "WWW-Authenticate": `x402 realm="${realm}", nonce="${challengeNonce}", amount="${opts.amount}", recipient="${opts.recipient}", network="${network}"`,
        "X-Pay-Token": "USDC",
        "X-Pay-Network": network,
        "X-Pay-Amount": String(opts.amount),
        "X-Pay-Recipient": opts.recipient,
        "X-Pay-Nonce": challengeNonce,
      });
      res.json({
        error: "Payment required",
        code: "PAYMENT_REQUIRED",
        challenge: {
          nonce: challengeNonce,
          amount: opts.amount,
          token: "USDC",
          tokenContract: usdcAddress,
          network,
          recipient: opts.recipient,
          memo: `${realm}:${challengeNonce}`,
        },
      });
      return;
    }

    // Replay — verify on-chain
    try {
      const ok = opts.verify
        ? await opts.verify(req, tx, nonce)
        : await defaultVerify({ client, tx: tx as Hash, recipient: opts.recipient, amount: opts.amount, usdcAddress });
      if (!ok) {
        res.status(402).json({ error: "Tx verification failed", code: "TX_INVALID" });
        return;
      }
      next();
    } catch (e: any) {
      res.status(402).json({ error: "Verification error", code: "TX_ERROR", detail: String(e?.message || e) });
    }
  };
}

interface VerifyArgs {
  client: ReturnType<typeof createPublicClient>;
  tx: Hash;
  recipient: string;
  amount: number;
  usdcAddress: Address;
}

async function defaultVerify({ client, tx, recipient, amount, usdcAddress }: VerifyArgs): Promise<boolean> {
  if (!tx || tx.length < 66) return false;

  const receipt = await client.getTransactionReceipt({ hash: tx });
  if (!receipt || receipt.status !== "success") return false;

  // USDC has 6 decimals
  const amountRaw = parseUnits(String(amount), 6);
  const recipientLower = recipient.toLowerCase();

  for (const log of receipt.logs) {
    if (
      log.address.toLowerCase() !== usdcAddress.toLowerCase() ||
      log.topics[0] !== TRANSFER_TOPIC ||
      log.topics.length < 3
    ) continue;

    // topics[2] = "to" address (padded to 32 bytes)
    const toAddr = ("0x" + log.topics[2].slice(26)).toLowerCase();
    if (toAddr !== recipientLower) continue;

    const value = BigInt(log.data);
    if (value >= amountRaw) return true;
  }
  return false;
}

export type { Request, Response, NextFunction } from "express";
