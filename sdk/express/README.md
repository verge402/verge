# @verge/express

Express middleware for HTTP 402 micropayments on Base via [Verge](https://verge.so).

```bash
npm install @verge/express
```

## Quick start

```ts
import express from "express";
import { paywall } from "@verge/express";

const app = express();

app.use("/api/premium", paywall({
  amount: 0.001,                       // USDC
  recipient: process.env.WALLET!,
  network: "Base-mainnet",
}));

app.get("/api/premium", (req, res) => {
  res.json({ ok: true, message: "unlocked" });
});

app.listen(3000);
```

## How it works

1. First request to a `paywall()`-guarded route returns **HTTP 402 Payment Required** with a signed challenge.
2. The caller pays USDC on Base, including the nonce as a memo.
3. The caller retries with `X-Pay-Tx: <signature>`. The middleware verifies on-chain via Helius (or the RPC you provide).
4. If valid, the request flows to your handler.

## Options

```ts
paywall({
  amount,            // Price in USDC, e.g. 0.001
  recipient,         // Your Base address
  network,           // "Base-mainnet" | "Base-devnet"
  rpcUrl,            // Optional custom RPC (defaults to Helius if HELIUS_API_KEY set)
  tokenMint,         // Optional custom SPL token mint (defaults to USDC)
  verify,            // Optional: custom verifier function (req, tx, nonce) → boolean
  realm,             // Optional: realm name in WWW-Authenticate header (default "verge")
});
```

## Self-hosted facilitator

Skip Verge entirely — set `rpcUrl` to your own Helius/Triton endpoint. Zero fees.

```ts
paywall({
  amount: 0.001,
  recipient: process.env.WALLET!,
  rpcUrl: "https://my-helius.helius-rpc.com/?api-key=…",
});
```

## License

MIT
