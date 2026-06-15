// Server-side proxy to a Base RPC for live network stats.
// Keeps any API keys server-side and bypasses browser CORS restrictions.
//
// Returns: current block number, gas price (gwei), latest block hash (truncated),
// and a server timestamp.

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 2; // cache 2s

const RPC_URL =
  process.env.BASE_RPC_URL ||
  (process.env.ALCHEMY_API_KEY
    ? `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
    : "https://mainnet.base.org");

async function rpc(method: string, params: unknown[] = []) {
  const r = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    next: { revalidate: 2 },
  });
  if (!r.ok) throw new Error(`RPC ${method} → ${r.status}`);
  const json = await r.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

function shortHash(h: string): string {
  if (!h || h.length < 12) return h ?? "";
  return `${h.slice(0, 6)}…${h.slice(-4)}`;
}

export async function GET() {
  try {
    const [blockNumberHex, gasPriceHex, block] = await Promise.all([
      rpc("eth_blockNumber"),
      rpc("eth_gasPrice"),
      rpc("eth_getBlockByNumber", ["latest", false]),
    ]);

    const blockNumber = parseInt(blockNumberHex, 16);
    const gasPriceGwei = Math.round(parseInt(gasPriceHex, 16) / 1e9 * 100) / 100;

    return NextResponse.json({
      ok: true,
      block: blockNumber,
      gasPriceGwei,
      latestBlockHash: shortHash(block?.hash ?? ""),
      ts: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: String(e?.message || e),
        block: null,
        gasPriceGwei: null,
        latestBlockHash: "—",
        ts: new Date().toISOString(),
      },
      { status: 200 },
    );
  }
}
