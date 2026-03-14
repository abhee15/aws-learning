import type { Topic } from '../../types/topic';

export const databasesTopic: Topic = {
  id: 'databases',
  slug: 'databases',
  title: 'Databases: RDS, Aurora, DynamoDB & More',
  shortTitle: 'Databases',
  icon: 'Database',
  color: 'indigo',
  examDomains: ['new-solutions', 'continuous-improvement', 'cost-optimization'],
  estimatedStudyHours: 8,
  summaryBullets: [
    'Aurora Global Database: <1s RPO, ~1min RTO cross-region — not the same as Multi-AZ',
    'DynamoDB: single-digit ms at any scale. Partition key design is the #1 exam decision',
    'ElastiCache: Redis for persistence/pub-sub/Lua; Memcached for pure horizontal cache sharding',
    'RDS Proxy reduces connection overhead for Lambda→RDS — mandatory for serverless workloads',
    'DynamoDB DAX for microsecond reads; does NOT help write-heavy or strongly-consistent workloads',
  ],
  relatedTopics: ['serverless', 'security', 'networking'],
  solutionArchitectures: [
    {
      id: 'db-arch-cqrs',
      title: 'CQRS with DynamoDB + OpenSearch',
      description: 'Separates command (write) and query (read) paths. DynamoDB handles high-throughput writes; OpenSearch provides rich full-text search and complex queries. DynamoDB Streams keeps them in sync.',
      useCase: 'Product catalogs needing full-text search, e-commerce with complex filtering, any workload where DynamoDB\'s key-based query model is insufficient for read patterns',
      components: [
        { name: 'DynamoDB (Command)', role: 'Primary write store — single-digit ms writes, infinite scale. Partition key designed for write distribution' },
        { name: 'DynamoDB Streams', role: 'Captures every insert/update/delete as an ordered stream (24hr retention). NEW_AND_OLD_IMAGES stream view for full change capture' },
        { name: 'Lambda (sync)', role: 'Triggered by DynamoDB Streams — transforms change records and indexes them into OpenSearch. Handles retries on OpenSearch failures' },
        { name: 'OpenSearch (Query)', role: 'Full-text search index. Handles complex queries: fuzzy search, faceted filtering, geo-distance, aggregations — patterns impossible in DynamoDB' },
        { name: 'API Gateway', role: 'Routes write requests to DynamoDB service and read/search requests to OpenSearch query Lambda' },
      ],
      dataFlow: [
        'Write: Client → API Gateway → Lambda → DynamoDB PutItem (synchronous, 1-digit ms response)',
        'Sync: DynamoDB Streams → Lambda (async) → OpenSearch IndexDocument (typically <1s lag)',
        'Read: Client → API Gateway → Lambda → OpenSearch query → return results with pagination',
        'On OpenSearch failure: Lambda retries (3 attempts) → sends to SQS DLQ → CloudWatch alarm → manual reprocessing',
      ],
      keyDecisions: [
        'Use TRIM_HORIZON iterator on Streams → ensures all historical changes are processed if sync Lambda has downtime',
        'Idempotent OpenSearch writes — use DynamoDB item version as OpenSearch document version to handle duplicate stream events',
        'Consider ElasticSearch index templates for field mapping — prevent mapping explosions from dynamic field types',
        'OpenSearch is eventually consistent with DynamoDB — communicate this to frontend; stale search results are expected immediately after writes',
      ],
      tradeoffs: [
        { pro: 'DynamoDB scales writes infinitely; OpenSearch scales complex reads independently', con: 'Eventual consistency between stores — reads may lag writes by up to 1-2 seconds' },
        { pro: 'Each store is optimized for its workload — best cost/performance profile', con: 'Operational complexity: two data stores, sync Lambda, DLQ handling, index mapping management' },
      ],
      examAngle: 'When a question describes DynamoDB for writes + need for "full-text search" or "complex query capabilities" → DynamoDB Streams + Lambda + OpenSearch. The Streams Lambda must be idempotent because Streams delivers events at-least-once.',
    },
    {
      id: 'db-arch-global-active-active',
      title: 'Multi-Region Active-Active with DynamoDB Global Tables',
      description: 'DynamoDB Global Tables replicate data across multiple AWS regions with multi-active writes. Any region can accept reads and writes — no primary/secondary topology.',
      useCase: 'Global applications requiring low-latency reads and writes from multiple continents, gaming leaderboards, session stores, applications needing regional isolation for data residency compliance',
      components: [
        { name: 'DynamoDB Global Table', role: 'Single table replicated across 3+ regions. Each replica is a full copy. All replicas accept reads and writes.' },
        { name: 'DynamoDB Streams', role: 'Underlying replication mechanism — changes in each region stream to all other regions via the Global Tables replication infrastructure' },
        { name: 'Route 53 Latency Routing', role: 'Routes clients to nearest region\'s API endpoint. Automatically fails over to next-nearest region if health check fails' },
        { name: 'Lambda (per region)', role: 'Regional compute — executes in the same region as the user\'s DynamoDB write to minimize cross-region round trips' },
        { name: 'DAX (optional)', role: 'Per-region in-memory cache for read-heavy hot items — microsecond reads without hitting DynamoDB replication lag' },
      ],
      dataFlow: [
        'Client in EU → Route 53 latency routing → eu-west-1 API endpoint → Lambda → DynamoDB eu-west-1 replica write',
        'DynamoDB eu-west-1 → Global Tables replication stream → us-east-1 and ap-southeast-1 replicas (typically <1s)',
        'Client in APAC → Route 53 → ap-southeast-1 → reads local replica (may see replication lag <1s)',
        'Conflict: two regions write same item simultaneously → last-writer-wins (timestamp-based). Application must tolerate this.',
      ],
      keyDecisions: [
        'Design items to avoid write conflicts — use append-only patterns, version counters, or condition expressions',
        'Avoid cross-region transactions — DynamoDB transactions are single-region only',
        'Use version attribute + conditional writes to implement optimistic locking and detect conflicts at application level',
        'Global Tables require streams enabled on all replicas — do not disable streams on individual replicas',
      ],
      tradeoffs: [
        { pro: 'True active-active: any region can accept writes — no primary bottleneck or failover promotion required', con: 'Last-writer-wins conflict resolution — not suitable for financial transactions or inventory management requiring conflict merging' },
        { pro: 'Sub-second RPO globally — replication is near real-time via Streams infrastructure', con: 'Cost: each write is replicated to all regions (N writes for N regions) — cost scales linearly with region count' },
      ],
      examAngle: 'DynamoDB Global Tables = multi-active (all regions read+write). Last-writer-wins conflict resolution. NOT suitable for financial operations requiring ACID across regions. Compare to Aurora Global Database (single writer, readable secondaries, <1s RPO, ~1min RTO for failover).',
    },
  ],
  subtopics: [
    {
      id: 'db-rds',
      title: 'RDS & Aurora Deep Dive',
      sections: [
        {
          id: 'db-rds-ha',
          title: 'RDS High Availability & Replication',
          content: '**RDS Multi-AZ** (synchronous): Standby replica in a different AZ. Automatic failover (~60-120s). Standby is NOT readable — it exists solely for failover. Does not improve read throughput. Supports automated failover for engine upgrades too.\n\n**RDS Read Replicas** (asynchronous): Up to 15 replicas. Can be in different regions (cross-region read replicas). Readable endpoints. Can be promoted to standalone DB (breaks replication). Cross-region replicas incur data transfer costs. Can have Multi-AZ enabled on a read replica.\n\n**RDS Multi-AZ Cluster** (new, 2022+): 1 writer + 2 readable standby instances across 3 AZs. Failover in ~35s. Both standbys are readable — unlike classic Multi-AZ. Uses local NVMe storage for better write performance.\n\n**Automated Backups**: Retained 1-35 days. Point-in-time recovery within retention window. Stored in S3. Backup window causes I/O suspension on single-AZ (not Multi-AZ). Restoring creates a NEW DB instance.\n\n**Manual Snapshots**: Persist beyond instance deletion. Can copy cross-region. Can share with other accounts.',
          keyPoints: [
            { text: 'RDS Multi-AZ standby is NOT readable — it is a synchronous hot standby only for failover', gotcha: true },
            { text: 'RDS Multi-AZ Cluster (3-AZ) has 2 readable standbys and ~35s failover — different from classic 2-AZ Multi-AZ', examTip: true },
            { text: 'Read replicas use asynchronous replication — lag possible. Promote to standalone breaks replication permanently', examTip: true },
            { text: 'Restoring from snapshot creates a NEW DB instance — existing instance is not modified', examTip: true },
          ],
          bestPractices: [
            { pillar: 'reliability', text: 'Always enable Multi-AZ for production RDS instances — synchronous standby ensures automatic failover within 60-120 seconds without manual intervention' },
            { pillar: 'reliability', text: 'Test failover regularly by rebooting with forced failover (via console or CLI) to validate application reconnection logic and connection pool behavior' },
            { pillar: 'operational-excellence', text: 'Set automated backup retention to maximum 35 days for production databases and enable CloudWatch alarms on FreeStorageSpace and DatabaseConnections' },
            { pillar: 'cost-optimization', text: 'Place read replicas in the same region as application read traffic — cross-region replicas incur data transfer costs on every replicated write' },
            { pillar: 'performance', text: 'Use RDS Proxy in front of RDS for Lambda-connected databases — Lambda creates new connections per invocation, exhausting connection pools' },
          ],
          useCases: [
            {
              scenario: 'A SaaS application runs on RDS MySQL in us-east-1. During a planned maintenance window, the DB underwent Multi-AZ failover. The application experienced 5+ minutes of connection errors despite Multi-AZ being enabled.',
              wrongChoices: ['Multi-AZ failover takes longer than expected — this is normal', 'The standby replica had replication lag'],
              correctChoice: 'The application connection pool was not configured to reconnect — it held onto stale connections to the old primary endpoint. Fix: configure connection pool retry and use the cluster endpoint (not static IP)',
              reasoning: 'Multi-AZ failover takes 60-120 seconds. Application must handle reconnection via the RDS DNS endpoint (which updates to new primary). Applications with hardcoded IPs or non-retrying pools will fail longer.',
            },
          ],
        },
        {
          id: 'db-aurora',
          title: 'Aurora Architecture & Advanced Features',
          content: '**Aurora Storage**: Shared cluster storage volume spanning 3 AZs with 6 copies of data (2 per AZ). Self-healing (peer-to-peer replication within storage layer). Storage auto-grows in 10GB increments up to 128TB. Write to 4/6 quorum, read from 3/6 quorum.\n\n**Aurora Endpoints**:\n- **Cluster endpoint**: Writer — always points to current primary\n- **Reader endpoint**: Load-balanced across all read replicas\n- **Custom endpoints**: Subset of instances for specific workloads (e.g., analytics replicas)\n- **Instance endpoints**: Direct connection to specific instance\n\n**Aurora Serverless v2**: Scales in increments of 0.5 ACUs (Aurora Capacity Units). Scales from minimum to maximum in seconds based on load. Supports Multi-AZ, read replicas, Global Database. Ideal for unpredictable or variable workloads, dev/test.\n\n**Aurora Global Database**: One primary region (read-write), up to 5 secondary regions (read-only). Storage-level replication with **<1 second RPO** and **~1 minute RTO** for regional failover (manual promotion needed). Typical replication lag: <1s. Used for: globally distributed reads, DR with minimal data loss, regional isolation.\n\n**Aurora Multi-Master**: (MySQL-compatible) Multiple write nodes across AZs. All nodes can accept writes — application handles conflict resolution. Use when you need write availability even during AZ failure.\n\n**RDS Proxy**: Fully managed proxy that pools and shares DB connections. Reduces connection overhead for Lambda functions (which would otherwise open/close connections per invocation). Supports IAM authentication and Secrets Manager rotation without app changes. Failover handled transparently — up to 66% faster than direct failover.',
          keyPoints: [
            { text: 'Aurora Global DB: <1s RPO across regions via storage-level replication — but RTO ~1min (manual promotion required)', examTip: true },
            { text: 'RDS Proxy is essential for Lambda→RDS: Lambda does not maintain persistent connections, causing connection exhaustion', examTip: true },
            { text: 'Aurora Serverless v2 supports read replicas and Global Database — v1 did not', examTip: true },
            { text: 'Aurora reader endpoint load-balances across ALL replicas including provisioned and Serverless v2 — not just one', examTip: true },
            { text: 'Aurora Multi-Master writes to all nodes — application must handle write conflicts. Not widely used; prefer Global DB for cross-region writes', gotcha: true },
          ],
          bestPractices: [
            { pillar: 'reliability', text: 'Use Aurora Global Database for cross-region DR with <1s RPO — pre-provision the secondary region so promotion completes in ~1 minute during a regional failure' },
            { pillar: 'performance', text: 'Use custom Aurora endpoints to route analytics/reporting queries to dedicated larger-instance replicas, isolating OLAP load from OLTP primary' },
            { pillar: 'cost-optimization', text: 'Use Aurora Serverless v2 for development, staging, and variable-load workloads — scales to 0.5 ACU minimum and eliminates always-on instance costs' },
            { pillar: 'operational-excellence', text: 'Enable Aurora enhanced monitoring and Performance Insights to identify slow queries, wait events, and connection bottlenecks before they cause user-facing issues' },
            { pillar: 'security', text: 'Enable IAM database authentication for Lambda→Aurora connections — eliminates credential management and rotates auth tokens automatically (15-min TTL)' },
          ],
          useCases: [
            {
              scenario: 'A global fintech app needs a relational database that can serve read traffic from EU and APAC regions with minimal latency, while writes originate only from us-east-1. RPO must be under 5 seconds.',
              wrongChoices: ['RDS cross-region read replicas — asynchronous replication can have seconds-to-minutes lag under write load', 'Aurora Multi-Master — conflict resolution complexity is too high for financial transactions'],
              correctChoice: 'Aurora Global Database with primary in us-east-1 and secondary read clusters in eu-west-1 and ap-southeast-1. Storage-level replication achieves <1s RPO.',
              reasoning: 'Aurora Global Database uses dedicated replication infrastructure at the storage layer, achieving sub-second cross-region replication. Read traffic routes to local secondary clusters, writes always go to the primary.',
            },
          ],
          comparisons: [
            {
              headers: ['Feature', 'RDS Multi-AZ', 'Aurora Multi-AZ', 'Aurora Global DB'],
              rows: [
                ['Replication', 'Synchronous (block)', 'Shared storage (6 copies)', 'Storage-level async'],
                ['Read replicas', 'Separate (async)', 'Up to 15 (same storage)', 'Separate secondary regions'],
                ['Failover time', '~60-120s', '~30s', '~1 min (manual)'],
                ['RPO', 'Near-zero (sync)', 'Near-zero', '<1 second'],
                ['Cross-region reads', 'Via cross-region RR', 'Via cross-region RR', 'Native secondary regions'],
                ['Use case', 'HA within region', 'HA + scale within region', 'Global reads + cross-region DR'],
              ],
            },
          ],
        },
        {
          id: 'db-rds-security',
          title: 'RDS Security & Encryption',
          content: '**Encryption at rest**: KMS-managed keys. Must be enabled at creation — cannot encrypt an unencrypted instance directly. Workaround: take snapshot → copy snapshot with encryption → restore from encrypted snapshot. Read replicas must be encrypted if source is encrypted.\n\n**Encryption in transit**: SSL/TLS. Force SSL by setting `rds.force_ssl=1` parameter (PostgreSQL) or `require_secure_transport=ON` (MySQL). Certificates must be rotated (AWS manages this for RDS).\n\n**IAM Database Authentication**: Token-based auth (15-min validity). Works with MySQL and PostgreSQL. No password stored — IAM policy controls access. Ideal for Lambda/EC2 connecting without storing credentials.\n\n**Network isolation**: Always deploy in private subnets. Security groups control access (not NACLs for fine-grained control). VPC endpoints not available for RDS — access via private subnet routing.',
          keyPoints: [
            { text: 'Cannot encrypt an existing unencrypted RDS instance directly — must snapshot → copy encrypted → restore', gotcha: true },
            { text: 'IAM DB authentication uses tokens (15-min TTL) — eliminates credential management for EC2/Lambda workloads', examTip: true },
            { text: 'Encrypted RDS snapshots can be shared across accounts only if using customer-managed KMS key (not AWS managed)', examTip: true },
          ],
        },
      ],
    },
    {
      id: 'db-dynamodb',
      title: 'DynamoDB Deep Dive',
      sections: [
        {
          id: 'db-dynamo-design',
          title: 'DynamoDB Data Modeling & Partition Design',
          content: '**Partition Key (PK)**: Determines which physical partition stores the item. High cardinality = even distribution = good performance. Low cardinality (e.g., status: active/inactive) = hot partitions = throttling.\n\n**Sort Key (SK)**: Optional second component of primary key. Items with same PK but different SK are co-located. Enables range queries, hierarchical data, and access patterns like "get all orders for customer after date X".\n\n**Single Table Design**: Store multiple entity types in one table. Use composite sort keys (e.g., `ORDER#2024-01-01`) and sparse indexes. Reduces table management overhead. Requires upfront access pattern analysis — changing patterns later is costly.\n\n**Partition limits**: Each partition handles up to 3,000 RCU and 1,000 WCU. A single item can be up to 400KB. Large items consume more capacity — consider S3 for large payloads with DynamoDB storing the S3 reference.\n\n**Hot partition mitigation**: Write sharding (add random suffix to PK, then scatter-gather on read), use DAX for hot read items, consider time-based partitioning for time-series data.\n\n**Sparse Index**: GSI where not all items have the indexed attribute. Only items WITH the attribute appear in the index — use for efficient "find all items with status=PENDING" without scanning the whole table.',
          keyPoints: [
            { text: 'DynamoDB partition key design is the most critical SA Pro decision — bad design causes hot partitions and throttling', examTip: true },
            { text: 'Single Table Design requires knowing all access patterns upfront — flexible but hard to change', examTip: true },
            { text: 'Each partition: max 3,000 RCU + 1,000 WCU. Items with same PK share partition capacity', gotcha: true },
            { text: 'Sparse GSI: only items with the indexed attribute appear — filter without scanning the full table', examTip: true },
          ],
          bestPractices: [
            { pillar: 'performance', text: 'Design partition keys for maximum cardinality and even distribution — use composite keys like userId+timestamp or add a random suffix (write sharding) for write-heavy hot keys', detail: 'Hot partitions are the #1 cause of DynamoDB throttling in production' },
            { pillar: 'performance', text: 'Document all access patterns before designing the table — DynamoDB schema is access-pattern driven, unlike relational design which is entity driven' },
            { pillar: 'cost-optimization', text: 'Use sparse GSIs for filtering a small subset of items (e.g., only pending orders) — only indexed items consume GSI storage, making queries cheap and selective' },
            { pillar: 'operational-excellence', text: 'Use DynamoDB Streams + Lambda for event-driven side effects (notifications, search indexing, audit logs) rather than synchronous dual-writes from application code' },
          ],
          useCases: [
            {
              scenario: 'A social media app stores posts with userId as the DynamoDB partition key. A celebrity user with 10M followers generates 50,000 writes/second to their partition during a viral event, causing sustained ProvisionedThroughputExceededException errors.',
              wrongChoices: ['Increase table-level WCU — the limit is per partition (1,000 WCU), not per table', 'Switch to On-Demand mode — still limited to 1,000 WCU per partition'],
              correctChoice: 'Write sharding: append a random suffix (0-9) to the userId partition key on write, then scatter-gather across all 10 shards on read. Reduces per-partition write rate by 10x.',
              reasoning: 'Hot partitions are a fundamental DynamoDB constraint (1,000 WCU per partition). Neither On-Demand nor increased provisioning fixes hot partitions — you must distribute writes across multiple partition key values.',
            },
          ],
        },
        {
          id: 'db-dynamo-indexes',
          title: 'DynamoDB Indexes (LSI vs GSI)',
          content: '**Local Secondary Index (LSI)**: Same partition key as base table, different sort key. Must be created at table creation — cannot add later. Shares provisioned throughput with base table. Eventual or strongly consistent reads. Max 5 LSIs per table. Useful for alternate sort orders within the same partition.\n\n**Global Secondary Index (GSI)**: Different partition key (and optional sort key) from base table. Can be created or deleted at any time. Has its own provisioned throughput (separate from base table). Eventually consistent only. Max 20 GSIs per table. Enables entirely new access patterns.\n\n**GSI overloading**: Use a single GSI with generic PK/SK attribute names (e.g., `gsi1pk`, `gsi1sk`) populated with different values per entity type. Enables multiple access patterns on one GSI.\n\n**Projection**: Which attributes to project into the index: ALL (full copy, more storage), KEYS_ONLY (base table keys only), INCLUDE (specific attributes). Projecting less reduces index size and cost but requires fetching non-projected attributes from base table (expensive).',
          keyPoints: [
            { text: 'LSI: must be created at table creation, shares table RCU/WCU, supports strong consistency', examTip: true },
            { text: 'GSI: can be added anytime, separate RCU/WCU, eventual consistency only — GSI throttling does NOT throttle base table writes (but backpressure can occur)', gotcha: true },
            { text: 'GSI with ALL projection doubles storage cost but avoids expensive reads back to base table', examTip: true },
          ],
          comparisons: [
            {
              headers: ['Feature', 'LSI', 'GSI'],
              rows: [
                ['PK', 'Same as base table', 'Different from base table'],
                ['Creation', 'At table creation only', 'Anytime (add/delete)'],
                ['Throughput', 'Shares with base table', 'Own provisioned capacity'],
                ['Consistency', 'Strong or eventual', 'Eventual only'],
                ['Max per table', '5', '20'],
                ['Use case', 'Alternate sort on same PK', 'Entirely new access patterns'],
              ],
            },
          ],
        },
        {
          id: 'db-dynamo-capacity',
          title: 'DynamoDB Capacity Modes & Transactions',
          content: '**Provisioned Mode**: Specify RCU and WCU in advance. Auto Scaling adjusts capacity based on utilization targets (not instantaneous — takes minutes). Cheaper for predictable workloads. Burst capacity available (consume accumulated burst for 5 minutes, 300s of unused capacity).\n\n**On-Demand Mode**: Pay per request ($1.25/million write request units, $0.25/million read request units — 2.5× more expensive than provisioned at sustained load). Scales instantly. No capacity planning. Use for unpredictable traffic or new tables without known load patterns.\n\n**Read Capacity Units (RCU)**: 1 RCU = 1 strongly consistent read OR 2 eventually consistent reads of items up to 4KB. Larger items consume more RCUs (ceil to 4KB boundary).\n\n**Write Capacity Units (WCU)**: 1 WCU = 1 write of item up to 1KB. Larger items consume more WCUs (ceil to 1KB boundary).\n\n**DynamoDB Transactions**: `TransactWriteItems` and `TransactGetItems` — atomic, consistent, isolated operations across up to 100 items or 4MB. Consumes 2× normal capacity (transaction coordinator overhead). Cannot span tables (use same table only). Use for financial operations, inventory management, distributed counters.\n\n**DynamoDB Streams**: Ordered log of item-level changes. Retention: 24 hours. Lambda trigger via event source mapping. Use cases: cross-region replication (Global Tables), search index synchronization (OpenSearch), audit logs, real-time aggregations.\n\n**DynamoDB Global Tables**: Multi-region, multi-active (read-write in each region). Last-write-wins conflict resolution. Requires DynamoDB Streams. Propagation typically <1s between regions. No global transactions — eventual consistency across regions.',
          keyPoints: [
            { text: 'On-Demand is ~2.5× more expensive than provisioned at steady load — use provisioned + Auto Scaling for predictable workloads', examTip: true },
            { text: 'Transactions consume 2× capacity units — factor this into capacity planning for transactional workloads', gotcha: true },
            { text: 'DynamoDB Streams retention is only 24 hours — design consumers to process within this window', examTip: true },
            { text: 'Global Tables: multi-active (any region can write). Last-writer-wins — no conflict merging. Not ACID across regions', examTip: true },
          ],
        },
        {
          id: 'db-dynamo-dax',
          title: 'DynamoDB Accelerator (DAX)',
          content: '**DAX** is an in-memory cache cluster for DynamoDB. Microsecond read latency (vs single-digit millisecond). Fully API-compatible — drop-in replacement with SDK change. Cluster of 1-10 nodes (odd number recommended for quorum). Deployed in VPC.\n\n**Item cache**: Caches individual GetItem/BatchGetItem responses. TTL configurable (default 5 minutes).\n\n**Query cache**: Caches Query and Scan results. Separate TTL.\n\n**When DAX helps**: Read-heavy workloads with repeated reads of same items. Latency-sensitive applications. Burst reads.\n\n**When DAX does NOT help**:\n- Write-heavy workloads (writes go through DAX to DynamoDB — no write acceleration)\n- Strongly consistent reads (must bypass DAX, go directly to DynamoDB)\n- Large scan operations (cache thrashing)\n- Rarely repeated reads (cache miss rate too high)\n\n**Security**: DAX clusters support encryption at rest (KMS) and in transit (TLS). IAM policy controls access to DAX cluster. DAX uses its own IAM role to call DynamoDB.',
          keyPoints: [
            { text: 'DAX does NOT accelerate strongly consistent reads — these bypass the cache entirely', gotcha: true },
            { text: 'DAX does NOT help write-heavy workloads. It only caches reads. Writes flow through DAX to DynamoDB unchanged', gotcha: true },
            { text: 'DAX is in VPC — Lambda or EC2 must be in same VPC (or peered VPC) to use DAX', examTip: true },
          ],
        },
      ],
    },
    {
      id: 'db-elasticache',
      title: 'ElastiCache: Redis vs Memcached',
      sections: [
        {
          id: 'db-cache-compare',
          title: 'Redis vs Memcached Decision Framework',
          content: '**ElastiCache for Redis**: Rich data structures (strings, hashes, lists, sets, sorted sets, bitmaps, HyperLogLog, streams). Persistence (RDB snapshots, AOF). Pub/Sub messaging. Lua scripting. Geospatial commands. Multi-AZ with auto-failover. Read replicas. Cluster mode (sharding across multiple shards). Redis AUTH + TLS.\n\n**ElastiCache for Memcached**: Simple key-value store. Multi-threaded (better CPU utilization on large instances). Auto Discovery for node discovery. Horizontal scaling (add/remove nodes). No persistence, no replication, no pub/sub. Pure caching use case only.\n\n**Redis Cluster Mode**: Data sharded across up to 500 shards. Each shard: 1 primary + up to 5 read replicas. Cluster mode disabled: single shard (up to 500GB), can scale read replicas. Cluster mode enabled: scales both reads and writes by adding shards.\n\n**Use Redis when**: Persistence required (survive restart), pub/sub messaging, sorted sets (leaderboards), Lua transactions, multi-AZ failover, complex data structures, session store with HA.\n\n**Use Memcached when**: Simplest possible cache, multi-threaded performance critical, no persistence needed, want easy horizontal scaling, existing Memcached application migration.',
          keyPoints: [
            { text: 'Redis supports persistence, replication, pub/sub, and complex data types. Memcached is pure cache — no persistence or replication', examTip: true },
            { text: 'Redis sorted sets enable leaderboards/rate limiting in O(log N). Exam often asks about this specific use case', examTip: true },
            { text: 'Memcached is multi-threaded — can use all CPU cores on large instances. Redis (single-threaded core) cannot', examTip: true },
            { text: 'Redis Cluster Mode Enabled: shards writes across multiple nodes. Cluster Mode Disabled: single shard (read replicas only for scale)', examTip: true },
          ],
          bestPractices: [
            { pillar: 'reliability', text: 'Enable Multi-AZ with automatic failover for Redis in production — a single-node Redis cluster losing its primary causes complete cache unavailability', detail: 'Application must handle cache misses gracefully during failover (≈30s)' },
            { pillar: 'reliability', text: 'Always design the application to handle Redis cache misses — never architect a system where cache unavailability causes complete outage (cache stampede protection)' },
            { pillar: 'performance', text: 'Use Redis Cluster Mode Enabled (sharding) when single-shard dataset exceeds ~200GB or when write throughput exceeds single-node capacity' },
            { pillar: 'security', text: 'Enable Redis AUTH and in-transit encryption (TLS) for all production clusters — ElastiCache Redis is VPC-only but defense-in-depth requires auth even within the VPC' },
            { pillar: 'cost-optimization', text: 'Set appropriate TTLs on all cached objects and monitor eviction metrics — high eviction rates indicate under-provisioned cache size, leading to excessive DB load' },
          ],
          useCases: [
            {
              scenario: 'A gaming leaderboard needs to rank 10 million players in real-time, support "get rank of player X", and return "top 100 players" queries in under 10ms.',
              wrongChoices: ['RDS with ORDER BY queries — full table scans at 10M rows are too slow', 'DynamoDB with scan + sort — scans are expensive and slow at scale', 'Memcached — no sorted set data structure'],
              correctChoice: 'ElastiCache Redis sorted sets: ZADD to update scores, ZRANK to get a player\'s rank, ZREVRANGE to get top-N players — all O(log N) operations.',
              reasoning: 'Redis sorted sets are purpose-built for ranked data. O(log N) operations against an in-memory dataset delivers consistent sub-millisecond performance regardless of dataset size.',
            },
          ],
          comparisons: [
            {
              headers: ['Feature', 'Redis', 'Memcached'],
              rows: [
                ['Data structures', 'Rich (sorted sets, lists, etc.)', 'Simple key-value only'],
                ['Persistence', 'Yes (RDB/AOF)', 'No'],
                ['Replication/HA', 'Yes (Multi-AZ failover)', 'No'],
                ['Pub/Sub', 'Yes', 'No'],
                ['Horizontal write scale', 'Yes (cluster sharding)', 'Yes (add nodes)'],
                ['Multi-threaded', 'No (single-threaded core)', 'Yes'],
                ['Use case', 'Sessions, leaderboards, queues, cache', 'Pure caching only'],
              ],
            },
          ],
        },
        {
          id: 'db-cache-patterns',
          title: 'Caching Patterns & Strategies',
          content: '**Lazy Loading (Cache-Aside)**: App checks cache first. On cache miss, read from DB, then write to cache. Pros: only cache what is requested, resilient to node failures. Cons: 3 trips on cache miss, stale data possible.\n\n**Write-Through**: On DB write, also write to cache. Pros: cache always up-to-date. Cons: write penalty (2 writes), data written to cache may never be read (wasted memory), cache churn on write-heavy workloads.\n\n**Write-Behind (Write-Back)**: Write to cache, asynchronously flush to DB. Pros: low write latency. Cons: risk of data loss if cache fails before flush. Rarely used in AWS architectures.\n\n**TTL**: Always set TTL to prevent stale data. Too short = high DB load. Too long = stale data risk. Consider cache invalidation on update as alternative.\n\n**Session Store Pattern**: User session data in Redis with TTL. Application tier is stateless. Auto-scales freely. Redis Multi-AZ ensures sessions survive node failure.\n\n**Rate Limiting Pattern**: Redis INCR + EXPIRE. Increment counter per user/IP per time window. Atomic operation ensures accurate counting. Sorted sets for sliding window rate limiting.',
          keyPoints: [
            { text: 'Lazy loading: only caches requested data. Write-through: caches everything written — may waste memory on write-heavy workloads', examTip: true },
            { text: 'Session store in Redis + stateless app tier = enables horizontal auto-scaling without sticky sessions', examTip: true },
            { text: 'Redis INCR is atomic — safe for distributed rate limiting without race conditions', examTip: true },
          ],
        },
      ],
    },
    {
      id: 'db-specialty',
      title: 'Specialty Databases',
      sections: [
        {
          id: 'db-specialty-types',
          title: 'Purpose-Built Database Selection',
          content: '**Amazon Redshift**: Columnar MPP data warehouse. Petabyte scale. SQL-compatible. Redshift Spectrum: query S3 data without loading. Materialized views. RA3 nodes: managed storage in S3 (decouple compute from storage). Concurrency Scaling: burst additional clusters for peak read queries. Cross-AZ NOT supported (single-AZ). Backup to S3 automatically.\n\n**Amazon OpenSearch Service**: Elasticsearch-compatible. Full-text search, log analytics, operational dashboards. Not a primary database — typically a search replica. Deploy in 3 AZ for HA. Managed service handles cluster provisioning, patching.\n\n**Amazon Neptune**: Graph database. TinkerPop (Gremlin) and SPARQL (RDF) query languages. Multi-AZ, read replicas, automated backups. Use cases: social networks, fraud detection, knowledge graphs, recommendation engines, identity graphs.\n\n**Amazon DocumentDB**: MongoDB-compatible document database. NOT a MongoDB fork — uses Aurora storage engine under the hood. Supports MongoDB 3.6/4.0/5.0 API. Multi-AZ, up to 15 read replicas. Use when migrating MongoDB workloads to managed service.\n\n**Amazon Keyspaces**: Serverless, Apache Cassandra-compatible. Pay per request. Use for IoT, time-series, existing Cassandra workloads.\n\n**Amazon Timestream**: Purpose-built time-series database. Stores and analyzes trillions of events per day. Automatic tiering (memory → magnetic storage). Scheduled queries for continuous aggregate computations. Use for IoT sensor data, metrics, application performance data.\n\n**Amazon QLDB**: Quantum Ledger Database. Immutable, cryptographically verifiable transaction log. SQL-like API (PartiQL). Serverless. Use for audit trails, financial transactions, supply chain provenance — where you need proof of data history that cannot be altered.',
          keyPoints: [
            { text: 'Redshift is single-AZ — not HA within a region without additional clusters. Concurrency Scaling adds burst capacity, not HA', gotcha: true },
            { text: 'Neptune for graph queries (social connections, fraud rings, recommendations) — not for tabular or document data', examTip: true },
            { text: 'QLDB for immutable audit trail with cryptographic proof. DocumentDB for MongoDB migration. Keyspaces for Cassandra migration', examTip: true },
            { text: 'Timestream automatically tiers data: recent data in memory, historical in magnetic — cost-optimized time-series at scale', examTip: true },
          ],
          comparisons: [
            {
              headers: ['Database', 'Type', 'Query Language', 'Primary Use Case'],
              rows: [
                ['RDS/Aurora', 'Relational', 'SQL', 'OLTP, structured data'],
                ['DynamoDB', 'Key-Value/Document', 'API/PartiQL', 'High-scale OLTP, serverless'],
                ['ElastiCache', 'In-memory cache', 'Redis/Memcached API', 'Sub-ms caching, sessions'],
                ['Redshift', 'Columnar warehouse', 'SQL', 'OLAP, analytics, BI'],
                ['OpenSearch', 'Search/Analytics', 'REST/Query DSL', 'Full-text search, log analytics'],
                ['Neptune', 'Graph', 'Gremlin/SPARQL', 'Relationships, social, fraud'],
                ['DocumentDB', 'Document', 'MongoDB API', 'JSON documents, MongoDB migration'],
                ['QLDB', 'Ledger', 'PartiQL', 'Immutable audit log'],
                ['Timestream', 'Time-series', 'SQL', 'IoT, metrics, telemetry'],
              ],
            },
          ],
        },
        {
          id: 'db-migration',
          title: 'Database Migration Strategies',
          content: '**AWS Database Migration Service (DMS)**: Migrates data to/from homogeneous (Oracle→Oracle) or heterogeneous (Oracle→Aurora) databases. Replication instance runs the migration tasks. Supports full load, full load + ongoing CDC (Change Data Capture), CDC only.\n\n**Schema Conversion Tool (SCT)**: Converts database schema and application code from one engine to another (Oracle DDL → PostgreSQL DDL). Use BEFORE DMS for heterogeneous migrations. SCT assessment report shows what requires manual conversion.\n\n**DMS for ongoing replication**: DMS can run CDC indefinitely, keeping source and target in sync during cutover window. Use to minimize downtime by migrating while source remains live, then cut over when lag approaches zero.\n\n**DMS Sources & Targets**: Sources include Oracle, SQL Server, MySQL, PostgreSQL, MongoDB, S3, SAP. Targets include Aurora, RDS, Redshift, DynamoDB, S3, OpenSearch, Kinesis, DocumentDB.\n\n**DMS Limitations**: Does not migrate stored procedures/triggers/functions (use SCT). DMS does not validate data integrity — use AWS DMS data validation task separately. For very large databases (10+ TB), use Snowball Edge to bulk load then DMS for CDC delta.',
          keyPoints: [
            { text: 'DMS for data migration. SCT for schema conversion. Both together for heterogeneous DB engine migrations', examTip: true },
            { text: 'DMS CDC keeps source and target in sync during migration — minimizes downtime by cutting over when lag ≈ 0', examTip: true },
            { text: 'For very large DBs, Snowball Edge for bulk data + DMS CDC for ongoing changes = minimal downtime large migration', examTip: true },
            { text: 'DMS does NOT migrate stored procedures, triggers, or views — use SCT for schema objects', gotcha: true },
          ],
        },
      ],
    },
  ],
};
