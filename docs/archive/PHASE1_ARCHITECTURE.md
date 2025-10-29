# 🏗️ Phase 1 Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER LAYER                                │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Mobile  │  │   Web    │  │   POS    │  │   API    │       │
│  │   App    │  │  Client  │  │  System  │  │  Client  │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
└───────┼────────────┼─────────────┼─────────────┼──────────────┘
        │            │             │             │
        └────────────┴─────────────┴─────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                       API LAYER                                  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Express.js REST API Server                      │  │
│  │                                                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │   Receipt    │  │    User      │  │    NFT       │   │  │
│  │  │   Routes     │  │   Routes     │  │   Routes     │   │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │  │
│  │         │                 │                 │             │  │
│  │  ┌──────▼──────────────────▼─────────────────▼────────┐  │  │
│  │  │       HCS Receipt Routes (Phase 1 NEW!)           │  │  │
│  │  │  POST /receipts/:id/anchor                        │  │  │
│  │  │  GET  /receipts/:id/verify                        │  │  │
│  │  │  GET  /receipts/:id/proof                         │  │  │
│  │  └─────────────────────┬─────────────────────────────┘  │  │
│  └────────────────────────┼────────────────────────────────┘  │
└───────────────────────────┼───────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                   SERVICE LAYER                                  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         HCS Receipt Service (Phase 1)                    │  │
│  │  • generateReceiptHash()                                 │  │
│  │  • anchorReceipt()                                       │  │
│  │  • verifyReceipt()                                       │  │
│  │  • getReceiptProof()                                     │  │
│  │  • bulkAnchorReceipts()                                  │  │
│  └──────────────────────────┬───────────────────────────────┘  │
│                             │                                   │
│  ┌──────────────────────────▼───────────────────────────────┐  │
│  │              DLT Gateway (Phase 1)                        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │  │
│  │  │     HCS     │  │     HTS     │  │    HSCS     │     │  │
│  │  │  Methods    │  │  Methods    │  │  Methods    │     │  │
│  │  │  (Active)   │  │ (Phase 2)   │  │ (Phase 3)   │     │  │
│  │  └──────┬──────┘  └─────────────┘  └─────────────┘     │  │
│  │         │                                                 │  │
│  │  • publishToHCS()                                        │  │
│  │  • subscribeToHCS()                                      │  │
│  │  • getHCSMessages()                                      │  │
│  │  • createToken()         ← Ready for Phase 2            │  │
│  │  • mintNFT()             ← Ready for Phase 2            │  │
│  │  • callContract()        ← Ready for Phase 3            │  │
│  └──────────────────────────┬───────────────────────────────┘  │
└───────────────────────────┬─┼───────────────────────────────────┘
                            │ │
                    ┌───────┘ └───────┐
                    │                 │
┌───────────────────▼──┐   ┌──────────▼───────────────────────────┐
│  DATABASE LAYER      │   │   BLOCKCHAIN LAYER                   │
│                      │   │                                      │
│  PostgreSQL/SQLite   │   │   Hedera Network (Testnet)          │
│                      │   │                                      │
│  ┌────────────────┐ │   │  ┌────────────────────────────────┐ │
│  │   receipts     │ │   │  │  Hedera Consensus Service      │ │
│  │   ─────────    │ │   │  │  (HCS)                         │ │
│  │   • id         │ │   │  │                                │ │
│  │   • user_id    │ │   │  │  ┌──────────────────────────┐ │ │
│  │   • total      │ │   │  │  │  Receipt Topic           │ │ │
│  │   • items      │ │   │  │  │  ID: 0.0.XXXXX           │ │ │
│  │   ─────────    │ │   │  │  │                          │ │ │
│  │   NEW FIELDS:  │ │   │  │  │  Messages:               │ │ │
│  │   • hcs_topic  │◄├───┼──┼──┤  - Receipt Hash          │ │ │
│  │   • hcs_seq    │◄├───┼──┼──┤  - Timestamp             │ │ │
│  │   • hcs_ts     │◄├───┼──┼──┤  - Merchant ID (hashed)  │ │ │
│  │   • receipt_   │◄├───┼──┼──┤  - Total Amount          │ │ │
│  │     hash       │ │   │  │  │  - Currency              │ │ │
│  └────────────────┘ │   │  │  └──────────────────────────┘ │ │
│                      │   │  │                                │ │
│  ┌────────────────┐ │   │  │  Running Hash Chain:          │ │
│  │  hcs_events    │ │   │  │  Message 1 → Message 2 →      │ │
│  │  ─────────     │ │   │  │  Message 3 → ...              │ │
│  │  • topic_id    │ │   │  │  (Immutable, Tamper-Proof)    │ │
│  │  • sequence    │ │   │  │                                │ │
│  │  • timestamp   │ │   │  └────────────────────────────────┘ │
│  │  • message     │ │   │                                      │
│  │  • processed   │ │   │  ┌────────────────────────────────┐ │
│  └────────────────┘ │   │  │  Mirror Node API               │ │
│                      │   │  │  (Query Historical Data)       │ │
│  ┌────────────────┐ │   │  │                                │ │
│  │  hcs_topics    │ │   │  │  GET /topics/{id}/messages     │ │
│  │  ─────────     │ │   │  │  GET /transactions/{id}        │ │
│  │  • topic_id    │ │   │  │  GET /accounts/{id}            │ │
│  │  • purpose     │ │   │  └────────────────────────────────┘ │
│  │  • created_at  │ │   │                                      │
│  └────────────────┘ │   └──────────────────────────────────────┘
└──────────────────────┘

```

---

## Data Flow: Receipt Anchoring

```
1. USER UPLOADS RECEIPT
   ↓
2. BACKEND VALIDATES & STORES IN DB
   │
   ├─→ receipts table (full data)
   │   • Image, OCR data, items, etc.
   │
   └─→ CALL: hcsService.anchorReceipt()
       ↓
3. GENERATE RECEIPT HASH
   │
   └─→ SHA-256 of: {id, merchant, total, date, items}
       ↓
4. PREPARE PRIVACY-SAFE DATA
   │
   └─→ {receiptId, hash, timestamp, merchantId (hashed), total, currency}
       ↓
5. DLT GATEWAY → HEDERA HCS
   │
   └─→ publishToHCS(receiptTopicId, data)
       ↓
6. HEDERA NETWORK PROCESSES
   │
   ├─→ Consensus reached
   ├─→ Message added to topic
   ├─→ Running hash updated
   └─→ Timestamp assigned
       ↓
7. STORE HCS METADATA IN DB
   │
   └─→ UPDATE receipts SET
       hcs_topic_id = ...,
       hcs_sequence = ...,
       hcs_timestamp = ...,
       receipt_hash = ...
       ↓
8. RETURN PROOF TO USER
   │
   └─→ {receiptHash, hcsTopicId, hcsSequence, hcsTimestamp}
```

---

## Data Flow: Receipt Verification

```
1. USER REQUESTS VERIFICATION
   │
   └─→ GET /api/receipts/{id}/verify
       ↓
2. FETCH RECEIPT FROM DATABASE
   │
   └─→ SELECT * FROM receipts WHERE id = ...
       ↓
3. FETCH HCS MESSAGE
   │
   └─→ Mirror Node API: GET /topics/{topicId}/messages/{sequence}
       ↓
4. COMPARE HASHES
   │
   ├─→ Database hash: abc123...
   ├─→ HCS hash: abc123...
   └─→ Match? YES/NO
       ↓
5. RETURN VERIFICATION RESULT
   │
   └─→ {isValid: true/false, proof: {...}}
```

---

## Component Interactions

```
┌─────────────────────────────────────────────────────────────┐
│                    PHASE 1 COMPONENTS                        │
└─────────────────────────────────────────────────────────────┘

API Routes (hcsReceipts.js)
        │
        │ calls
        ▼
HCS Receipt Service (hcsReceiptService.js)
        │
        │ uses
        ▼
DLT Gateway (dltGateway.js)
        │
        │ interacts with
        ▼
Hedera SDK (@hashgraph/sdk)
        │
        │ sends transactions to
        ▼
Hedera Network (HCS, HTS, HSCS)
        │
        │ consensus data available via
        ▼
Mirror Node API
        │
        │ queries by
        ▼
DLT Gateway
        │
        │ returns data to
        ▼
HCS Receipt Service
        │
        │ stores in
        ▼
Database (receipts, hcs_events, hcs_topics)
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   PRIVACY LAYERS                             │
└─────────────────────────────────────────────────────────────┘

ON-CHAIN (Public, Immutable)
├─ Receipt Hash (SHA-256)        ✅ Verification only
├─ Merchant ID (Hashed)           ✅ Privacy-preserving
├─ User ID (Hashed)               ✅ Privacy-preserving
├─ Total Amount                   ✅ Aggregate data
├─ Currency                       ✅ Public info
└─ Item Count                     ✅ Aggregate data

OFF-CHAIN (Private, Access-Controlled)
├─ User personal info             🔒 Database only
├─ Merchant details               🔒 Database only
├─ Receipt images                 🔒 Database only
├─ OCR data                       🔒 Database only
├─ Item descriptions              🔒 Database only
└─ Payment methods                🔒 Database only

VERIFICATION LINK
└─ Receipt Hash connects on-chain ↔ off-chain data
   (Anyone can verify hash, only authorized users see details)
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   PRODUCTION SETUP                           │
└─────────────────────────────────────────────────────────────┘

[Railway/Heroku/AWS]
        │
        ├─ Backend API Server
        │   ├─ DLT Gateway Service
        │   ├─ HCS Receipt Service
        │   └─ API Routes
        │
        ├─ PostgreSQL Database
        │   ├─ receipts table
        │   ├─ hcs_events table
        │   └─ hcs_topics table
        │
        └─ Environment Variables
            ├─ HEDERA_OPERATOR_ID
            ├─ HEDERA_OPERATOR_KEY
            ├─ HCS_RECEIPT_TOPIC_ID
            └─ HEDERA_NETWORK=mainnet

[Hedera Mainnet]
        │
        ├─ HCS Topic (Receipt Anchoring)
        ├─ Consensus Nodes (Decentralized)
        └─ Mirror Nodes (Query API)

[External Verifiers]
        │
        └─ Can query Mirror Node directly
            to verify receipts without
            trusting ReceiptoVerse
```

---

## Future Phases Preview

```
PHASE 1 (Current) ✅
    HCS Receipt Anchoring
            │
            ▼
PHASE 2 (Next) 🚧
    HTS Reward Tokens
    • Create RVP token
    • Mint to users
    • Token transfers
            │
            ▼
PHASE 3 🔜
    Smart Contracts
    • NFT Benefits Manager
    • Upgrade mechanics
            │
            ▼
PHASE 4 🔜
    Event Indexer
    • Real-time sync
    • Background workers
            │
            ▼
PHASE 5 🔜
    SDKs
    • Merchant SDK
    • Wallet SDK
    • Developer SDK
```

---

## Key Metrics Dashboard (Conceptual)

```
┌─────────────────────────────────────────────────────────────┐
│              RECEIPTOVERSE - HCS METRICS                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📋 Total Receipts Anchored:        1,234,567               │
│  ⏱️  Average Anchoring Time:        3.2 seconds             │
│  ✅ Verification Success Rate:      99.99%                  │
│  💰 Total Cost (Month):             $123.45                 │
│  📊 Messages per Day:               41,234                  │
│  🔗 HCS Topic ID:                   0.0.12345               │
│  🌐 Network:                        Mainnet                 │
│  🪞 Mirror Node Status:             Healthy                 │
│                                                              │
│  Recent Anchors:                                            │
│  • Receipt #12345 ✅ 2 sec ago                              │
│  • Receipt #12346 ✅ 5 sec ago                              │
│  • Receipt #12347 ✅ 8 sec ago                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

**Phase 1 Architecture is complete and production-ready! 🎉**
