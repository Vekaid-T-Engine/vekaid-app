# Data Engineering & System Design Quality Gate

Inspired by DDIA (https://dataintensive.net/) and original engineering guidance. Apply proportionately to all future projects.

1. Identify entities, access patterns, invariants, ownership, trust boundaries and retention.
2. Select storage based on measured needs; document trade-offs. Avoid distributed infrastructure without justification.
3. Validate inputs and schemas; use stable identifiers and atomic transactions for related writes.
4. Design additive migrations; test old fixtures, interrupted upgrades, rollback or forward recovery. Never erase user data to resolve a migration.
5. Benchmark representative queries before adding indexes; measure write overhead, p95 latency and storage.
6. Define backup, restore verification, RPO/RTO, and privacy requirements. Test recovery in isolation.
7. For networked systems, specify timeouts, bounded retries, idempotency, deduplication, ordering, consistency and conflict handling. Test partial failures.
8. For distributed systems, document replication, partition keys, hot spots, consensus assumptions and operational costs.
9. For event pipelines, validate provenance, freshness, schemas and replay behavior. Preserve last known good data.
10. Release only after applicable migration, integrity, security, accessibility, performance and recovery checks; record evidence and explicitly mark untested items. No fabricated test results.

VEKAID: IndexedDB remains the local source of truth for user data. No new backend or paid API required. Academy lesson identifiers currently depend on array positions; append only until stable-ID migration is tested. Future work: validated restore, atomic multi-store export, indexed queries where benchmarks justify them, and cross-device synchronization only after conflict policy is defined.
