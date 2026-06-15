// Demo merchant endpoint — show-and-tell of the x402 flow.
//
// First call returns 402 with a challenge.
// Replay with X-Pay-Tx header → 200 with payload.
//
// (Currently the tx isn't actually verified on-chain — this is the public demo
// for the landing page. The real SDK in /sdk/express verifies via Base RPC.)

import { NextRequest } from "next/server";
import { randomBytes } from "node:crypto";

export const runtime = "nodejs";

const PRICE_USDC = 0.001;
const RECIPIENT = process.env.DEMO_MERCHANT_WALLET || "7AaaqmRoboLayerD1emoMerchantWaLLetq9Px";
const NETWORK = "Base-mainnet";

export async function GET(req: NextRequest) {
  const tx = req.headers.get("x-pay-tx");
  const nonce = req.headers.get("x-pay-nonce");

  // Replay attempt — caller sent a tx signature
  if (tx) {
    // In production: verify the tx on-chain via Base RPC, match nonce in memo, check amount + recipient.
    // For the demo, we accept any EVM tx hash (0x + 64 hex chars = 66 chars).
    if (tx.length >= 66 && tx.startsWith("0x")) {
      return Response.json({
        ok: true,
        unlocked_at: new Date().toISOString(),
        payload: {
          message: "✓ Payment verified. You unlocked the premium endpoint.",
          tx,
          nonce,
        },
      });
    }
    return Response.json(
      { error: "Invalid tx signature", code: "TX_INVALID" },
      { status: 402 },
    );
  }

  // First call — issue 402 challenge
  const challengeNonce = randomBytes(6).toString("hex");
  return new Response(
    JSON.stringify({
      error: "Payment required",
      code: "PAYMENT_REQUIRED",
      challenge: {
        nonce: challengeNonce,
        amount: PRICE_USDC,
        token: "USDC",
        network: NETWORK,
        recipient: RECIPIENT,
        memo: `verge:${challengeNonce}`,
      },
      retry: {
        method: "GET",
        url: "/api/demo",
        headers_required: ["x-pay-tx", "x-pay-nonce"],
      },
    }),
    {
      status: 402,
      headers: {
        "Content-Type": "application/json",
        "WWW-Authenticate": `x402 realm="verge", nonce="${challengeNonce}", amount="${PRICE_USDC}", recipient="${RECIPIENT}", network="${NETWORK}"`,
        "X-Pay-Token": "USDC",
        "X-Pay-Network": NETWORK,
        "X-Pay-Amount": String(PRICE_USDC),
        "X-Pay-Recipient": RECIPIENT,
        "X-Pay-Nonce": challengeNonce,
      },
    },
  );
}
