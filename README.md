<div align="center">

<img src="public/banner.jpg?v=2" alt="Verge HTTP 402 for AI agents on Base" width="100%"/>

# verge

**HTTP 402 for AI agents.** Base-native facilitator for x402 micropayments. Settled in 400ms, 0.5% fee.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](./LICENSE)
[![Base](https://img.shields.io/badge/Base-mainnet-9945FF?style=flat-square&logo=Base&logoColor=white)](https://Base.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![Stars](https://img.shields.io/badge/stars-24-yellow?style=flat-square&logo=github)](https://github.com/verge402/verge/stargazers)
[![Status](https://img.shields.io/badge/status-LIVE-10b981?style=flat-square)]()
[![$VERGE](https://img.shields.io/badge/$VERGE-Clanker-blue?style=flat-square)](https://www.clanker.world/clanker/0xc5F069Bf8b8eCc19f0fB70Eb6884781B0132AB07)

[Website](https://verge402.fun) · [Twitter](https://x.com/vergesnowyx402) · [$VERGE on Clanker](https://www.clanker.world/clanker/0xc5F069Bf8b8eCc19f0fB70Eb6884781B0132AB07) · [Docs](./app/docs/page.tsx) · [SDK](./sdk/express) · [x402 Spec](https://www.x402.org)

**CA:** `0xc5F069Bf8b8eCc19f0fB70Eb6884781B0132AB07`

</div>

---

## What is Verge?

A drop-in middleware that lets any HTTP endpoint speak the **HTTP 402 "Payment Required"** protocol — agents pay USDC on Base, your endpoint unlocks, ~400ms end-to-end.

```ts
import { paywall } from "@verge/express";

app.use("/api/premium", paywall({
  amount: 0.001,                       // USDC
  recipient: process.env.WALLET,
  network: "Base-mainnet",
}));
```

That's the whole integration.

## Why Base?

| Network         | Block time | Tx fee     | Verdict for $0.001 calls |
|-----------------|------------|------------|--------------------------|
| **Base**      | 400ms      | ~$0.0001   | ✓ usable                 |
| Ethereum L1     | 12s        | $0.50–5    | ✗ fee > payment          |
| Base / Arbitrum | ~2s        | $0.05–0.30 | ✗ still loss on micro    |
| Stripe          | 1–3 days   | $0.30 + 2.9% | ✗ minimum $0.50          |

x402 is interesting on every chain. It's only **useful** on Base.

## Repo layout

```
verge/
├── app/                          # Next.js 16 landing + /docs + /api/{demo,waitlist}
├── components/                   # React components (Hero, ScrollCube, Pricing, …)
├── sdk/express/                  # @verge/express — npm-publishable middleware
├── public/                       # banner.jpg + avatar.jpg (design by @hellokent)
├── BRAND_BRIEF.md                # Brand guidelines + visual world
└── README.md
```

## Develop

```bash
npm install
npm run dev   # → http://localhost:3000
```

## SDK

```bash
cd sdk/express
npm install
npm run build
# → dist/index.js + dist/index.d.ts (ready to publish to npm)
```

See [`sdk/express/README.md`](./sdk/express/README.md) for full API surface and verification options (Helius, Triton, BYO RPC).

## Stack

- **Next.js 16** (App Router) + **React 19**
- **Tailwind 4** (CSS-first config)
- **Motion** (Framer) for hero/scroll animations + 3D scroll-linked cube
- **@Base/web3.js** for on-chain tx verification

## Pricing

| | Fee | Settlement | Min tx |
|---|---|---|---|
| **Verge** facilitator | **0.5%** | ~400ms | $0.001 |
| Stripe | 2.9% + $0.30 | 1–3 days | $0.50 |
| Self-host (`@verge/facilitator`) | 0% | ~400ms | $0.001 |

Self-hosted means **you** run the facilitator on **your** Base RPC — no Verge in the loop, just our open-source code.

## Roadmap

- [x] x402 challenge / replay flow
- [x] On-chain USDC verification via Helius
- [x] Express middleware
- [ ] Hono + Fastify adapters (Q2 2026)
- [ ] Self-host facilitator binary (Q2 2026)
- [ ] x402 marketplace — index of paid endpoints (Q3 2026)
- [ ] Recursive ZK proofs for batch settlement (Q4 2026)

## License

MIT © 2026 Verge Labs
