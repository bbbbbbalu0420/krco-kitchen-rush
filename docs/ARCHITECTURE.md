# Architecture overview

```mermaid
flowchart LR
  subgraph Clients["iPhone / Mac clients (2–4)"]
    C1[Player input<br/>prediction + replica]
  end
  subgraph Server["Dedicated server (Linux ARM64 IL2CPP)"]
    A[Authoritative kitchen<br/>orders · guests · stations · items]
    K[(Durable checkpoint<br/>HMAC · fsync · incarnation fence)]
    S[Settlement signer]
  end
  subgraph Cloud["Unity Gaming Services"]
    CC[Cloud Code endpoint<br/>verifies server signature]
    CS[(Cloud Save<br/>private profile buckets)]
    LB[(Weekly co-op leaderboard)]
  end
  C1 -- intents --> A
  A -- snapshots / acks --> C1
  A <--> K
  A --> S
  S -- signed statement --> C1
  C1 -- redeem own statement --> CC
  CC -- once-credit (CAS) --> CS
  CC -- server-written score --> LB
```

## Principles

- **The server decides.** Clients send intents (move, use station, choose recipe). Results, items, rewards and timers are computed by the authority and replicated.
- **Stable identity everywhere.** Every ingredient, dish, tray and plate has an immutable ID; replays and rejoins can be checked exactly.
- **Commit before acknowledge.** The authority's checkpoint is durable before the frame's acknowledgements are sent, so an acknowledged action survives a crash.
- **Fencing, not hope.** A restarted server advances a durable incarnation before admitting anyone; tickets and RPC epochs from before the crash stop working.
- **Rewards are recomputed, never copied.** The cloud trusts only a statement signed by the dedicated server, bound to the redeeming account, and applies a fixed policy with a once-receipt in the same atomic write.
- **Privacy by default.** Public restaurant listing is opt-in; leaderboards and directories never expose account IDs.
